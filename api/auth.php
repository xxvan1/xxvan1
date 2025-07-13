<?php
/**
 * Authentication API Endpoint
 * Handles AJAX login and registration requests
 */

require_once '../config/db.php';
require_once '../config/auth.php';

// Set JSON response headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Initialize database and session
initializeDatabase();
initAuthSession();

/**
 * Send JSON response
 * Outputs formatted JSON response and exits
 */
function sendResponse($success, $message, $data = null) {
    $response = array(
        'success' => $success,
        'message' => $message
    );
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    exit();
}

/**
 * Validate email format
 * Returns boolean validation result
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate username format
 * Returns boolean validation result
 */
function validateUsername($username) {
    return preg_match('/^[a-zA-Z0-9_]{' . USERNAME_MIN_LENGTH . ',' . USERNAME_MAX_LENGTH . '}$/', $username);
}

// Handle POST requests only
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    sendResponse(false, 'Invalid JSON input');
}

$action = isset($input['action']) ? $input['action'] : '';

switch ($action) {
    case 'login':
        handleLogin($input);
        break;
    case 'register':
        handleRegister($input);
        break;
    case 'logout':
        handleLogout();
        break;
    case 'check':
        handleCheck();
        break;
    default:
        sendResponse(false, 'Invalid action');
}

/**
 * Handle user login
 * Validates credentials and creates session
 */
function handleLogin($input) {
    $username = isset($input['username']) ? trim($input['username']) : '';
    $password = isset($input['password']) ? $input['password'] : '';
    
    // Validate input
    if (empty($username) || empty($password)) {
        sendResponse(false, 'Username and password are required');
    }
    
    // Get database connection
    $pdo = getDbConnection();
    if (!$pdo) {
        sendResponse(false, 'Database connection failed');
    }
    
    // Find user by username or email
    $sql = "SELECT id, username, email, password FROM users WHERE username = ? OR email = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array($username, $username));
    $user = $stmt->fetch();
    
    if (!$user) {
        sendResponse(false, 'Invalid username or password');
    }
    
    // Verify password
    if (!verifyPassword($password, $user['password'])) {
        sendResponse(false, 'Invalid username or password');
    }
    
    // Login user
    loginUser($user['id'], $user['username'], $user['email']);
    
    sendResponse(true, 'Login successful', array(
        'username' => $user['username'],
        'email' => $user['email']
    ));
}

/**
 * Handle user registration
 * Validates input and creates new user
 */
function handleRegister($input) {
    $username = isset($input['username']) ? trim($input['username']) : '';
    $email = isset($input['email']) ? trim($input['email']) : '';
    $password = isset($input['password']) ? $input['password'] : '';
    $confirmPassword = isset($input['confirm_password']) ? $input['confirm_password'] : '';
    
    // Validate input
    if (empty($username) || empty($email) || empty($password) || empty($confirmPassword)) {
        sendResponse(false, 'All fields are required');
    }
    
    // Validate username
    if (!validateUsername($username)) {
        sendResponse(false, 'Username must be 3-50 characters long and contain only letters, numbers, and underscores');
    }
    
    // Validate email
    if (!validateEmail($email)) {
        sendResponse(false, 'Please enter a valid email address');
    }
    
    // Validate password
    $passwordValidation = validatePassword($password);
    if (!$passwordValidation['valid']) {
        sendResponse(false, implode(', ', $passwordValidation['errors']));
    }
    
    // Check password confirmation
    if ($password !== $confirmPassword) {
        sendResponse(false, 'Passwords do not match');
    }
    
    // Get database connection
    $pdo = getDbConnection();
    if (!$pdo) {
        sendResponse(false, 'Database connection failed');
    }
    
    // Check if username or email already exists
    $sql = "SELECT id FROM users WHERE username = ? OR email = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array($username, $email));
    
    if ($stmt->fetch()) {
        sendResponse(false, 'Username or email already exists');
    }
    
    // Hash password
    $hashedPassword = hashPassword($password);
    
    // Insert new user
    $sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    
    try {
        $stmt->execute(array($username, $email, $hashedPassword));
        $userId = $pdo->lastInsertId();
        
        // Auto-login after registration
        loginUser($userId, $username, $email);
        
        sendResponse(true, 'Registration successful', array(
            'username' => $username,
            'email' => $email
        ));
    } catch (PDOException $e) {
        sendResponse(false, 'Registration failed. Please try again.');
    }
}

/**
 * Handle user logout
 * Destroys session
 */
function handleLogout() {
    logoutUser();
    sendResponse(true, 'Logout successful');
}

/**
 * Handle authentication check
 * Returns current user status
 */
function handleCheck() {
    if (isAuthenticated()) {
        $user = getCurrentUser();
        sendResponse(true, 'User is authenticated', $user);
    } else {
        sendResponse(false, 'User is not authenticated');
    }
}
?>