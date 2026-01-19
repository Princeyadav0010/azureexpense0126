// View Expenses with Azure Backend Integration

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
let filteredExpenses = [];
let currentFilter = 'all';
let currentSort = 'date-desc';

// Load expenses from Azure
async function loadExpenses() {
    try {
        console.log('Loading expenses from Azure...');
        console.log('Current user:', currentUser);
        console.log('Token exists:', !!API.getToken());
        
        const expensesTbody = document.getElementById('expenses-tbody');
        if (expensesTbody) {
            expensesTbody.innerHTML = '<tr><td colspan="6" class="loading">Loading expenses from Azure...</td></tr>';
        }
        
        const data = await API.getExpenses();
        console.log('API response:', data);
        console.log('Is array?', Array.isArray(data));
        
        // API now returns array directly (not wrapped in {expenses: []})
        allExpenses = Array.isArray(data) ? data : [];
        
        console.log(`Loaded ${allExpenses.length} expenses from Azure`);
        
        filteredExpenses = [...allExpenses];
        applyFiltersAndSort();
        displayExpenses();
        updateStats();
        
    } catch (error) {
        console.error('Failed to load expenses:', error);
        console.error('Error details:', error.message, error.stack);
        
        showToast && showToast('Failed to load expenses: ' + (error.message || 'Please try again'), 'error');
        
        const expensesTbody = document.getElementById('expenses-tbody');
        if (expensesTbody) {
            expensesTbody.innerHTML = `<tr><td colspan="6" class="error">Failed to load expenses: ${error.message || 'Please try again'}. <br><small>Check console for details.</small></td></tr>`;
        }
    }
}

// Display expenses
function displayExpenses() {
    const expensesTbody = document.getElementById('expenses-tbody');
    if (!expensesTbody) {
        console.error('expenses-tbody not found');
        return;
    }
    
    console.log('Displaying expenses:', filteredExpenses.length);
    
    if (filteredExpenses.length === 0) {
        expensesTbody.innerHTML = '<tr><td colspan="6" class="no-data">No expenses found. Add your first expense!</td></tr>';
        return;
    }
    
    expensesTbody.innerHTML = '';
    
    filteredExpenses.forEach(expense => {
        const row = createExpenseRow(expense);
        expensesTbody.appendChild(row);
    });
}

// Create expense table row
function createExpenseRow(expense) {
    const tr = document.createElement('tr');
    
    const expenseDate = new Date(expense.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    
    const categoryIcon = getCategoryIcon(expense.category);
    
    tr.innerHTML = `
        <td>${expenseDate}</td>
        <td><span class="category-badge">${categoryIcon} ${expense.category}</span></td>
        <td>${expense.description || 'No description'}</td>
        <td>${expense.paymentMethod || 'Cash'}</td>
        <td class="amount">₹${parseFloat(expense.amount).toFixed(2)}</td>
        <td class="actions">
            <button class="btn-icon" onclick="editExpense('${expense.id}')" title="Edit">✏️</button>
            <button class="btn-icon btn-danger" onclick="deleteExpense('${expense.id}')" title="Delete">🗑️</button>
        </td>
    `;
    
    return tr;
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
        'Health': '⚕️',
        'Education': '📚',
        'Other': '📌'
    };
    return icons[category] || '📌';
}

// Edit expense
window.editExpense = async function(expenseId) {
    const expense = allExpenses.find(e => e.id === expenseId);
    if (!expense) {
        console.error('Expense not found:', expenseId);
        return;
    }
    
    console.log('Editing expense:', expense);
    
    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>✏️ Edit Expense</h2>
                <button class="modal-close" onclick="closeEditModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="edit-expense-form">
                    <div class="form-group">
                        <label>Amount (₹) *</label>
                        <input type="number" id="edit-amount" value="${expense.amount}" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>Category *</label>
                        <select id="edit-category" required>
                            <option value="Food" ${expense.category === 'Food' ? 'selected' : ''}>🍔 Food</option>
                            <option value="Transport" ${expense.category === 'Transport' ? 'selected' : ''}>🚗 Transport</option>
                            <option value="Entertainment" ${expense.category === 'Entertainment' ? 'selected' : ''}>🎬 Entertainment</option>
                            <option value="Shopping" ${expense.category === 'Shopping' ? 'selected' : ''}>🛍️ Shopping</option>
                            <option value="Bills" ${expense.category === 'Bills' ? 'selected' : ''}>💡 Bills</option>
                            <option value="Health" ${expense.category === 'Health' ? 'selected' : ''}>⚕️ Health</option>
                            <option value="Education" ${expense.category === 'Education' ? 'selected' : ''}>📚 Education</option>
                            <option value="Other" ${expense.category === 'Other' ? 'selected' : ''}>📌 Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="edit-description" rows="3">${expense.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Date *</label>
                        <input type="date" id="edit-date" value="${expense.date.split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label>Payment Method</label>
                        <select id="edit-payment">
                            <option value="Cash" ${expense.paymentMethod === 'Cash' ? 'selected' : ''}>Cash</option>
                            <option value="Card" ${expense.paymentMethod === 'Card' ? 'selected' : ''}>Card</option>
                            <option value="UPI" ${expense.paymentMethod === 'UPI' ? 'selected' : ''}>UPI</option>
                            <option value="Net Banking" ${expense.paymentMethod === 'Net Banking' ? 'selected' : ''}>Net Banking</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeEditModal()">Cancel</button>
                <button class="btn btn-primary" onclick="saveExpenseEdit('${expenseId}')">💾 Save Changes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    window.currentEditModal = modal;
};

window.closeEditModal = function() {
    if (window.currentEditModal) {
        window.currentEditModal.remove();
        window.currentEditModal = null;
    }
};

window.saveExpenseEdit = async function(expenseId) {
    const amount = document.getElementById('edit-amount').value;
    const category = document.getElementById('edit-category').value;
    const description = document.getElementById('edit-description').value;
    const date = document.getElementById('edit-date').value;
    const paymentMethod = document.getElementById('edit-payment').value;
    
    if (!amount || !category || !date) {
        alert('Please fill all required fields');
        return;
    }
    
    try {
        console.log('Updating expense in Azure:', expenseId);
        
        const updateData = {
            amount: parseFloat(amount),
            category,
            description,
            date,
            paymentMethod
        };
        
        await API.updateExpense(expenseId, updateData);
        
        console.log('Expense updated successfully');
        showToast && showToast('Expense updated successfully!', 'success');
        
        closeEditModal();
        await loadExpenses();
        
    } catch (error) {
        console.error('Failed to update expense:', error);
        showToast && showToast('Failed to update expense: ' + error.message, 'error');
    }
};

// Delete expense
window.deleteExpense = async function(expenseId) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }
    
    try {
        console.log('Deleting expense from Azure:', expenseId);
        
        await API.deleteExpense(expenseId);
        
        console.log('Expense deleted successfully');
        showToast && showToast('Expense deleted successfully!', 'success');
        
        // Reload expenses
        await loadExpenses();
        
    } catch (error) {
        console.error('Failed to delete expense:', error);
        showToast && showToast('Failed to delete expense', 'error');
    }
};

