<?php

class User {
	public $id;
	public $name;
	public $jwt;
	
	public function authorize( $header, $secrets ) {

		// Get and split authorization header
		$authorization_type = '';
		$authorization_token = '';
		if (isset($header) && $header) {
			$authorization = explode(' ', $header);
			$authorization_type = $authorization[0];
			$authorization_token = $authorization[1];
		}

		// Check if secret keys are passed to the function
		if (!$secrets || !is_array($secrets)) {
			return([
				'status' => 0,
				'error' => 'KEY_MISSING',
			]);
		}

		// If the authorization header contains a username and password, try
		// logging in the user using these credentials
		if ($authorization_type === 'Basic') {
			$username_password_array = explode('.', base64_decode($authorization_token), 2);

			$login_details = $this->log_in(
				$username_password_array[0], 
				$username_password_array[1],
				$secrets
			);

			if ($login_details['status'] === 1) {
				return( $login_details );
			}
		}

		// If the authorization header contains a JWT, check if it's valid and
		// not expired
		if ($authorization_type === 'Bearer') {
			$token_validation = $this->validate_jwt($authorization_token, $secrets['access_token_secret']);

			if ($token_validation['status'] === 1) {
				$payload = $token_validation['payload'];
				$this->id = $payload['id'];
				$this->name = $payload['name'];

				return([
					'status' => 1,
					'id' => $payload['id'],
					'name' => $payload['name'],
				]);
			}
			else {
				return([
					'status' => 0,
					'error' => $token_validation['error'],
				]);
			}
		}

		// No Basic or Bearer authentication token ... Do we have a refresh token cookie?
		if (isset($_COOKIE['refresh_token']) && $_COOKIE['refresh_token']) {
			$token_validation = $this->validate_jwt($_COOKIE['refresh_token'], $secrets['refresh_token_secret']);

			if ($token_validation['status'] === 1) {
				$payload = $token_validation['payload'];
				$this->id = $payload['id'];
				$this->name = $payload['name'];

				$this->set_jwts($payload['id'], $payload['name'], $secrets, false);
				
				return([
					'status' => 1,
					'id' => $payload['id'],
					'name' => $payload['name'],
					'accessToken' => $this->jwt,
				]);
			}
			else {
				return([
					'status' => 0,
					'error' => $token_validation['error'],
				]);
			}
		}

		// No valid login method found, return an error
		return([
			'status' => 0,
			'error' => 'USER_NOT_AUTHORIZED',
		]);
	}

	public function log_out() {
		// This deletes the refresh token.
		// In addition to calling $user->log_out(), you should set
		// $c['accessToken'] to an empty string.

		setcookie('refresh_token', '', [
			'expires' => time() - 3600,
			'path' => '/',
			'secure' => true,
			'httponly' => true,
			'samesite' => 'None'
		]);
	}

	private function log_in( $username, $password, $secrets ) {

		// Check if username exists 
		$encrypted_username = hash_hmac('sha512', $username, $secrets['user_salt']);
		$stmt = $conn->prepare('SELECT id, password, salt FROM ba_users WHERE username = ?');
		$stmt->bind_param('s', $encrypted_username);
		$stmt->execute();
		$result = $stmt->get_result();
		$stmt->close();

		if (!$result->num_rows) {
			return([
				'status' => 0,
				'error' => 'WRONG_USERNAME_OR_PASSWORD',
			]);
		}

		// Check if password matches
		$row = $result->fetch_assoc();
		if ($row['password'] !== hash_hmac('sha512', $password, $row['salt'])) {
			return([
				'status' => 0,
				'error' => 'WRONG_USERNAME_OR_PASSWORD',
			]);
		}

		// It does? Great! Return user info.
		$this->set_jwts($new_id, $username, $secrets);

		return([
			'status' => 1,
			'id' => $new_id,
			'name' => $username,
			'accessToken' => $this->jwt,
		]);

	}

