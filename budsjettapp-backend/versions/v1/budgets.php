<?php

if ($method === 'GET') {
	$budgets = show_budgets();
	$c = [
		...$c,
		...$budgets,
	];
}

if ($method === 'POST') {
	$budget_to_show = strtok('/');
	$create = create_budget();
	$c = [
		...$c,
		...$create,
	];
}

if ($method === 'PATCH') {
	$budget_to_show = strtok('/');

	$sync = sync_budget($budget_to_show);
	$c = [
		...$c,
		...$sync,
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
		return sync_budget(intval($budget_to_show));
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

	$sync = sync_budget($budget_id, $budget_key);
	
	if (!$sync['status']) {
		return($sync);
	}
	// Return values
	$budget = $sync['data']['budget'];
	if (isset($budget['sync'])) {
		unset($budget['sync']);
	}
	$budget['externalId'] = $budget_id;

	$sync['data']['budget'] = $budget;
	return ([
		'status' => 1,
		'data' => $sync['data'],
	]);
}

function sync_budget($budget_id, $budget_key = '') {
	global $conn, $auth, $body, $secrets, $user;

	// Check that budget ID is valid
	if (!$budget_id || !preg_match('/^\d+$/', $budget_id)) {
		return [
			'status' => 0,
			'error' => 'INVALID_BUDGET_ID',
		];
	}

	// Check that the correct parameters exist in the body
	if ($_SERVER['REQUEST_METHOD'] !== 'GET' && (!$body || !is_array($body) || !isset($body['budget']) || !is_array($body['budget']) || !isset($body['budget']['device']))) {
		return [
			'status' => 0,
			'error' => 'MANDATORY_FIELDS_MISSING',
		];
	}

	// When creating a new budget, it is possible to call this function to
	// sync it directly. In that case we already have authenticated the user and
	// know the budget key, so we don't need to do that again.
	if (!$budget_key) {
		// Check if user is logged in
		if ($auth['status'] !== 1) {
			return [
				'status' => 0,
				'error' => 'USER_NOT_AUTHENTICATED',
			];
		}

		// Check if user has access to budget
		$stmt = $conn->prepare('SELECT budgetkey, iv FROM ba_user_budget_rel WHERE user = ? and budget = ?');
		$stmt->bind_param('ii', $auth['id'], $budget_id);
		$stmt->execute();
		$result = $stmt->get_result();
		$stmt->close();
		$num = $result->num_rows;
		if (!$num) {
			return [
				'status' => 0,
				'error' => 'USER_NOT_AUTHORIZED',
			];
		}

		// They do! Get the budget key, then.
	
		$arr = $result->fetch_assoc();
		$budget_keystring = openssl_decrypt($arr['budgetkey'], 'aes-256-cbc', $auth['name'] . $secrets['budget_encryption_part'], 0, hex2bin($arr['iv']));
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
	}

	// Create a variable to store rows in
	$return_value = [];

	// Set names of IndexedDB stores
	$stores = [
		'accounts',
		'categories',
		'payees',
		'transactions',
		'budgeted',
	];
	$storecount = count($stores);

	// Get all transaction rows that have changed since last sync
	$last_sync_date = '1970-01-01 00:00:01';
	if (isset($body) && isset($body['budget']) && isset($body['budget']['lastSyncDate'])) {
		$last_sync_date = $body['budget']['lastSyncDate'];
	}
	$stmt = $conn->prepare('SELECT id, store_type, idcheck, value, iv FROM ba_content WHERE budget_id = ? AND updated > ?');
	$stmt->bind_param('is', $budget_id, $last_sync_date);
	$stmt->execute();
	$result = $stmt->get_result();
	$stmt->close();

	$return_value['rowcount'] = $result->num_rows;

	// For each row:
	while ($row = $result->fetch_assoc()) {
		// Decrypt it
		$value = json_decode(openssl_decrypt($row['value'], 'aes-256-cbc', $budget_key, 0, hex2bin($row['iv'])), true);

		// Add external ID in case it's missing
		$value['externalId'] = $row['id'];

		// Put the row in the correct store in the return array
		$store = $stores[$row['store_type'] - 1];
		if (!isset($return_value[$store])) {
			$return_value[$store] = [];
		}
		$return_value[$store][] = $value;
	}

	// Set current timestamp
	$timestamp = date('Y-m-d H:i:s') . substr( microtime(), 1, 4 );

	// If this is just a GET request, we can abort here and return the values,
	// without inserting anything.

	if ($_SERVER['REQUEST_METHOD'] === 'GET') {

		// Get budget information
		$stmt = $conn->prepare('SELECT name, iv FROM ba_budgets WHERE id = ?');
		$stmt->bind_param('i', $budget_id);
		$stmt->execute();
		$result = $stmt->get_result();
		$stmt->close();
		if (!$result->num_rows) {
			return ([
				'status' => 0,
				'error' => 'BUDGET_NOT_FOUND',
			]);
	
		}

		$row = $result->fetch_assoc();
		$budget_row['lastSyncDate'] = $timestamp;
		$return_value['budget'] = [
			'name' => openssl_decrypt($row['name'], 'aes-256-cbc', $budget_key, 0, hex2bin($row['iv'])),
			'externalId' => $budget_id,
			'lastSyncDate' => $timestamp,
		];
	
	
		return ([
			'status' => 1,
			'data' => $return_value,
		]);
	
	}

	// Now that we have fetched the new data that was in the database, let's
	// move on to inserting data, one store at a time:

	$external_ids = [];

	for ($i = 0; $i < $storecount; $i++) {
		// If store does not exist in body, skip it
		if (!$body[ $stores[$i] ]) {
			continue;
		}

		// Loop through submitted store
		foreach ($body[ $stores[$i] ] as $row) {
			
			// Row should be an array, skip if it's not
			if (!is_array($row)) {
				continue;
			}

			// Get something to identify the row (added because the "budgeted" store does not have an id field)
			$row_identifier = $stores[$i] == 'budgeted' ? $row['category'] . '-' . $row['month'] : $row['id'];

			// The row to insert should be identical to the uploaded row
			// except it shouldn't have a local or external id and it
			// shouldn't have the "sync" flag
			$row_copy = $row;
			if (isset($row_copy['id'])) {
				unset($row_copy['id']);
			}
			if (isset($row_copy['externalId'])) {
				unset($row_copy['externalId']);
			}
			if (isset($row_copy['sync'])) {
				unset($row_copy['sync']);
			}

			if ($stores[$i] === 'budgeted') {
				if ( isset($row['category']) && isset($external_ids['categories'][ $row['category'] ]) ) {
					$row_copy['exCategory'] = $external_ids['categories'][ $row['category'] ];
				}
				if (isset($row_copy['category'])) {
					unset($row_copy['category']);
				}
			}

			if ($stores[$i] === 'categories') {
				if ( isset($row['parent']) && isset($external_ids['categories'][ $row['parent'] ]) ) {
					$row_copy['exParent'] = $external_ids['categories'][ $row['parent'] ];
				}
				if (isset($row_copy['parent'])) {
					unset($row_copy['parent']);
				}
			}

			$reset_counter = 0;

			if ($stores[$i] === 'transactions') {
				if ( isset($row['categoryId']) && isset($external_ids['categories'][ $row['categoryId'] ]) ) {
					$row_copy['exCategoryId'] = $external_ids['categories'][ $row['categoryId'] ];
				}
				if ( isset($row['accountId']) && isset($external_ids['accounts'][ $row['accountId'] ]) ) {
					$row_copy['exAccountId'] = $external_ids['accounts'][ $row['accountId'] ];
				}
				if ( isset($row['payeeId']) && isset($external_ids['payees'][ $row['payeeId'] ]) ) {
					$row_copy['exPayeeId'] = $external_ids['payees'][ $row['payeeId'] ];
				}
				if ( isset($row['counterAccount']) && isset($external_ids['accounts'][ $row['counterAccount'] ]) ) {
					$row_copy['exCounterAccount'] = $external_ids['accounts'][ $row['counterAccount'] ];
				}
				if ( isset($row['counterTransaction']) && isset($external_ids['transactions'][ $row['counterTransaction'] ]) ) {
					$row_copy['exCounterTransaction'] = $external_ids['transactions'][ $row['counterTransaction'] ];
					$reset_counter = $external_ids['transactions'][ $row['counterTransaction'] ];
				}
				if ( isset($row['parentTransaction']) && isset($external_ids['transactions'][ $row['parentTransaction'] ]) ) {
					$row_copy['exParentTransaction'] = $external_ids['transactions'][ $row['parentTransaction'] ];
				}
				foreach (['accountId', 'categoryId', 'payeeId', 'counterAccount', 'counterTransaction', 'parentTransaction'] as $field) {
					if (isset($row_copy[$field]) && ($field !== 'categoryId' || $row_copy[$field] !== 0)) {
						unset($row_copy[$field]);
					}
				}
			}
			// Encrypt row
			$iv = openssl_random_pseudo_bytes(16);
			$iv_hex = bin2hex($iv);
			$encrypted_row = openssl_encrypt( json_encode($row_copy), 'aes-256-cbc', $budget_key, 0, $iv );

			// Check if row already exists in database

			// If it exists, it should have externalId set, but just in
			// case an error has occured so that the local object has not
			// received one, we also generate an extra check based on its
			// content.
			$idcheck = md5( $body['budget']['device'] . $stores[ $i ] . $row_identifier);
			$external_id = -1;
			if (isset($row['externalId'])) {
				$external_id = $row['externalId'];
			}
			$stmt = $conn->prepare('SELECT id FROM ba_content WHERE (budget_id = ? AND id = ?) OR (budget_id = ? AND idcheck = ?)');
			$stmt->bind_param('iiis', $budget_id, $external_id, $budget_id, $idcheck);
			$stmt->execute();
			$result = $stmt->get_result();
			$stmt->close();
			$num = $result->num_rows;

			$new_external_id = 0;

			// If row does exist, update it!
			if ($num) {
				$existing_row = $result->fetch_assoc();
				$new_external_id = $existing_row['id'];
				
				$stmt = $conn->prepare('UPDATE ba_content SET value = ?, iv = ?, updated = ? WHERE id = ?');
				$stmt->bind_param('sssi', $encrypted_row, $iv_hex, $timestamp, $new_external_id);
				$stmt->execute();
				$stmt->close();

			}

			// If not, insert it!
			else {
				$stmt = $conn->prepare('INSERT INTO ba_content (budget_id, store_type, idcheck, value, iv, updated) VALUES (?, ?, ?, ?, ?, ?)');
				$store_type = $i + 1;
				$stmt->bind_param('iissss', $budget_id, $store_type, $idcheck, $encrypted_row, $iv_hex, $timestamp);
				$stmt->execute();
				$new_external_id = $conn->insert_id;
				$stmt->close();
			}

			if (!isset($row['externalId']) || !$row['externalId']) {
				if (!isset($external_ids[ $stores[$i] ])) {
					$external_ids[ $stores[$i] ] = [];
				}
				$external_ids[ $stores[$i] ][ $row_identifier ] = $new_external_id;
			}

			// If this is a transaction with a countertransaction, update its counter
			if ($reset_counter) {
				$stmt = $conn->prepare('SELECT value, iv FROM ba_content WHERE id = ?');
				$stmt->bind_param('i', $reset_counter);
				$stmt->execute();
				$result = $stmt->get_result();
				$stmt->close();

				if ($result->num_rows) {
					$counter_row = $result->fetch_assoc();
					$counter_value = json_decode(openssl_decrypt($counter_row['value'], 'aes-256-cbc', $budget_key, 0, hex2bin($counter_row['iv'])), true);
					$counter_value['exCounterTransaction'] = $new_external_id;
					$new_counter_value = openssl_encrypt( json_encode($counter_value), 'aes-256-cbc', $budget_key, 0, hex2bin($counter_row['iv']));
					$stmt = $conn->prepare('UPDATE ba_content SET value = ? WHERE id = ?');
					$stmt->bind_param('si', $new_counter_value, $reset_counter);
					$stmt->execute();
					$stmt->close();
					
				}
			}

			// Add new external ID to input row
			$row['externalId'] = $new_external_id;
			if (isset($row['sync'])) {
				unset($row['sync']);
			}

			if (!isset($return_value[$stores[$i]])) {
				$return_value[$stores[$i]] = [];
			}
			$return_value[$stores[$i]][] = $row;
		}
	}

	// Check if budget file needs updating
	$budget_row = $body['budget'];
	if (isset($budget_row['sync']) && $budget_row['sync'] && isset($budget_row['name'])) {
		$iv = openssl_random_pseudo_bytes(16);
		$iv_hex = bin2hex($iv);
		$encrypted_name = openssl_encrypt( $budget_row['name'], 'aes-256-cbc', $budget_key, 0, $iv );
		$updated_no_decimals = substr($timestamp, 0, 19);

		$stmt = $conn->prepare('UPDATE ba_budgets SET name = ?, iv = ?, updated = ? WHERE id = ?');
		$stmt->bind_param('sssi', $encrypted_name, $iv_hex, $updated_no_decimals, $budget_id);
		$stmt->execute();
		$stmt->close();
		unset($budget_row['sync']);
	}
	$budget_row['lastSyncDate'] = $timestamp;
	$return_value['budget'] = $budget_row;


	return ([
		'status' => 1,
		'data' => $return_value,
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