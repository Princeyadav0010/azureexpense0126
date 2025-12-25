// API Configuration
// Change this URL when deploying to Azure
const API_CONFIG = {
    // Local development
    // BASE_URL: 'http://localhost:3000',
    
    // Azure production (Deployed!)
    BASE_URL: 'https://expense-backend-1766329096.azurewebsites.net',
    
    ENDPOINTS: {
        // Auth
        REGISTER: '/api/auth/register',
        LOGIN: '/api/auth/login',
        
        // Expenses
        EXPENSES: '/api/expenses',
        EXPENSE_BY_ID: (id) => `/api/expenses/${id}`
    }
};

// API Helper Functions
const API = {
    // Get auth token from localStorage
    getToken() {
        return localStorage.getItem('authToken');
    },
    
    // Set auth token
    setToken(token) {
        localStorage.setItem('authToken', token);
    },
    
    // Remove auth token
    removeToken() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    },
    
    // Get current user
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },
    
    // Set current user
    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    },
    
    // Generic fetch with auth
    async request(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        console.log('API Request:', { url, method: options.method || 'GET' });
        
        try {
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            console.log('API Response:', { status: response.status, ok: response.ok });
            
            const data = await response.json();
            console.log('API Data:', data);
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // Auth APIs
    async register(username, password, name, email) {
        const data = await this.request(API_CONFIG.ENDPOINTS.REGISTER, {
            method: 'POST',
            body: JSON.stringify({ username, password, name, email })
        });
        
        if (data.token) {
            this.setToken(data.token);
            this.setCurrentUser(data.user);
        }
        
        return data;
    },
    
    async login(username, password) {
        const data = await this.request(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (data.token) {
            this.setToken(data.token);
            this.setCurrentUser(data.user);
        }
        
        return data;
    },
    
    logout() {
        this.removeToken();
        window.location.href = '/login.html';
    },
    
    // Expense APIs
    async getExpenses() {
        const data = await this.request(API_CONFIG.ENDPOINTS.EXPENSES);
        return data.expenses || []; // Return expenses array
    },
    
    async createExpense(amount, category, description, date) {
        const data = await this.request(API_CONFIG.ENDPOINTS.EXPENSES, {
            method: 'POST',
            body: JSON.stringify({ amount, category, description, date })
        });
        return data.expense || data; // Return expense object
    },
    
    async getExpenseById(id) {
        return await this.request(API_CONFIG.ENDPOINTS.EXPENSE_BY_ID(id));
    },
    
    async updateExpense(id, updateData) {
        return await this.request(API_CONFIG.ENDPOINTS.EXPENSE_BY_ID(id), {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    },
    
    async deleteExpense(id) {
        return await this.request(API_CONFIG.ENDPOINTS.EXPENSE_BY_ID(id), {
            method: 'DELETE'
        });
    },
    
    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    }
};

// Toast notifications
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Export for use in other files
window.API = API;
window.showToast = showToast;
