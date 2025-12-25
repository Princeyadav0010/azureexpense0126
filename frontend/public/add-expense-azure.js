// Add Expense with Azure Backend Integration

// Check authentication
if (!API.isAuthenticated()) {
    window.location.replace('login.html');
}

const currentUser = API.getCurrentUser();

// Load quick stats on page load
async function loadQuickStats() {
    try {
        console.log('Loading quick stats...');
        const expenses = await API.getExpenses();
        
        console.log(`Loaded ${expenses.length} expenses for current user`);
        
        if (!expenses || expenses.length === 0) {
            console.log('No expenses found for current user');
            return;
        }
        
        // Calculate today's total
        const today = new Date().toISOString().split('T')[0];
        const todayExpenses = expenses.filter(e => e.date.startsWith(today));
        const todayTotal = todayExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
        
        // Calculate this week's total
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
        weekStart.setHours(0, 0, 0, 0);
        
        const thisWeekExpenses = expenses.filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate >= weekStart;
        });
        const weekTotal = thisWeekExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
        
        // Get last entry
        const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        const lastExpense = sortedExpenses[0];
        
        // Update DOM
        const todayEl = document.getElementById('today-total');
        const weekEl = document.getElementById('week-total');
        const lastEntryEl = document.getElementById('last-entry');
        
        if (todayEl) todayEl.textContent = `₹${todayTotal.toFixed(2)}`;
        if (weekEl) weekEl.textContent = `₹${weekTotal.toFixed(2)}`;
        if (lastEntryEl && lastExpense) {
            lastEntryEl.textContent = `₹${parseFloat(lastExpense.amount).toFixed(2)}`;
        }
        
        console.log('Stats updated:', { today: todayTotal, week: weekTotal, last: lastExpense?.amount });
    } catch (error) {
        console.error('Failed to load quick stats:', error);
    }
}

// Logout function
window.logout = function() {
    console.log('Logout function called!');
    API.logout();
};

// Attach logout event listener
document.addEventListener('DOMContentLoaded', function() {
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.logout();
        });
    }
});

// Get form elements
const expenseForm = document.getElementById('expense-form');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const descriptionInput = document.getElementById('description');
const dateInput = document.getElementById('date');

// Set today's date as default
if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today; // Can't select future dates
}

// Form submission
if (expenseForm) {
    expenseForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const amount = parseFloat(amountInput.value);
        const category = categorySelect.value;
        const description = descriptionInput.value.trim();
        const date = dateInput.value;
        
        // Validation
        if (!amount || amount <= 0) {
            showToast && showToast('Please enter a valid amount', 'error');
            return;
        }
        
        if (!category) {
            showToast && showToast('Please select a category', 'error');
            return;
        }
        
        if (!date) {
            showToast && showToast('Please select a date', 'error');
            return;
        }
        
        try {
            console.log('Creating expense in Azure...');
            
            // Disable submit button
            const submitBtn = expenseForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Saving...';
            }
            
            // Create expense via API
            const result = await API.createExpense(amount, category, description, date);
            
            console.log('Expense created:', result);
            
            showToast && showToast('Expense added successfully to Azure!', 'success');
            
            // Reset form
            expenseForm.reset();
            if (dateInput) {
                const today = new Date().toISOString().split('T')[0];
                dateInput.value = today;
            }
            
            // Re-enable submit button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Add Expense';
            }
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            console.error('Failed to create expense:', error);
            showToast && showToast(error.message || 'Failed to add expense', 'error');
            
            // Re-enable submit button
            const submitBtn = expenseForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Add Expense';
            }
        }
    });
}

// Amount input - format as currency
if (amountInput) {
    amountInput.addEventListener('blur', function() {
        if (this.value) {
            const amount = parseFloat(this.value);
            if (!isNaN(amount)) {
                this.value = amount.toFixed(2);
            }
        }
    });
}

// Category icons
const categoryIcons = {
    'Food': '🍔',
    'Transport': '🚗',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Bills': '📄',
    'Healthcare': '⚕️',
    'Education': '📚',
    'Other': '📌'
};

// Update category icon
if (categorySelect) {
    categorySelect.addEventListener('change', function() {
        const icon = categoryIcons[this.value] || '📌';
        const label = document.querySelector('label[for="category"]');
        if (label) {
            label.textContent = `${icon} Category`;
        }
    });
}

// Cancel button
const cancelBtn = document.querySelector('.cancel-btn');
if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
        window.location.href = 'dashboard.html';
    });
}

// Load stats when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing stats...');
    loadQuickStats();
});

console.log('Add Expense page ready with Azure backend!');
