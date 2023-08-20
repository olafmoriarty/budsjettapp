<?php

$okOrigins = [
	'budsjett.app',
	'www.budsjett.app',
	'localhost',
	'testversjon.budsjett.app'
];
if (isset($_SERVER['HTTP_REFERER'])) {
	$url_host = parse_url($_SERVER['HTTP_REFERER'], PHP_URL_HOST);
}
if (isset($url_host) && in_array($url_host, $okOrigins)) {
	$origin = parse_url($_SERVER['HTTP_REFERER'], PHP_URL_SCHEME) . '://' . $url_host;
	if ($url_host == 'localhost') {
		$origin .= ':' . parse_url($_SERVER['HTTP_REFERER'], PHP_URL_PORT);
	}
	header('Access-Control-Allow-Credentials: true');
}
else {
	$origin = 'https://budsjett.app';
}

// Set HTTP headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Accept, Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

// Set HTTP status (adapt to actual content)
header("HTTP/1.0 200 OK");

// Output content as JSON
echo json_encode($c);