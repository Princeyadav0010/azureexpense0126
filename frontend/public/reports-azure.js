// Reports with Azure Backend Integration

// Check authentication
if (!API.isAuthenticated()) {
    window.location.replace('login.html');
}

const currentUser = API.getCurrentUser();

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

// Global variables
let allExpenses = [];
let currentPeriod = 'month';
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

// Load expenses from Azure
async function loadExpenses() {
    try {
        console.log('Loading expenses from Azure for reports...');
        console.log('API Request:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.EXPENSES);
        
        const data = await API.getExpenses();
        console.log('API Response:', data);
        console.log('API Data:', JSON.stringify(data));
        
        // API.getExpenses() already returns expenses array
        allExpenses = Array.isArray(data) ? data : [];
        
        console.log(`Loaded ${allExpenses.length} expenses from Azure`);
        console.log('Reports updated:', JSON.stringify({ total: allExpenses.length, expenses: allExpenses }));
        
        generateReports();
        
    } catch (error) {
        console.error('Failed to load expenses:', error);
        showToast && showToast('Failed to load expenses from Azure', 'error');
        
        document.getElementById('reports-container').innerHTML = 
            '<p class="error">Failed to load reports. Please try again.</p>';
    }
}

// Generate all reports
function generateReports() {
    const filteredExpenses = filterExpensesByPeriod();
    
    updateSummaryStats(filteredExpenses);
    updateCategoryBreakdown(filteredExpenses);
    updateMonthlyTrend();
    updateTopExpenses(filteredExpenses);
}

// Filter expenses by selected period
function filterExpensesByPeriod() {
    if (currentPeriod === 'all') {
        return allExpenses;
    }
    
    return allExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        
        if (currentPeriod === 'month') {
            return expenseDate.getMonth() === currentMonth && 
                   expenseDate.getFullYear() === currentYear;
        } else if (currentPeriod === 'year') {
            return expenseDate.getFullYear() === currentYear;
        }
        
        return true;
    });
}

// Update summary statistics
function updateSummaryStats(expenses) {
    const totalAmount = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const totalCount = expenses.length;
    
    // Calculate average per day
    const daysInPeriod = getDaysInPeriod();
    const avgPerDay = daysInPeriod > 0 ? totalAmount / daysInPeriod : 0;
    
    // Get top category
    const categoryTotals = {};
    expenses.forEach(expense => {
        const cat = expense.category || 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(expense.amount);
    });
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    
    // Update UI elements
    const totalEl = document.getElementById('report-total');
    const avgEl = document.getElementById('report-avg');
    const topCatEl = document.getElementById('report-top-category');
    const trendEl = document.getElementById('report-trend');
    
    if (totalEl) totalEl.textContent = `₹${totalAmount.toFixed(2)}`;
    if (avgEl) avgEl.textContent = `₹${avgPerDay.toFixed(2)}`;
    if (topCatEl) topCatEl.textContent = topCategory ? topCategory[0] : '-';
    if (trendEl) trendEl.textContent = calculateTrend(expenses);
    
    console.log('Reports updated:', { total: totalAmount, count: totalCount, avgPerDay });
}

// Get days in current period
function getDaysInPeriod() {
    if (currentPeriod === 'week') return 7;
    if (currentPeriod === 'month') return 30;
    if (currentPeriod === 'year') return 365;
    return 1;
}

// Calculate trend
function calculateTrend(expenses) {
    if (expenses.length === 0) return '-';
    const recentTotal = expenses.slice(0, Math.floor(expenses.length / 2))
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const olderTotal = expenses.slice(Math.floor(expenses.length / 2))
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    
    if (olderTotal === 0) return '-';
    const change = ((recentTotal - olderTotal) / olderTotal) * 100;
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
}

// Update category breakdown
function updateCategoryBreakdown(expenses) {
    const categoryTotals = {};
    
    expenses.forEach(expense => {
        const category = expense.category;
        if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
        }
        categoryTotals[category] += parseFloat(expense.amount);
    });
    
    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    const categoryContainer = document.getElementById('category-breakdown');
    if (!categoryContainer) return;
    
    if (total === 0) {
        categoryContainer.innerHTML = '<p class="no-data">No expenses in this period</p>';
        return;
    }
    
    categoryContainer.innerHTML = '';
    
    // Sort by amount descending
    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);
    
    sortedCategories.forEach(([category, amount]) => {
        const percentage = (amount / total) * 100;
        
        const categoryRow = document.createElement('div');
        categoryRow.className = 'category-row';
        categoryRow.innerHTML = `
            <div class="category-label">
                <span class="category-icon">${getCategoryIcon(category)}</span>
                <span class="category-name">${category}</span>
            </div>
            <div class="category-bar">
                <div class="category-bar-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="category-amount">
                <span class="amount">₹${amount.toFixed(2)}</span>
                <span class="percentage">${percentage.toFixed(1)}%</span>
            </div>
        `;
        categoryContainer.appendChild(categoryRow);
    });
}

