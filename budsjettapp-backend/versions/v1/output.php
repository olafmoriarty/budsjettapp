<?php

// Set HTTP headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Accept, Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

// Set HTTP status (adapt to actual content)
header("HTTP/1.0 200 OK");

// Output content as JSON
echo json_encode($c);