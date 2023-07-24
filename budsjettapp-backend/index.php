<?php

// Existing versions of the API
$versions = ['v1'];

// Set API URL 
define('API_URL', strtok($_SERVER['REQUEST_URI'], '?'));

// Which version is the user trying to access?
$version = strtok(API_URL, '/');

// Exit script if that version is not valid
if (!in_array($version, $versions)) {
	exit;
}

// Fetch requested version
include('./versions/' . $version . '/budsjett.php');