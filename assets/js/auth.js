/**
 * Authentication Handler - ES5 Compatible
 * Handles AJAX authentication, form validation, and user sessions
 */

var AuthHandler = (function() {
    'use strict';
    
    // Private variables
    var isProcessing = false;
    var currentUser = null;
    
    // Configuration
    var config = {
        apiUrl: 'api/auth.php',
        loginModal: 'modals/login.php',
        registerModal: 'modals/register.php',
        redirectUrl: window.location.href
    };
    
    /**
     * Initialize authentication handler
     * Sets up event listeners and checks authentication status
     */
    function init() {
        // Check current authentication status
        checkAuthStatus();
        
        return true;
    }
    
    /**
     * Show login modal
     * Loads and displays login form
     */
    function showLogin() {
        if (!ModalController) {
            console.error('ModalController not found');
            return;
        }
        
        ModalController.loadModal(config.loginModal, 'login', function(success) {
            if (success) {
                bindLoginForm();
            }
        });
    }
    
    /**
     * Show register modal
     * Loads and displays registration form
     */
    function showRegister() {
        if (!ModalController) {
            console.error('ModalController not found');
            return;
        }
        
        ModalController.loadModal(config.registerModal, 'register', function(success) {
            if (success) {
                bindRegisterForm();
            }
        });
    }
    
    /**
     * Bind login form events
     * Handles login form submission and validation
     */
    function bindLoginForm() {
        var form = document.getElementById('loginForm');
        var usernameInput = document.getElementById('loginUsername');
        var passwordInput = document.getElementById('loginPassword');
        
        if (!form || !usernameInput || !passwordInput) {
            console.error('Login form elements not found');
            return;
        }
        
        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (isProcessing) {
                return;
            }
            
            var username = usernameInput.value.trim();
            var password = passwordInput.value;
            
            // Client-side validation
            if (!validateLoginForm(username, password)) {
                return;
            }
            
            // Submit login request
            submitLogin(username, password);
        });
        
        // Switch to register modal
        var registerLink = document.querySelector('[data-modal="register"]');
        if (registerLink) {
            registerLink.addEventListener('click', function(e) {
                e.preventDefault();
                showRegister();
            });
        }
        
        // Real-time validation
        usernameInput.addEventListener('input', function() {
            clearFieldError(usernameInput);
        });
        
        passwordInput.addEventListener('input', function() {
            clearFieldError(passwordInput);
        });
    }
    
    /**
     * Bind register form events
     * Handles registration form submission and validation
     */
    function bindRegisterForm() {
        var form = document.getElementById('registerForm');
        var usernameInput = document.getElementById('registerUsername');
        var emailInput = document.getElementById('registerEmail');
        var passwordInput = document.getElementById('registerPassword');
        var confirmPasswordInput = document.getElementById('registerConfirmPassword');
        
        if (!form || !usernameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
            console.error('Register form elements not found');
            return;
        }
        
        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (isProcessing) {
                return;
            }
            
            var username = usernameInput.value.trim();
            var email = emailInput.value.trim();
            var password = passwordInput.value;
            var confirmPassword = confirmPasswordInput.value;
            
            // Client-side validation
            if (!validateRegisterForm(username, email, password, confirmPassword)) {
                return;
            }
            
            // Submit registration request
            submitRegister(username, email, password, confirmPassword);
        });
        
        // Switch to login modal
        var loginLink = document.querySelector('[data-modal="login"]');
        if (loginLink) {
            loginLink.addEventListener('click', function(e) {
                e.preventDefault();
                showLogin();
            });
        }
        
        // Real-time validation
        usernameInput.addEventListener('input', function() {
            clearFieldError(usernameInput);
        });
        
        emailInput.addEventListener('input', function() {
            clearFieldError(emailInput);
        });
        
        passwordInput.addEventListener('input', function() {
            clearFieldError(passwordInput);
            if (confirmPasswordInput.value) {
                validatePasswordMatch(passwordInput, confirmPasswordInput);
            }
        });
        
        confirmPasswordInput.addEventListener('input', function() {
            clearFieldError(confirmPasswordInput);
            validatePasswordMatch(passwordInput, confirmPasswordInput);
        });
    }
    
    /**
     * Validate login form
     * Client-side validation for login form
     */
    function validateLoginForm(username, password) {
        var isValid = true;
        
        // Clear previous errors
        clearAllErrors();
        
        // Validate username/email
        if (!username) {
            showFieldError('loginUsername', 'Username or email is required');
            isValid = false;
        }
        
        // Validate password
        if (!password) {
            showFieldError('loginPassword', 'Password is required');
            isValid = false;
        }
        
        return isValid;
    }
    
    /**
     * Validate register form
     * Client-side validation for registration form
     */
    function validateRegisterForm(username, email, password, confirmPassword) {
        var isValid = true;
        
        // Clear previous errors
        clearAllErrors();
        
        // Validate username
        if (!username) {
            showFieldError('registerUsername', 'Username is required');
            isValid = false;
        } else if (username.length < 3) {
            showFieldError('registerUsername', 'Username must be at least 3 characters');
            isValid = false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            showFieldError('registerUsername', 'Username can only contain letters, numbers, and underscores');
            isValid = false;
        }
        
        // Validate email
        if (!email) {
            showFieldError('registerEmail', 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showFieldError('registerEmail', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate password
        if (!password) {
            showFieldError('registerPassword', 'Password is required');
            isValid = false;
        } else if (password.length < 8) {
            showFieldError('registerPassword', 'Password must be at least 8 characters');
            isValid = false;
        } else if (!isStrongPassword(password)) {
            showFieldError('registerPassword', 'Password must contain uppercase, lowercase, and number');
            isValid = false;
        }
        
        // Validate password confirmation
        if (!confirmPassword) {
            showFieldError('registerConfirmPassword', 'Password confirmation is required');
            isValid = false;
        } else if (password !== confirmPassword) {
            showFieldError('registerConfirmPassword', 'Passwords do not match');
            isValid = false;
        }
        
        return isValid;
    }
    
    /**
     * Submit login request
     * Sends AJAX login request to server
     */
    function submitLogin(username, password) {
        setProcessing(true);
        
        var data = {
            action: 'login',
            username: username,
            password: password
        };
        
        makeAjaxRequest(data, function(response) {
            setProcessing(false);
            
            if (response.success) {
                showSuccess('loginSuccess', 'Login successful! Redirecting...');
                currentUser = response.data;
                
                // Redirect after short delay
                setTimeout(function() {
                    window.location.reload();
                }, 1500);
            } else {
                showError('loginError', response.message || 'Login failed');
            }
        });
    }
    
    /**
     * Submit register request
     * Sends AJAX registration request to server
     */
    function submitRegister(username, email, password, confirmPassword) {
        setProcessing(true);
        
        var data = {
            action: 'register',
            username: username,
            email: email,
            password: password,
            confirm_password: confirmPassword
        };
        
        makeAjaxRequest(data, function(response) {
            setProcessing(false);
            
            if (response.success) {
                showSuccess('registerSuccess', 'Registration successful! Redirecting...');
                currentUser = response.data;
                
                // Redirect after short delay
                setTimeout(function() {
                    window.location.reload();
                }, 1500);
            } else {
                showError('registerError', response.message || 'Registration failed');
            }
        });
    }
    
    /**
     * Logout user
     * Sends logout request and redirects
     */
    function logout() {
        var data = {
            action: 'logout'
        };
        
        makeAjaxRequest(data, function(response) {
            // Redirect regardless of response
            window.location.reload();
        });
    }
    
    /**
     * Check authentication status
     * Checks if user is currently authenticated
     */
    function checkAuthStatus() {
        var data = {
            action: 'check'
        };
        
        makeAjaxRequest(data, function(response) {
            if (response.success) {
                currentUser = response.data;
            } else {
                currentUser = null;
            }
        });
    }
    
    /**
     * Make AJAX request
     * Handles all AJAX communication with server
     */
    function makeAjaxRequest(data, callback) {
        var xhr = new XMLHttpRequest();
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                var response = null;
                
                try {
                    response = JSON.parse(xhr.responseText);
                } catch (e) {
                    response = {
                        success: false,
                        message: 'Invalid server response'
                    };
                }
                
                if (callback) {
                    callback(response);
                }
            }
        };
        
        xhr.onerror = function() {
            if (callback) {
                callback({
                    success: false,
                    message: 'Network error occurred'
                });
            }
        };
        
        xhr.open('POST', config.apiUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
    }
    
    /**
     * Set processing state
     * Updates UI to show/hide loading state
     */
    function setProcessing(processing) {
        isProcessing = processing;
        
        var submitButtons = document.querySelectorAll('.auth-form button[type="submit"]');
        for (var i = 0; i < submitButtons.length; i++) {
            submitButtons[i].disabled = processing;
            submitButtons[i].textContent = processing ? 'Processing...' : 
                (submitButtons[i].id === 'loginBtn' ? 'Login' : 'Register');
        }
    }
    
    /**
     * Show field error
     * Displays error message for specific field
     */
    function showFieldError(fieldId, message) {
        var field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('error');
            
            // Create or update error message
            var errorId = fieldId + 'Error';
            var errorElement = document.getElementById(errorId);
            
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.id = errorId;
                errorElement.className = 'field-error';
                field.parentNode.appendChild(errorElement);
            }
            
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    /**
     * Clear field error
     * Removes error styling and message from field
     */
    function clearFieldError(field) {
        if (field) {
            field.classList.remove('error');
            
            var errorElement = document.getElementById(field.id + 'Error');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }
    }
    
    /**
     * Clear all errors
     * Removes all error messages and styling
     */
    function clearAllErrors() {
        var errorElements = document.querySelectorAll('.error-message, .field-error');
        for (var i = 0; i < errorElements.length; i++) {
            errorElements[i].style.display = 'none';
        }
        
        var errorFields = document.querySelectorAll('.error');
        for (var j = 0; j < errorFields.length; j++) {
            errorFields[j].classList.remove('error');
        }
    }
    
    /**
     * Show error message
     * Displays error in specified container
     */
    function showError(containerId, message) {
        var container = document.getElementById(containerId);
        if (container) {
            container.textContent = message;
            container.style.display = 'block';
        }
    }
    
    /**
     * Show success message
     * Displays success in specified container
     */
    function showSuccess(containerId, message) {
        var container = document.getElementById(containerId);
        if (container) {
            container.textContent = message;
            container.style.display = 'block';
        }
    }
    
    /**
     * Validate email format
     * Checks if email is valid format
     */
    function isValidEmail(email) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * Validate password strength
     * Checks if password meets strength requirements
     */
    function isStrongPassword(password) {
        var hasUpper = /[A-Z]/.test(password);
        var hasLower = /[a-z]/.test(password);
        var hasNumber = /[0-9]/.test(password);
        
        return hasUpper && hasLower && hasNumber;
    }
    
    /**
     * Validate password match
     * Checks if passwords match in real-time
     */
    function validatePasswordMatch(passwordField, confirmField) {
        if (passwordField.value !== confirmField.value) {
            showFieldError(confirmField.id, 'Passwords do not match');
        } else {
            clearFieldError(confirmField);
        }
    }
    
    /**
     * Get current user
     * Returns current authenticated user data
     */
    function getCurrentUser() {
        return currentUser;
    }
    
    /**
     * Check if user is authenticated
     * Returns authentication status
     */
    function isAuthenticated() {
        return currentUser !== null;
    }
    
    // Public API
    return {
        init: init,
        showLogin: showLogin,
        showRegister: showRegister,
        logout: logout,
        getCurrentUser: getCurrentUser,
        isAuthenticated: isAuthenticated,
        checkAuthStatus: checkAuthStatus
    };
})();