<?php
/**
 * Main Entry Point - Modal Authentication System
 * PHP 5.6+ compatible main application
 */

require_once 'config/db.php';
require_once 'config/auth.php';

// Initialize database and session
initializeDatabase();
initAuthSession();

// Get current user if authenticated
$currentUser = getCurrentUser();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modal Authentication System</title>
    
    <!-- CSS Files -->
    <link rel="stylesheet" href="assets/css/responsive.css">
    <link rel="stylesheet" href="assets/css/modal.css">
    <link rel="stylesheet" href="assets/css/auth.css">
    
    <style>
        /* Basic page styling */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .auth-actions {
            text-align: center;
            margin: 2rem 0;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 0 10px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            border: none;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .btn:hover {
            background: #0056b3;
        }
        
        .btn-secondary {
            background: #6c757d;
        }
        
        .btn-secondary:hover {
            background: #545b62;
        }
        
        .user-info {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 1rem;
            border-radius: 5px;
            margin-bottom: 2rem;
        }
        
        .demo-content {
            margin-top: 2rem;
            padding: 2rem;
            background: #f8f9fa;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Modal Authentication System</h1>
            <p>Minimalist, responsive authentication with modal interface</p>
        </div>
        
        <?php if ($currentUser): ?>
            <div class="user-info">
                <h3>Welcome, <?php echo htmlspecialchars($currentUser['username']); ?>!</h3>
                <p>Email: <?php echo htmlspecialchars($currentUser['email']); ?></p>
                <p>You are successfully logged in.</p>
            </div>
            
            <div class="auth-actions">
                <button id="logoutBtn" class="btn btn-secondary">Logout</button>
            </div>
        <?php else: ?>
            <div class="auth-actions">
                <button id="loginBtn" class="btn">Login</button>
                <button id="registerBtn" class="btn btn-secondary">Register</button>
            </div>
        <?php endif; ?>
        
        <div class="demo-content">
            <h2>Features</h2>
            <ul>
                <li>✅ Modal-based authentication system</li>
                <li>✅ Responsive design (mobile-first)</li>
                <li>✅ Touch-friendly interactions</li>
                <li>✅ AJAX form submissions</li>
                <li>✅ Client-side validation</li>
                <li>✅ Secure password handling</li>
                <li>✅ Session management</li>
                <li>✅ Cross-browser compatibility</li>
                <li>✅ ES5 compatible JavaScript</li>
                <li>✅ PHP 5.6+ backend</li>
            </ul>
            
            <h2>Testing</h2>
            <p>Test the authentication system by clicking the Login or Register buttons above. The modal will open with a responsive, touch-friendly interface.</p>
        </div>
    </div>
    
    <!-- Modal Container -->
    <div id="modal" class="modal" style="display: none;">
        <div class="modal-backdrop"></div>
        <div class="modal-dialog">
            <div id="modalContent"></div>
        </div>
    </div>
    
    <!-- JavaScript Files -->
    <script src="assets/js/responsive.js"></script>
    <script src="assets/js/modal.js"></script>
    <script src="assets/js/auth.js"></script>
    
    <script>
        // Initialize application
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize responsive handler
            ResponsiveHandler.init();
            
            // Initialize modal controller
            ModalController.init();
            
            // Initialize authentication handler
            AuthHandler.init();
            
            // Bind auth buttons
            var loginBtn = document.getElementById('loginBtn');
            var registerBtn = document.getElementById('registerBtn');
            var logoutBtn = document.getElementById('logoutBtn');
            
            if (loginBtn) {
                loginBtn.addEventListener('click', function() {
                    AuthHandler.showLogin();
                });
            }
            
            if (registerBtn) {
                registerBtn.addEventListener('click', function() {
                    AuthHandler.showRegister();
                });
            }
            
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function() {
                    AuthHandler.logout();
                });
            }
        });
    </script>
</body>
</html>