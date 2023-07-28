<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Autoload classes
spl_autoload_register( function ($name) {
	include( __DIR__ . '/classes/' . $name . '.php' );
} );

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

if (isset($auth['access_token'])) {
	$c['accessToken'] = $auth['access_token'];
}
// Output content
include(__DIR__ . '/output.php');