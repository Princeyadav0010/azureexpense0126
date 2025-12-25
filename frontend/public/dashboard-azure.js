// Dashboard.js - Dashboard Page Logic with Azure Backend

// Check authentication using API helper
if (!API.isAuthenticated()) {
    window.location.replace('login.html');
}

const currentUser = API.getCurrentUser();

// Prevent back button to login after successful login
window.history.pushState(null, null, window.location.href);
window.onpopstate = function() {
    window.history.pushState(null, null, window.location.href);
};

// Logout function
window.logout = function() {
    console.log('Logout function called!');
    API.logout();
};

// Display user name
if (document.querySelector('.user-info')) {
    const userInfo = document.querySelector('.user-info');
    const userName = document.createElement('span');
    userName.textContent = currentUser?.name || 'User';
    userName.style.marginRight = '10px';
    userInfo.insertBefore(userName, userInfo.firstChild);
}

// Dashboard data
let expenses = [];
let totalExpenses = 0;
let monthExpenses = 0;

// Load expenses from Azure Cosmos DB
async function loadExpenses() {
    try {
        console.log('Loading expenses from Azure...');
        const data = await API.getExpenses();
        expenses = data || []; // API now returns array directly
        
        console.log(`Loaded ${expenses.length} expenses from Azure`);
        updateDashboard();
        updateRecentExpenses();
    } catch (error) {
        console.error('Failed to load expenses:', error);
        showToast && showToast('Failed to load expenses from Azure', 'error');
    }
}

// Update dashboard statistics
function updateDashboard() {
    // Calculate total expenses
    totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    
    // Calculate this month's expenses
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    }).reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    
    // Update UI
    const totalAmountEl = document.getElementById('total-amount');
    const monthAmountEl = document.getElementById('month-amount');
    const totalCountEl = document.getElementById('total-count');
    const avgAmountEl = document.getElementById('avg-amount');
    
    if (totalAmountEl) totalAmountEl.textContent = `₹${totalExpenses.toFixed(2)}`;
    if (monthAmountEl) monthAmountEl.textContent = `₹${monthExpenses.toFixed(2)}`;
    if (totalCountEl) totalCountEl.textContent = expenses.length;
    
    // Calculate average
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    if (avgAmountEl) avgAmountEl.textContent = `₹${avgExpense.toFixed(2)}`;
    
    console.log('Dashboard updated:', { total: totalExpenses, month: monthExpenses, count: expenses.length });
    
    updateCategoryBreakdown();
}

// Update recent expenses list
function updateRecentExpenses() {
    const recentList = document.getElementById('recent-expenses');
    if (!recentList) {
        console.error('recent-expenses element not found');
        return;
    }
    
    console.log('Updating recent expenses, count:', expenses.length);
    recentList.innerHTML = '';
    
    if (expenses.length === 0) {
        recentList.innerHTML = '<p class="no-data">No expenses yet. Add your first expense!</p>';
        return;
    }
    
    // Show last 5 expenses
    const recentExpenses = expenses.slice(0, 5);
    
    recentExpenses.forEach(expense => {
        const expenseItem = document.createElement('div');
        expenseItem.className = 'expense-item';
        
        const expenseDate = new Date(expense.date).toLocaleDateString('en-IN');
        
        expenseItem.innerHTML = `
            <div class="expense-icon">${getCategoryIcon(expense.category)}</div>
            <div class="expense-details">
                <div class="expense-category">${expense.category}</div>
                <div class="expense-date">${expenseDate}</div>
            </div>
            <div class="expense-amount">₹${parseFloat(expense.amount).toFixed(2)}</div>
        `;
        
        recentList.appendChild(expenseItem);
    });
}

// Update category breakdown
function updateCategoryBreakdown() {
    const categoryContainer = document.getElementById('category-breakdown');
    if (!categoryContainer) return;
    
    // Group expenses by category
    const categoryTotals = {};
    expenses.forEach(exp => {
        const cat = exp.category || 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(exp.amount);
    });
    
    categoryContainer.innerHTML = '';
    
    if (Object.keys(categoryTotals).length === 0) {
        categoryContainer.innerHTML = '<p class="no-data">No category data yet</p>';
        return;
    }
    
    // Sort by amount
    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    
    sortedCategories.forEach(([category, amount]) => {
        const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
        
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.innerHTML = `
            <div class="category-info">
                <span class="category-icon">${getCategoryIcon(category)}</span>
                <span class="category-name">${category}</span>
            </div>
            <div class="category-bar">
                <div class="category-progress" style="width: ${percentage}%"></div>
            </div>
            <div class="category-amount">₹${amount.toFixed(2)}</div>
        `;
        
        categoryContainer.appendChild(categoryItem);
    });
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        'Food': '🍔',
        'Transport': '🚗',
        'Shopping': '🛍️',
        'Entertainment': '🎬',
        'Bills': '📄',
        'Healthcare': '⚕️',
        'Education': '📚',
        'Other': '📌'
    };
    return icons[category] || '📌';
}

// View all expenses button
const viewAllBtn = document.querySelector('.view-all-btn');
if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
        window.location.href = 'expenses.html';
    });
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Dashboard initializing with Azure backend...');
    
    // Attach logout event listener
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Logout clicked!');
            window.logout();
        });
    }
    
    // Load expenses from Azure
    await loadExpenses();
    
    console.log('Dashboard ready!');
});
