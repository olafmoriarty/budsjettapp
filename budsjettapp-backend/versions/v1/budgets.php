<?php

if ($method === 'GET') {
	$budgets = show_budgets();
	$c = [
		...$c,
		...$budgets,
	];
}

if ($method === 'POST' && isset($_GET['mode']) && $_GET['mode'] === 'create') {
	$create = create_budget();
	$c = [
		...$c,
		...$create,
	];
}

function show_budgets() {
	global $conn, $auth, $secrets, $user;

	if ($auth['status'] !== 1) {
		return ([
			'status' => 0,
			'error' => 'USER_NOT_AUTHENTICATED',
		]);
	}

	$budget_to_show = strtok('/');
	if ($budget_to_show) {
		// Show one budget
	}
	else {
		// Show all budgets user has access to
		$stmt = $conn->prepare('SELECT r.budget, r.role, r.budgetkey, r.iv AS r_iv, b.name, b.iv as b_iv, updated FROM ba_user_budget_rel AS r LEFT JOIN ba_budgets AS b ON r.budget = b.id WHERE r.user = ? ORDER BY r.id');
		$stmt->bind_param('i', $auth['id']);
		$stmt->execute();
		$result = $stmt->get_result();
		$stmt->close();

		$data = [];
		while ($row = $result->fetch_assoc()) {
			// Get budget key
			$budget_keystring = openssl_decrypt($row['budgetkey'], 'aes-256-cbc', $auth['name'] . $secrets['budget_encryption_part'], 0, hex2bin($row['r_iv']));
			$budget_key_array = explode(' ', $budget_keystring);
			
			// Abort script if budget key does not have a valid format - this happens if the username has changed since the user's token was set.
			if (count($budget_key_array) < 2 || $budget_key_array[0] !== 'Budsjett') {
				// Delete cookie, return error
				$user->log_out();
				return [
					'status' => 0,
					'error' => 'USERNAME_CHANGED',
					'accessToken' => '',
				];
			}
			$budget_key = $budget_key_array[1];

			$budget_name = openssl_decrypt($row['name'], 'aes-256-cbc', $budget_key, 0, hex2bin($row['b_iv']));
			$data[] = [
				'id' => $row['budget'],
				'name' => $budget_name,
				'role' => $row['role'],
				'updated' => $row['updated'],
			];
		}
		return [
			'status' => 1,
			'data' => $data,
		];
	}
}

function create_budget() {
	// Get global variables
	global $conn, $auth, $body, $secrets, $user;

	// Check if user is logged in
	if ($auth['status'] !== 1) {
		return [
			'status' => 0,
			'error' => 'USER_NOT_AUTHENTICATED',
		];
	}

	// Check if user has a valid license
	if ( !has_valid_license( $conn, $auth['id'] ) ) {
		// If user haven't gotten a free trial license earlier,
		// give them one now.
		if (!have_received_free_license($conn, $auth['id'])) {
			start_trial($conn, $auth['id']);
		}

		// If not, send an error message to the client.
		else {
			return [
				'status' => 0,
				'error' => 'VALID_LICENSE_REQUIRED',
			];
		}
	}

	// Abort script if username has changed since this token was set
	$stmt = $conn->prepare('SELECT id FROM ba_users WHERE id = ? AND username = ?');
	$hashed_username = hash_hmac('sha512', $auth['name'], $secrets['user_salt']);
	$stmt->bind_param('is', $auth['id'], $hashed_username);
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();

	if (!$result->num_rows) {
	// Delete cookie, return error
		$user->log_out();
		return [
			'status' => 0,
			'error' => 'USERNAME_CHANGED',
			'accessToken' => '',
		];
	}

	// Create budget encryption key
	$budget_key = bin2hex(openssl_random_pseudo_bytes(32));

	// Insert budget into budgets table, encrypt name
	$iv = openssl_random_pseudo_bytes(16);
	$encrypted_name = openssl_encrypt( $body['budget']['name'], 'aes-256-cbc', $budget_key, 0, $iv );

	$stmt = $conn->prepare('INSERT INTO ba_budgets (name, iv) VALUES (?, ?)');
	$iv_hex = bin2hex($iv);
	$stmt->bind_param('ss', $encrypted_name, $iv_hex);
	$stmt->execute();
	$budget_id = $conn->insert_id;
	$stmt->close();

	// Encrypt key using username

	$iv = openssl_random_pseudo_bytes(16);
	$iv_hex = bin2hex($iv);
	$encrypted_budget_key = openssl_encrypt('Budsjett ' . $budget_key, 'aes-256-cbc', $auth['name'] . $secrets['budget_encryption_part'], 0, $iv);

	// Insert budget and encrypted key into user-budget-relation table
	$stmt = $conn->prepare('INSERT INTO ba_user_budget_rel (user, budget, role, budgetkey, iv) VALUES (?, ?, 5, ?, ?)');
	$stmt->bind_param('iiss', $auth['id'], $budget_id, $encrypted_budget_key, $iv_hex);
	$stmt->execute();
	$stmt->close();

	// Call sync budget 

	// ***

	// Return values
	$budget = $body['budget'];
	if (isset($budget['sync'])) {
		unset($budget['sync']);
	}
	$budget['externalId'] = $budget_id;
	return ([
		'status' => 1,
		'data' => [
			'budget' => $budget,
		],
	]);
}



function has_valid_license( $conn, $user_id ) {
	$stmt = $conn->prepare( 'SELECT id FROM ba_licenses WHERE user = ? AND expires > NOW()' );
	$stmt->bind_param('i', $user_id);
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();
	$num = $result->num_rows;

	if ($num) {
		return true;
	}
	return false;
} // has_valid_license()

function have_received_free_license( $conn, $user_id ) {
	$stmt = $conn->prepare( 'SELECT id FROM ba_licenses WHERE user = ? AND licensetype = 0' );
	$stmt->bind_param('i', $user_id);
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();
	$num = $result->num_rows;

	if ($num) {
		return true;
	}
	return false;
}

function start_trial( $conn, $user_id ) {
	// Trial expires in 90 days
	$timestamp = time() + (60 * 60 * 24 * 90);
	$expiry_date = str_replace('T', ' ', date('c', $timestamp));

	$stmt = $conn->prepare( 'INSERT INTO ba_licenses ( user, licensetype, expires ) VALUES ( ?, 0, ? )' );
	$stmt->bind_param('is', $user_id, $expiry_date);
	$stmt->execute();
	$stmt->close();
}