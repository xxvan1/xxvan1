<!-- Register Modal Template -->
<div class="modal-content">
    <div class="modal-header">
        <h2 class="modal-title">Register</h2>
        <button type="button" class="modal-close" aria-label="Close">&times;</button>
    </div>
    
    <div class="modal-body">
        <form id="registerForm" class="auth-form">
            <div class="form-group">
                <label for="registerUsername">Username</label>
                <input type="text" id="registerUsername" name="username" required 
                       placeholder="Choose a username"
                       autocomplete="username">
            </div>
            
            <div class="form-group">
                <label for="registerEmail">Email</label>
                <input type="email" id="registerEmail" name="email" required 
                       placeholder="Enter your email"
                       autocomplete="email">
            </div>
            
            <div class="form-group">
                <label for="registerPassword">Password</label>
                <input type="password" id="registerPassword" name="password" required 
                       placeholder="Create a strong password"
                       autocomplete="new-password">
            </div>
            
            <div class="form-group">
                <label for="registerConfirmPassword">Confirm Password</label>
                <input type="password" id="registerConfirmPassword" name="confirm_password" required 
                       placeholder="Confirm your password"
                       autocomplete="new-password">
            </div>
            
            <div class="form-group form-actions">
                <button type="submit" class="btn btn-primary btn-full">Register</button>
            </div>
            
            <div class="form-group form-links">
                <a href="#" class="auth-link" data-modal="login">Already have an account? Login</a>
            </div>
        </form>
        
        <div id="registerError" class="error-message" style="display: none;"></div>
        <div id="registerSuccess" class="success-message" style="display: none;"></div>
    </div>
</div>