// Update monthly trend
function updateMonthlyTrend() {
    const monthlyTotals = {};
    
    // Get last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.push({
            key: monthKey,
            label: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
        });
        monthlyTotals[monthKey] = 0;
    }
    
    // Calculate totals
    allExpenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyTotals[monthKey] !== undefined) {
            monthlyTotals[monthKey] += parseFloat(expense.amount);
        }
    });
    
    const trendContainer = document.getElementById('monthly-trend');
    if (!trendContainer) return;
    
    trendContainer.innerHTML = '';
    
    const maxAmount = Math.max(...Object.values(monthlyTotals), 1);
    
    months.forEach(month => {
        const amount = monthlyTotals[month.key];
        const heightPercentage = (amount / maxAmount) * 100;
        
        const monthBar = document.createElement('div');
        monthBar.className = 'month-bar';
        monthBar.innerHTML = `
            <div class="bar-container">
                <div class="bar-fill" style="height: ${heightPercentage}%"></div>
            </div>
            <div class="bar-label">${month.label}</div>
            <div class="bar-amount">₹${amount.toFixed(0)}</div>
        `;
        trendContainer.appendChild(monthBar);
    });
}

// Update top expenses
function updateTopExpenses(expenses) {
    const topContainer = document.getElementById('top-expenses');
    if (!topContainer) return;
    
    if (expenses.length === 0) {
        topContainer.innerHTML = '<p class="no-data">No expenses in this period</p>';
        return;
    }
    
    const sortedExpenses = [...expenses]
        .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
        .slice(0, 5);
    
    topContainer.innerHTML = '';
    
    sortedExpenses.forEach((expense, index) => {
        const expenseDate = new Date(expense.date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short'
        });
        
        const expenseRow = document.createElement('div');
        expenseRow.className = 'top-expense-row';
        expenseRow.innerHTML = `
            <div class="rank">#${index + 1}</div>
            <div class="expense-details">
                <div class="expense-category">
                    <span class="category-icon">${getCategoryIcon(expense.category)}</span>
                    ${expense.category}
                </div>
                <div class="expense-description">${expense.description || 'No description'}</div>
            </div>
            <div class="expense-meta">
                <div class="expense-amount">₹${parseFloat(expense.amount).toFixed(2)}</div>
                <div class="expense-date">${expenseDate}</div>
            </div>
        `;
        topContainer.appendChild(expenseRow);
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

// Period filter buttons
const periodButtons = document.querySelectorAll('.period-btn');
periodButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        periodButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentPeriod = this.dataset.period;
        generateReports();
    });
});

// Month/Year selectors
const monthSelect = document.getElementById('month-select');
const yearSelect = document.getElementById('year-select');

if (monthSelect) {
    monthSelect.value = currentMonth;
    monthSelect.addEventListener('change', function() {
        currentMonth = parseInt(this.value);
        generateReports();
    });
}

if (yearSelect) {
    // Populate years (last 5 years)
    const currentYearVal = new Date().getFullYear();
    for (let year = currentYearVal; year >= currentYearVal - 4; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    
    yearSelect.value = currentYear;
    yearSelect.addEventListener('change', function() {
        currentYear = parseInt(this.value);
        generateReports();
    });
}

// Export report function
window.exportReport = function() {
    const filteredExpenses = filterExpensesByPeriod();
    
    if (filteredExpenses.length === 0) {
        alert('No expenses to export in this period');
        return;
    }
    
    // Create CSV
    const headers = ['Date', 'Category', 'Description', 'Amount'];
    const rows = filteredExpenses.map(e => [
        new Date(e.date).toLocaleDateString('en-IN'),
        e.category,
        e.description || '',
        parseFloat(e.amount).toFixed(2)
    ]);
    
    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast && showToast('Report exported successfully!', 'success');
};

// Initialize
console.log('Reports page initializing with Azure backend...');
loadExpenses();
