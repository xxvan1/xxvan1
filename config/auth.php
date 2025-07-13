<?php
/**
 * Authentication Configuration
 * PHP 5.6+ compatible authentication settings
 */

// Session configuration
define('SESSION_TIMEOUT', 3600); // 1 hour
define('SESSION_NAME', 'xxvan1_auth');

// Password settings
define('PASSWORD_MIN_LENGTH', 8);
define('PASSWORD_MAX_LENGTH', 128);

// Username settings
define('USERNAME_MIN_LENGTH', 3);
define('USERNAME_MAX_LENGTH', 50);

// Email settings
define('EMAIL_MAX_LENGTH', 100);

// Security settings
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_DURATION', 900); // 15 minutes

/**
 * Initialize Authentication Session
 * Starts secure session with custom settings
 */
function initAuthSession() {
    if (session_status() == PHP_SESSION_NONE) {
        session_name(SESSION_NAME);
        session_start();
        
        // Regenerate session ID for security
        if (!isset($_SESSION['initiated'])) {
            session_regenerate_id(true);
            $_SESSION['initiated'] = true;
        }
        
        // Check session timeout
        if (isset($_SESSION['last_activity']) && 
            (time() - $_SESSION['last_activity'] > SESSION_TIMEOUT)) {
            session_destroy();
            session_start();
        }
        
        $_SESSION['last_activity'] = time();
    }
}

/**
 * Check if user is authenticated
 * Returns boolean authentication status
 */
function isAuthenticated() {
    initAuthSession();
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Get current user data
 * Returns user data array or false
 */
function getCurrentUser() {
    if (!isAuthenticated()) {
        return false;
    }
    
    return array(
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'email' => $_SESSION['email']
    );
}

/**
 * Login user
 * Sets session variables for authenticated user
 */
function loginUser($userId, $username, $email) {
    initAuthSession();
    $_SESSION['user_id'] = $userId;
    $_SESSION['username'] = $username;
    $_SESSION['email'] = $email;
    $_SESSION['login_time'] = time();
    
    // Regenerate session ID after login
    session_regenerate_id(true);
}

/**
 * Logout user
 * Destroys session and clears user data
 */
function logoutUser() {
    initAuthSession();
    session_destroy();
    session_start();
}

/**
 * Validate password strength
 * Returns array with validation result
 */
function validatePassword($password) {
    $errors = array();
    
    if (strlen($password) < PASSWORD_MIN_LENGTH) {
        $errors[] = 'Password must be at least ' . PASSWORD_MIN_LENGTH . ' characters long';
    }
    
    if (strlen($password) > PASSWORD_MAX_LENGTH) {
        $errors[] = 'Password must be less than ' . PASSWORD_MAX_LENGTH . ' characters long';
    }
    
    if (!preg_match('/[A-Z]/', $password)) {
        $errors[] = 'Password must contain at least one uppercase letter';
    }
    
    if (!preg_match('/[a-z]/', $password)) {
        $errors[] = 'Password must contain at least one lowercase letter';
    }
    
    if (!preg_match('/[0-9]/', $password)) {
        $errors[] = 'Password must contain at least one number';
    }
    
    return array(
        'valid' => empty($errors),
        'errors' => $errors
    );
}

/**
 * Hash password securely
 * Returns hashed password string
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

/**
 * Verify password against hash
 * Returns boolean verification result
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}
?>