// Apply filters and sorting
function applyFiltersAndSort() {
    // Filter
    if (currentFilter === 'all') {
        filteredExpenses = [...allExpenses];
    } else {
        filteredExpenses = allExpenses.filter(e => e.category === currentFilter);
    }
    
    // Sort
    switch (currentSort) {
        case 'date-desc':
            filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            filteredExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'amount-desc':
            filteredExpenses.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
            break;
        case 'amount-asc':
            filteredExpenses.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
            break;
    }
}

// Update statistics
function updateStats() {
    const totalAmount = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const totalCount = filteredExpenses.length;
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;
    
    // Update elements only if they exist
    const totalAmountEl = document.getElementById('total-amount');
    const totalCountEl = document.getElementById('total-count');
    const avgAmountEl = document.getElementById('avg-amount');
    
    if (totalAmountEl) totalAmountEl.textContent = `₹${totalAmount.toFixed(2)}`;
    if (totalCountEl) totalCountEl.textContent = totalCount;
    if (avgAmountEl) avgAmountEl.textContent = `₹${avgAmount.toFixed(2)}`;
    
    console.log('Stats updated:', { total: totalAmount, count: totalCount, avg: avgAmount });
}

// Filter buttons
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        filterButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.category;
        applyFiltersAndSort();
        displayExpenses();
        updateStats();
    });
});

// Sort dropdown
const sortSelect = document.getElementById('sort-select');
if (sortSelect) {
    sortSelect.addEventListener('change', function() {
        currentSort = this.value;
        applyFiltersAndSort();
        displayExpenses();
    });
}

// Search functionality
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        console.log('Searching:', searchTerm);
        
        if (!searchTerm) {
            filteredExpenses = [...allExpenses];
        } else {
            filteredExpenses = allExpenses.filter(e => 
                e.category.toLowerCase().includes(searchTerm) ||
                (e.description && e.description.toLowerCase().includes(searchTerm)) ||
                e.amount.toString().includes(searchTerm)
            );
        }
        
        applyFiltersAndSort();
        displayExpenses();
        updateStats();
    });
}

// Category filter
const categoryFilter = document.getElementById('category-filter');
if (categoryFilter) {
    categoryFilter.addEventListener('change', function() {
        currentFilter = this.value || 'all';
        console.log('Category filter changed:', currentFilter);
        applyFiltersAndSort();
        displayExpenses();
        updateStats();
    });
}

// Date filter
const dateFilter = document.getElementById('date-filter');
if (dateFilter) {
    dateFilter.addEventListener('change', function() {
        const filterValue = this.value;
        console.log('Date filter changed:', filterValue);
        
        if (!filterValue) {
            filteredExpenses = [...allExpenses];
        } else {
            const now = new Date();
            filteredExpenses = allExpenses.filter(e => {
                const expDate = new Date(e.date);
                
                switch(filterValue) {
                    case 'today':
                        return expDate.toDateString() === now.toDateString();
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return expDate >= weekAgo;
                    case 'month':
                        return expDate.getMonth() === now.getMonth() && 
                               expDate.getFullYear() === now.getFullYear();
                    default:
                        return true;
                }
            });
        }
        
        applyFiltersAndSort();
        displayExpenses();
        updateStats();
    });
}

// Clear filters function
window.clearFilters = function() {
    console.log('Clearing all filters');
    
    // Reset filters
    currentFilter = 'all';
    if (categoryFilter) categoryFilter.value = '';
    if (dateFilter) dateFilter.value = '';
    if (searchInput) searchInput.value = '';
    
    // Reset to all expenses
    filteredExpenses = [...allExpenses];
    applyFiltersAndSort();
    displayExpenses();
    updateStats();
    
    showToast && showToast('Filters cleared', 'success');
};

// Initialize
console.log('Expenses page initializing with Azure backend...');
loadExpenses();
