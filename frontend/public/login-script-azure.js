// Login & Register with Azure Backend API

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginContainer = document.getElementById('login-form');
    const registerContainer = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const toast = document.getElementById('toast');
    
    // Show toast notification
    function showToast(message, type = 'info') {
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
    
    // Toggle between login and register
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginContainer.classList.remove('active');
            registerContainer.classList.add('active');
        });
    }
    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            registerContainer.classList.remove('active');
            loginContainer.classList.add('active');
        });
    }
    
    // Login Form Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;
            const rememberMe = document.getElementById('remember-me').checked;
            
            if (!username || !password) {
                showToast('Please fill all fields', 'error');
                return;
            }
            
            try {
                showToast('Logging in...', 'info');
                
                // Call API
                const data = await API.login(username, password);
                
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }
                
                showToast('Login successful!', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.replace('/dashboard.html');
                }, 500);
                
            } catch (error) {
                console.error('Login error:', error);
                showToast(error.message || 'Login failed. Please check credentials.', 'error');
            }
        });
    }
    
    // Register Form Handler
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('register-username').value.trim();
            const name = document.getElementById('register-name').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            // Validation
            if (!username || !name || !password || !confirmPassword) {
                showToast('Please fill all required fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }
            
            try {
                showToast('Creating account...', 'info');
                
                // Call API
                const data = await API.register(username, password, name, email);
                
                showToast('Account created successfully!', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.replace('/dashboard.html');
                }, 500);
                
            } catch (error) {
                console.error('Register error:', error);
                showToast(error.message || 'Registration failed. Username might already exist.', 'error');
            }
        });
    }
    
    // Check if already logged in
    if (API.isAuthenticated()) {
        // Already logged in, redirect to dashboard
        window.location.replace('/dashboard.html');
    }
});
