<?php

if (isset($_GET['mode']) && $_GET['mode'] === 'create') {
	if (!$body || !isset($body['username']) || !isset($body['password']) || !$body['username'] || !$body['password']) {
		$c['status'] = 0;
		$c['error'] = 'MANDATORY_FIELDS_MISSING';
	}
	else {
		$new_user = $user->create($conn, $body['username'], $body['password'], $secrets);
		if (!$new_user['status']) {
			$c['status'] = 0;
			$c['error'] = $new_user['error'];
		}
		else {
			if (isset($c['error'])) {
				unset($c['error']);
			}
			$c['status'] = 1;
			$c['accessToken'] = $new_user['accessToken'];
		}
	}
}