// reports.js - Reports & Analytics Page Logic

// Check if user is logged in
const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
if (!currentUser) {
    window.location.replace('login.html');
}

// Logout function
window.logout = function() {
    console.log('Logout function called!');
    localStorage.clear();
    window.location.href = '/login.html';
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

// Set current date
document.getElementById('current-date').textContent = new Date().toLocaleDateString('hi-IN');

let currentPeriod = 'week';
let allExpenses = [];

// Period selector
document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentPeriod = this.dataset.period;
        loadReports();
    });
});

async function loadReports() {
    try {
        // Load from localStorage
        allExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        
        // Try backend sync
        try {
            const API_BASE = 'http://localhost:3000/api';
            const USER_ID = 'default-user';
            const response = await fetch(`${API_BASE}/expenses`, {
                headers: { 'x-user-id': USER_ID }
            });
            if (response.ok) {
                const data = await response.json();
                allExpenses = data.data || allExpenses;
                localStorage.setItem('expenses', JSON.stringify(allExpenses));
            }
        } catch (e) { console.log('Backend not available'); }
        
        const filteredExpenses = filterByPeriod(allExpenses, currentPeriod);
        
        updateReportStats(filteredExpenses);
        displayCategoryChart(filteredExpenses);
        displayTrendChart(filteredExpenses);
        displayCategoryDetails(filteredExpenses);
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

function filterByPeriod(expenses, period) {
    const now = new Date();
    
    switch(period) {
        case 'week':
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            return expenses.filter(exp => new Date(exp.date) >= weekStart);
        
        case 'month':
            return expenses.filter(exp => {
                const expDate = new Date(exp.date);
                return expDate.getMonth() === now.getMonth() && 
                       expDate.getFullYear() === now.getFullYear();
            });
        
        case 'year':
            return expenses.filter(exp => {
                const expDate = new Date(exp.date);
                return expDate.getFullYear() === now.getFullYear();
            });
        
        case 'all':
        default:
            return expenses;
    }
}

function updateReportStats(expenses) {
    const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const days = getDaysInPeriod(currentPeriod);
    const avgPerDay = days > 0 ? total / days : 0;
    
    // Category totals
    const categoryTotals = {};
    expenses.forEach(exp => {
        const cat = exp.category;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(exp.amount);
    });
    
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    
    document.getElementById('report-total').textContent = `₹${total.toFixed(2)}`;
    document.getElementById('report-avg').textContent = `₹${avgPerDay.toFixed(2)}`;
    document.getElementById('report-top-category').textContent = topCategory ? topCategory[0] : '-';
    document.getElementById('report-trend').textContent = calculateTrend(expenses);
}

function getDaysInPeriod(period) {
    switch(period) {
        case 'week': return 7;
        case 'month': return 30;
        case 'year': return 365;
        default: return 1;
    }
}

function calculateTrend(expenses) {
    if (expenses.length < 2) return 'No data';
    
    const sorted = expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
    
    const firstTotal = firstHalf.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const secondTotal = secondHalf.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    
    if (secondTotal > firstTotal) return '📈 Increasing';
    if (secondTotal < firstTotal) return '📉 Decreasing';
    return '➡️ Stable';
}

function displayCategoryChart(expenses) {
    const categoryTotals = {};
    let maxAmount = 0;
    
    expenses.forEach(exp => {
        const cat = exp.category;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(exp.amount);
        maxAmount = Math.max(maxAmount, categoryTotals[cat]);
    });
    
    const container = document.getElementById('bar-chart');
    container.innerHTML = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amount]) => {
            const percentage = (amount / maxAmount) * 100;
            return `
                <div class="category-item">
                    <span class="category-name">${cat}</span>
                    <div class="category-bar">
                        <div class="category-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="category-amount">₹${amount.toFixed(2)}</span>
                </div>
            `;
        }).join('');
}

function displayTrendChart(expenses) {
    const container = document.getElementById('line-chart');
    
    // Group by date
    const dateGroups = {};
    expenses.forEach(exp => {
        const date = exp.date;
        dateGroups[date] = (dateGroups[date] || 0) + parseFloat(exp.amount);
    });
    
    const sorted = Object.entries(dateGroups).sort((a, b) => new Date(a[0]) - new Date(b[0]));
    const maxAmount = Math.max(...sorted.map(([_, amount]) => amount));
    
    container.innerHTML = sorted.slice(-10).map(([date, amount]) => {
        const percentage = (amount / maxAmount) * 100;
        return `
            <div class="category-item">
                <span class="category-name">${new Date(date).toLocaleDateString('hi-IN')}</span>
                <div class="category-bar">
                    <div class="category-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="category-amount">₹${amount.toFixed(2)}</span>
            </div>
        `;
    }).join('');
}

function displayCategoryDetails(expenses) {
    const categoryTotals = {};
    const categoryCounts = {};
    
    expenses.forEach(exp => {
        const cat = exp.category;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(exp.amount);
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    const container = document.getElementById('category-details');
    container.innerHTML = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amount]) => `
            <div class="category-detail-card">
                <h4>${cat}</h4>
                <p style="font-size: 1.5rem; font-weight: 700; color: #667eea; margin: 10px 0;">
                    ₹${amount.toFixed(2)}
                </p>
                <p style="color: #718096; font-size: 0.9rem;">
                    ${categoryCounts[cat]} transactions
                </p>
            </div>
        `).join('');
}

// Load reports on page load
loadReports();
