// Dashboard.js - Dashboard Page Logic

// Check if user is logged in
const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
if (!currentUser) {
    window.location.replace('login.html');
}

// Prevent back button to login after successful login
window.history.pushState(null, null, window.location.href);
window.onpopstate = function() {
    window.history.pushState(null, null, window.location.href);
};

// Logout function - defined at top for global access
window.logout = function() {
    console.log('Logout function called!');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberMe');
    localStorage.clear();
    console.log('LocalStorage cleared, redirecting...');
    window.location.href = '/login.html';
};

// Attach logout event listener after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const logoutLink = document.getElementById('logout-link');
    console.log('Logout link found:', logoutLink);
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Logout clicked!');
            window.logout();
        });
        console.log('Logout event listener attached');
    } else {
        console.error('Logout link not found!');
    }
});

// Display user name
if (document.querySelector('.user-info')) {
    const userInfo = document.querySelector('.user-info');
    const userName = document.createElement('span');
    userName.textContent = currentUser?.name || 'User';
    userName.style.marginRight = '10px';
    userName.style.fontWeight = '600';
    userInfo.insertBefore(userName, userInfo.firstChild);
}

// Set current date
document.getElementById('current-date').textContent = new Date().toLocaleDateString('hi-IN');

// Load dashboard data
async function loadDashboard() {
    try {
        // Load from localStorage directly
        let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        
        // Try to load from backend API as well
        try {
            const API_BASE = 'http://localhost:3000/api';
            const USER_ID = 'default-user';
            const response = await fetch(`${API_BASE}/expenses`, {
                headers: { 'x-user-id': USER_ID }
            });
            if (response.ok) {
                const data = await response.json();
                expenses = data.data || expenses;
                // Save to localStorage
                localStorage.setItem('expenses', JSON.stringify(expenses));
            }
        } catch (apiError) {
            console.log('Backend not available, using localStorage');
        }
        
        updateStats(expenses);
        displayRecentExpenses(expenses);
        displayCategoryBreakdown(expenses);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function updateStats(expenses) {
    const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const count = expenses.length;
    const avg = count > 0 ? total / count : 0;
    
    // This month calculation
    const now = new Date();
    const thisMonth = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === now.getMonth() && 
               expDate.getFullYear() === now.getFullYear();
    });
    const monthTotal = thisMonth.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    
    document.getElementById('total-amount').textContent = `₹${total.toFixed(2)}`;
    document.getElementById('month-amount').textContent = `₹${monthTotal.toFixed(2)}`;
    document.getElementById('total-count').textContent = count;
    document.getElementById('avg-amount').textContent = `₹${avg.toFixed(2)}`;
}

function displayRecentExpenses(expenses) {
    const container = document.getElementById('recent-expenses');
    const recent = expenses.slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="loading">No expenses yet</p>';
        return;
    }
    
    container.innerHTML = recent.map(exp => `
        <div class="recent-item">
            <div class="recent-item-left">
                <div class="recent-icon">${getCategoryEmoji(exp.category)}</div>
                <div class="recent-info">
                    <h4>${exp.category}</h4>
                    <p>${new Date(exp.date).toLocaleDateString('hi-IN')}</p>
                </div>
            </div>
            <div class="recent-amount">₹${parseFloat(exp.amount).toFixed(2)}</div>
        </div>
    `).join('');
}

function displayCategoryBreakdown(expenses) {
    const container = document.getElementById('category-breakdown');
    const categoryTotals = {};
    let maxAmount = 0;
    
    expenses.forEach(exp => {
        const cat = exp.category;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(exp.amount);
        maxAmount = Math.max(maxAmount, categoryTotals[cat]);
    });
    
    if (Object.keys(categoryTotals).length === 0) {
        container.innerHTML = '<p class="loading">No data available</p>';
        return;
    }
    
    container.innerHTML = Object.entries(categoryTotals).map(([cat, amount]) => {
        const percentage = (amount / maxAmount) * 100;
        return `
            <div class="category-item">
                <span class="category-name">${getCategoryEmoji(cat)} ${cat}</span>
                <div class="category-bar">
                    <div class="category-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="category-amount">₹${amount.toFixed(2)}</span>
            </div>
        `;
    }).join('');
}

function getCategoryEmoji(category) {
    const emojis = {
        'Food': '🍔',
        'Transport': '🚗',
        'Entertainment': '🎬',
        'Shopping': '🛍️',
        'Bills': '💡',
        'Health': '⚕️',
        'Education': '📚',
        'Other': '📌'
    };
    return emojis[category] || '📌';
}

function exportData() {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const dataStr = JSON.stringify(expenses, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Load dashboard on page load
loadDashboard();