	public function create( $conn, $username, $password, $secrets ) {

		// Check that a username and a password are given
		if (!$username || !$password || !$secrets || !is_array($secrets)) {
			return([
				'status' => 0,
				'error' => 'MANDATORY_FIELDS_MISSING',
			]);
		}
		
		// Check if user already exists
		$encrypted_username = hash_hmac('sha512', $username, $secrets['user_salt']);
		$stmt = $conn->prepare('SELECT id FROM ba_users WHERE username = ?');
		$stmt->bind_param('s', $encrypted_username);
		$stmt->execute();
		$result = $stmt->get_result();
		$stmt->close();

		if ($result->num_rows) {
			return([
				'status' => 0,
				'error' => 'USER_EXISTS',
			]);
		}

		// Create password salt
		$random_salt = hash('sha512', uniqid(openssl_random_pseudo_bytes(16), TRUE));

		// Hash the password
		$encrypted_password = hash_hmac('sha512', $password, $random_salt);

		// Insert new the user to database
		$stmt = $conn->prepare('INSERT INTO ba_users (username, password, salt) VALUES(?, ?, ?)');
		$stmt->bind_param('sss', $encrypted_username, $encrypted_password, $random_salt);
		$stmt->execute();
		$new_id = $conn->insert_id;

		$this->set_jwts($new_id, $username, $secrets);

		return([
			'status' => 1,
			'id' => $new_id,
			'name' => $username,
			'accessToken' => $this->jwt,
		]);
	}

	private function generate_jwt( $values, $jwt_secret, $lifespan_days ) {

		$expiration = strtotime(date('Y-m-d', time()) . ' + ' . $lifespan_days . ' day');

		// Header
		$jwt_header = [
			'alg' => 'HS512', 
			'typ' => 'JWT'
		];
		$jwt_payload = [
			"iat" => time(),
			"exp" => $expiration,
			...$values,
		];

		$jwt1 = trim( base64_encode( json_encode( $jwt_header ) ), '=');
		$jwt2 = trim( base64_encode( json_encode( $jwt_payload ) ), '=');

		$jwt3 = trim( base64_encode(hash_hmac('SHA512', $jwt1 . '.' . $jwt2, $jwt_secret, true) ), '=');

		// Generate complete token
		$token = $jwt1 . '.' . $jwt2 . '.' . $jwt3;

		return($token);
	}

	private function validate_jwt( $token, $jwt_secret ) {
		$token_array = explode( '.', $token );

		// Check if token has three parts
		if (count($token_array) !== 3) {
			return([
				'status' => 0,
				'error' => 'INVALID_TOKEN',
			]);
		}

		// Check if JWT is valid
		if ($token_array[2] !== trim( base64_encode(hash_hmac('SHA512', $token_array[0] . '.' . $token_array[1], $jwt_secret, true) ), '=')) {
			return([
				'status' => 0,
				'error' => 'INVALID_TOKEN',
			]);
		}

		// If we reach this point, the token is valid. Get its payload.
		$payload = json_decode(base64_decode($token_array[1]), true);

		// Check if token has expired
		if ($payload['exp'] < time()) {
			return([
				'status' => 0,
				'error' => 'EXPIRED_TOKEN',
			]);
		}

		// It's not? Great! Return payload.
		return([
			'status' => 1,
			'payload' => $payload,
		]);
	}

	private function set_jwts($id, $name, $secrets, $set_refresh_token = true) {
		// Generate access token and save it to variable
		$accessToken = $this->generate_jwt([ 'id' => $id, 'name' => $name ], $secrets['access_token_secret'], 3);
		$this->jwt = $accessToken;

		if ($set_refresh_token) {
			// Set refresh token and save it to cookie
			$refresh_token = $this->generate_jwt([ 'id' => $id, 'name' => $name ], $secrets['refresh_token_secret'], 365);

			setcookie('refresh_token', $refresh_token, [
				'expires' => strtotime(date('Y-m-d', time()) . ' + 365 day'),
				'path' => '/',
				'secure' => true,
				'httponly' => true,
				'samesite' => 'None'
			]);
		}
	}
}