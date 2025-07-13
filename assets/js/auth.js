/**
 * Authentication Handler - AJAX Requests
 * Handles login/register forms with validation and error handling
 * Mobile-optimized AJAX communication with PHP backend
 */

// ============================================
// AUTHENTICATION CONTROLLER - MAIN HANDLER
// ============================================

var AuthController = (function() {
    'use strict';

    // ============================================
    // PRIVATE VARIABLES - STATE MANAGEMENT
    // ============================================
    var apiEndpoint = 'api/auth.php';
    var currentForm = null;
    var validationRules = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        password: /^.{6,}$/,
        username: /^[a-zA-Z0-9_]{3,20}$/
    };

    // ============================================
    // INITIALIZATION - SETUP AUTH SYSTEM
    // ============================================
    function init() {
        bindFormEvents();
        setupValidation();
        initializeSessionCheck();
    }

    // ============================================
    // FORM EVENT BINDING - SUBMIT HANDLERS
    // ============================================
    function bindFormEvents() {
        var loginForm = document.getElementById('login-form');
        var registerForm = document.getElementById('register-form');

        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleLogin(this);
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleRegister(this);
            });
        }

        // Switch between forms
        var switchLinks = document.querySelectorAll('[data-auth-switch]');
        for (var i = 0; i < switchLinks.length; i++) {
            switchLinks[i].addEventListener('click', function(e) {
                e.preventDefault();
                var targetForm = this.getAttribute('data-auth-switch');
                switchAuthForm(targetForm);
            });
        }
    }

    // ============================================
    // VALIDATION SETUP - REAL-TIME VALIDATION
    // ============================================
    function setupValidation() {
        var inputs = document.querySelectorAll('input[data-validate]');
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            
            // Real-time validation on blur
            input.addEventListener('blur', function() {
                validateField(this);
            });

            // Clear validation on focus
            input.addEventListener('focus', function() {
                clearFieldError(this);
            });
        }
    }

    // ============================================
    // LOGIN HANDLER - AUTHENTICATION REQUEST
    // ============================================
    function handleLogin(form) {
        currentForm = form;
        var formData = getFormData(form);
        
        // Client-side validation
        if (!validateLoginForm(formData)) {
            return;
        }

        // Show loading state
        setFormLoading(form, true);
        
        // AJAX request
        var xhr = createXHR();
        xhr.open('POST', apiEndpoint, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                setFormLoading(form, false);
                
                if (xhr.status === 200) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        handleAuthResponse(response, 'login');
                    } catch (e) {
                        showError('Invalid response from server');
                    }
                } else {
                    showError('Connection error. Please try again.');
                }
            }
        };

        var payload = {
            action: 'login',
            email: formData.email,
            password: formData.password
        };

        xhr.send(JSON.stringify(payload));
    }

    // ============================================
    // REGISTER HANDLER - ACCOUNT CREATION
    // ============================================
    function handleRegister(form) {
        currentForm = form;
        var formData = getFormData(form);
        
        // Client-side validation
        if (!validateRegisterForm(formData)) {
            return;
        }

        // Show loading state
        setFormLoading(form, true);
        
        // AJAX request
        var xhr = createXHR();
        xhr.open('POST', apiEndpoint, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                setFormLoading(form, false);
                
                if (xhr.status === 200) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        handleAuthResponse(response, 'register');
                    } catch (e) {
                        showError('Invalid response from server');
                    }
                } else {
                    showError('Connection error. Please try again.');
                }
            }
        };

        var payload = {
            action: 'register',
            username: formData.username,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword
        };

        xhr.send(JSON.stringify(payload));
    }

    // ============================================
    // FORM VALIDATION - CLIENT-SIDE CHECKS
    // ============================================
    function validateLoginForm(data) {
        var isValid = true;
        
        if (!data.email || !validationRules.email.test(data.email)) {
            showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!data.password || !validationRules.password.test(data.password)) {
            showFieldError('password', 'Password must be at least 6 characters');
            isValid = false;
        }
        
        return isValid;
    }

    function validateRegisterForm(data) {
        var isValid = true;
        
        if (!data.username || !validationRules.username.test(data.username)) {
            showFieldError('username', 'Username must be 3-20 characters (letters, numbers, underscore)');
            isValid = false;
        }
        
        if (!data.email || !validationRules.email.test(data.email)) {
            showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!data.password || !validationRules.password.test(data.password)) {
            showFieldError('password', 'Password must be at least 6 characters');
            isValid = false;
        }
        
        if (data.password !== data.confirmPassword) {
            showFieldError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }
        
        return isValid;
    }

    // ============================================
    // FIELD VALIDATION - INDIVIDUAL CHECKS
    // ============================================
    function validateField(field) {
        var fieldName = field.name;
        var fieldValue = field.value;
        var isValid = true;
        
        switch (fieldName) {
            case 'email':
                if (!validationRules.email.test(fieldValue)) {
                    showFieldError(fieldName, 'Please enter a valid email address');
                    isValid = false;
                }
                break;
            case 'password':
                if (!validationRules.password.test(fieldValue)) {
                    showFieldError(fieldName, 'Password must be at least 6 characters');
                    isValid = false;
                }
                break;
            case 'username':
                if (!validationRules.username.test(fieldValue)) {
                    showFieldError(fieldName, 'Username must be 3-20 characters (letters, numbers, underscore)');
                    isValid = false;
                }
                break;
        }
        
        if (isValid) {
            clearFieldError(field);
        }
        
        return isValid;
    }

    // ============================================
    // RESPONSE HANDLING - SUCCESS/ERROR MANAGEMENT
    // ============================================
    function handleAuthResponse(response, action) {
        if (response.success) {
            showSuccess(response.message || (action === 'login' ? 'Login successful!' : 'Registration successful!'));
            
            // Store session data
            if (response.user) {
                sessionStorage.setItem('user', JSON.stringify(response.user));
            }
            
            // Redirect after success
            setTimeout(function() {
                if (response.redirect) {
                    window.location.href = response.redirect;
                } else {
                    window.location.reload();
                }
            }, 1500);
            
        } else {
            // Handle field-specific errors
            if (response.errors) {
                for (var field in response.errors) {
                    showFieldError(field, response.errors[field]);
                }
            } else {
                showError(response.message || 'An error occurred. Please try again.');
            }
        }
    }

    // ============================================
    // FORM UTILITIES - HELPER FUNCTIONS
    // ============================================
    function getFormData(form) {
        var data = {};
        var inputs = form.querySelectorAll('input, textarea, select');
        
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            if (input.name) {
                data[input.name] = input.value;
            }
        }
        
        return data;
    }

    function setFormLoading(form, isLoading) {
        var submitButton = form.querySelector('button[type="submit"]');
        var inputs = form.querySelectorAll('input, textarea, select');
        
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.textContent = 'Please wait...';
            
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true;
            }
        } else {
            submitButton.disabled = false;
            submitButton.textContent = submitButton.getAttribute('data-original-text') || 'Submit';
            
            for (var j = 0; j < inputs.length; j++) {
                inputs[j].disabled = false;
            }
        }
    }

    // ============================================
    // ERROR DISPLAY - FEEDBACK MANAGEMENT
    // ============================================
    function showFieldError(fieldName, message) {
        var field = document.querySelector('[name="' + fieldName + '"]');
        if (!field) return;
        
        var errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        field.classList.add('error');
    }

    function clearFieldError(field) {
        var errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        field.classList.remove('error');
    }

    function showError(message) {
        var errorContainer = document.querySelector('.auth-error');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.className = 'auth-error';
            if (currentForm) {
                currentForm.insertBefore(errorContainer, currentForm.firstChild);
            }
        }
        
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(function() {
            errorContainer.style.display = 'none';
        }, 5000);
    }

    function showSuccess(message) {
        var successContainer = document.querySelector('.auth-success');
        if (!successContainer) {
            successContainer = document.createElement('div');
            successContainer.className = 'auth-success';
            if (currentForm) {
                currentForm.insertBefore(successContainer, currentForm.firstChild);
            }
        }
        
        successContainer.textContent = message;
        successContainer.style.display = 'block';
    }

    // ============================================
    // FORM SWITCHING - MODAL TRANSITIONS
    // ============================================
    function switchAuthForm(targetForm) {
        var loginModal = document.getElementById('login-modal');
        var registerModal = document.getElementById('register-modal');
        
        if (targetForm === 'register' && loginModal && registerModal) {
            if (window.ModalController) {
                window.ModalController.close();
                setTimeout(function() {
                    window.ModalController.open('register-modal');
                }, 300);
            }
        } else if (targetForm === 'login' && loginModal && registerModal) {
            if (window.ModalController) {
                window.ModalController.close();
                setTimeout(function() {
                    window.ModalController.open('login-modal');
                }, 300);
            }
        }
    }

    // ============================================
    // SESSION MANAGEMENT - LOGIN STATE
    // ============================================
    function initializeSessionCheck() {
        var user = sessionStorage.getItem('user');
        if (user) {
            try {
                user = JSON.parse(user);
                updateUIForLoggedInUser(user);
            } catch (e) {
                sessionStorage.removeItem('user');
            }
        }
    }

    function updateUIForLoggedInUser(user) {
        var authButtons = document.querySelectorAll('[data-auth-required]');
        var logoutButtons = document.querySelectorAll('[data-logout]');
        
        for (var i = 0; i < authButtons.length; i++) {
            authButtons[i].style.display = 'none';
        }
        
        for (var j = 0; j < logoutButtons.length; j++) {
            logoutButtons[j].style.display = 'block';
            logoutButtons[j].addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
    }

    function logout() {
        sessionStorage.removeItem('user');
        window.location.reload();
    }

    // ============================================
    // CROSS-BROWSER COMPATIBILITY - XHR CREATION
    // ============================================
    function createXHR() {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            return new ActiveXObject('Microsoft.XMLHTTP');
        }
        throw new Error('XMLHttpRequest not supported');
    }

    // ============================================
    // PUBLIC API - EXPOSED METHODS
    // ============================================
    return {
        init: init,
        login: handleLogin,
        register: handleRegister,
        logout: logout,
        validateField: validateField
    };
})();

// ============================================
// AUTO-INITIALIZATION - READY STATE
// ============================================
(function() {
    'use strict';
    
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function() {
        AuthController.init();
    });
})();