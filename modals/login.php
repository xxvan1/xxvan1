<!-- Login Modal Template -->
<div class="modal-content">
    <div class="modal-header">
        <h2 class="modal-title">Login</h2>
        <button type="button" class="modal-close" aria-label="Close">&times;</button>
    </div>
    
    <div class="modal-body">
        <form id="loginForm" class="auth-form">
            <div class="form-group">
                <label for="loginUsername">Username or Email</label>
                <input type="text" id="loginUsername" name="username" required 
                       placeholder="Enter your username or email"
                       autocomplete="username">
            </div>
            
            <div class="form-group">
                <label for="loginPassword">Password</label>
                <input type="password" id="loginPassword" name="password" required 
                       placeholder="Enter your password"
                       autocomplete="current-password">
            </div>
            
            <div class="form-group form-actions">
                <button type="submit" class="btn btn-primary btn-full">Login</button>
            </div>
            
            <div class="form-group form-links">
                <a href="#" class="auth-link" data-modal="register">Don't have an account? Register</a>
            </div>
        </form>
        
        <div id="loginError" class="error-message" style="display: none;"></div>
        <div id="loginSuccess" class="success-message" style="display: none;"></div>
    </div>
</div>