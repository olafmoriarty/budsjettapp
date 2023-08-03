<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Autoload classes
spl_autoload_register( function ($name) {
	include( __DIR__ . '/classes/' . $name . '.php' );
} );

// Get body from submitted json
$body = json_decode(file_get_contents("php://input"), true);

// Get endpoint to open
$endpoint = strtok('/');

// Get http method
$method = $_SERVER['REQUEST_METHOD'];
// Get secret keys
include(__DIR__ . '/secrets.php');

// Connect to MySQL database
$conn = $conn = new mysqli(
	$secrets['mysql_hostname'],
	$secrets['mysql_username'], 
	$secrets['mysql_password'], 
	$secrets['mysql_database']
);

// Array to put content in
$c = [];

// Try authorizing user
$user = new User();
$authorization_header = '';
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
	$authorization_header = $_SERVER['HTTP_AUTHORIZATION'];
}
$auth = $user->authorize($authorization_header, $secrets);

if (!$auth['status']) {
	$c['status'] = $auth['status'];
	$c['error'] = $auth['error'];
}

if (isset($auth['accessToken'])) {
	$c['accessToken'] = $auth['accessToken'];
}

// Run code based on which endpoint is selected

$endpoints = ['user', 'budgets'];

if (in_array( $endpoint, $endpoints )) {
	include(__DIR__ . '/' . $endpoint. '.php');
}
else {
	$c['status'] = 0;
	$c['error'] = 'NO_ENDPOINT_SELECTED';
}

// Output content
include(__DIR__ . '/output.php');