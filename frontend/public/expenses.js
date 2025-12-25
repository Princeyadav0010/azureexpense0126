// expenses.js - View All Expenses Page Logic

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

let allExpenses = [];

// Load expenses
async function loadAllExpenses() {
    try {
        // Load from localStorage
        allExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        
        // Try to sync with backend
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
        } catch (apiError) {
            console.log('Backend not available, using localStorage');
        }
        
        displayExpenses(allExpenses);
    } catch (error) {
        console.error('Error loading expenses:', error);
    }
}

function displayExpenses(expenses) {
    const tbody = document.getElementById('expenses-tbody');
    
    if (expenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No expenses found</td></tr>';
        return;
    }
    
    tbody.innerHTML = expenses.map(exp => `
        <tr>
            <td>${new Date(exp.date).toLocaleDateString('hi-IN')}</td>
            <td>${exp.category}</td>
            <td>
                ${exp.description || '-'}
                ${exp.billImage ? `<br><button class="btn-view-bill" onclick="viewBill('${exp.id}')">📄 View Bill</button>` : ''}
            </td>
            <td>${exp.paymentMethod || '-'}</td>
            <td class="amount">₹${parseFloat(exp.amount).toFixed(2)}</td>
            <td>
                <button class="btn btn-small btn-danger" onclick="deleteExpenseById('${exp.id}')">
                    🗑️ Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Search functionality
document.getElementById('search-input').addEventListener('input', function(e) {
    filterExpenses();
});

// Category filter
document.getElementById('category-filter').addEventListener('change', function() {
    filterExpenses();
});

// Date filter
document.getElementById('date-filter').addEventListener('change', function() {
    filterExpenses();
});

function filterExpenses() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    
    let filtered = allExpenses;
    
    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(exp => 
            exp.category.toLowerCase().includes(searchTerm) ||
            (exp.description && exp.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // Category filter
    if (categoryFilter) {
        filtered = filtered.filter(exp => exp.category === categoryFilter);
    }
    
    // Date filter
    if (dateFilter) {
        const now = new Date();
        filtered = filtered.filter(exp => {
            const expDate = new Date(exp.date);
            
            switch(dateFilter) {
                case 'today':
                    return expDate.toDateString() === now.toDateString();
                case 'week':
                    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                    return expDate >= weekStart;
                case 'month':
                    return expDate.getMonth() === now.getMonth() && 
                           expDate.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });
    }
    
    displayExpenses(filtered);
}

function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('date-filter').value = '';
    displayExpenses(allExpenses);
}

async function deleteExpenseById(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        try {
            // Delete from localStorage
            allExpenses = allExpenses.filter(exp => exp.id !== id);
            localStorage.setItem('expenses', JSON.stringify(allExpenses));
            
            // Try backend delete
            try {
                const API_BASE = 'http://localhost:3000/api';
                const USER_ID = 'default-user';
                await fetch(`${API_BASE}/expenses/${id}`, {
                    method: 'DELETE',
                    headers: { 'x-user-id': USER_ID }
                });
            } catch (e) { console.log('Backend not available'); }
            
            await loadAllExpenses();
        } catch (error) {
            alert('Error deleting expense: ' + error.message);
        }
    }
}

async function deleteAll() {
    if (confirm('Are you sure you want to delete ALL expenses? This cannot be undone!')) {
        if (confirm('Really delete everything? Last chance!')) {
            // Clear localStorage
            localStorage.removeItem('expenses');
            allExpenses = [];
            
            // Try to delete from backend
            try {
                const API_BASE = 'http://localhost:3000/api';
                const USER_ID = 'default-user';
                // Delete each expense from backend
                const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
                for (const exp of expenses) {
                    await fetch(`${API_BASE}/expenses/${exp.id}`, {
                        method: 'DELETE',
                        headers: { 'x-user-id': USER_ID }
                    });
                }
            } catch (e) { 
                console.log('Backend not available'); 
            }
            
            // Clear and reload
            localStorage.setItem('expenses', JSON.stringify([]));
            await loadAllExpenses();
            alert('All expenses deleted successfully!');
        }
    }
}

function exportCSV() {
    if (allExpenses.length === 0) {
        alert('No expenses to export!');
        return;
    }
    
    const headers = ['Date', 'Category', 'Amount', 'Payment Method', 'Description'];
    const rows = allExpenses.map(exp => [
        exp.date,
        exp.category,
        exp.amount,
        exp.paymentMethod || '',
        exp.description || ''
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(val => `"${val}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// View bill in modal
window.viewBill = function(expenseId) {
    const expense = allExpenses.find(exp => exp.id === expenseId);
    if (!expense || !expense.billImage) {
        alert('Bill not found!');
        return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'bill-modal';
    modal.innerHTML = `
        <div class="bill-modal-content">
            <span class="bill-modal-close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>📄 Bill/Receipt</h2>
            <img src="${expense.billImage}" alt="Bill" style="max-width: 100%; max-height: 70vh; border-radius: 8px;">
            <div class="bill-modal-info">
                <p><strong>Date:</strong> ${new Date(expense.date).toLocaleDateString('hi-IN')}</p>
                <p><strong>Amount:</strong> ₹${parseFloat(expense.amount).toFixed(2)}</p>
                <p><strong>Category:</strong> ${expense.category}</p>
                ${expense.billFileName ? `<p><strong>File:</strong> ${expense.billFileName}</p>` : ''}
            </div>
            <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
    
    document.body.appendChild(modal);
};

// Load expenses on page load
loadAllExpenses();
