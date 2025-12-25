// Login & Register Script with LocalStorage

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && window.location.pathname.includes('login.html')) {
        window.location.replace('dashboard.html');
    }
});

// Prevent back button after login
window.history.pushState(null, null, window.location.href);
window.onpopstate = function() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        window.history.pushState(null, null, window.location.href);
    }
};

// Switch between Login and Register
function switchToRegister(e) {
    e.preventDefault();
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('register-form').classList.add('active');
}

function switchToLogin(e) {
    e.preventDefault();
    document.getElementById('register-form').classList.remove('active');
    document.getElementById('login-form').classList.add('active');
}

// Show Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Store current user
        localStorage.setItem('currentUser', JSON.stringify({
            name: user.name,
            username: user.username,
            email: user.email
        }));
        
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        showToast('Login successful! Redirecting...', 'success');
        
        // Add loading state
        const btn = this.querySelector('.btn');
        btn.classList.add('loading');
        
        setTimeout(() => {
            window.location.replace('dashboard.html');
        }, 1500);
    } else {
        showToast('Invalid username or password!', 'error');
    }
});

// Register Form Handler
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validation
    if (password !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters!', 'error');
        return;
    }
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if username exists
    if (users.some(u => u.username === username)) {
        showToast('Username already exists!', 'error');
        return;
    }
    
    // Check if email exists
    if (users.some(u => u.email === email)) {
        showToast('Email already registered!', 'error');
        return;
    }
    
    // Add new user
    const newUser = {
        name,
        email,
        username,
        password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showToast('Registration successful! Please login.', 'success');
    
    // Add loading state
    const btn = this.querySelector('.btn');
    btn.classList.add('loading');
    
    // Switch to login after 1.5 seconds
    setTimeout(() => {
        document.getElementById('register-form').classList.remove('active');
        document.getElementById('login-form').classList.add('active');
        btn.classList.remove('loading');
        
        // Clear form
        this.reset();
    }, 1500);
});

// Animated input effects
const inputs = document.querySelectorAll('.input-group input');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    });
});

// Create a default test user if no users exist
if (!localStorage.getItem('users')) {
    const defaultUsers = [
        {
            name: 'Test User',
            email: 'test@example.com',
            username: 'test',
            password: 'test123',
            createdAt: new Date().toISOString()
        }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
    console.log('Default test user created: username=test, password=test123');
}
