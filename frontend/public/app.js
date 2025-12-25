// Simple Expense Tracker - Vanilla JavaScript
// Backend API base URL
const API_BASE = 'http://localhost:3000/api';
const USER_ID = 'default-user';

// Global state
let expenses = [];
let currentEditId = null;

// Add Expense Function - Used by add-expense.html
async function addExpense(expenseData) {
    try {
        const response = await fetch(`${API_BASE}/expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': USER_ID
            },
            body: JSON.stringify(expenseData)
        });
        
        if (!response.ok) throw new Error('Failed to add expense');
        
        const data = await response.json();
        
        // Add to local array
        expenses.unshift(data.data);
        saveToLocalStorage();
        
        return data.data;
        
    } catch (error) {
        console.error('Error adding expense:', error);
        
        // Fallback: add to localStorage
        expenseData.id = expenseData.id || Date.now().toString();
        expenseData.createdAt = new Date().toISOString();
        expenses.unshift(expenseData);
        saveToLocalStorage();
        
        return expenseData;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if these elements exist (for index.html)
    if (document.getElementById('date')) {
        document.getElementById('date').valueAsDate = new Date();
    }
    
    if (document.getElementById('expense-form') && document.querySelector('.tab')) {
        // Setup form submit for index.html
        document.getElementById('expense-form').addEventListener('submit', handleFormSubmit);
        // Show list tab by default
        showTab('list');
    }
    
    // Load expenses for pages that need it
    if (typeof displayExpenses === 'function') {
        loadExpenses();
    }
});

// Tab Navigation
function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.add('hidden'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.remove('hidden');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Refresh data if needed
    if (tabName === 'list') {
        loadExpenses();
    } else if (tabName === 'summary') {
        calculateSummary();
    }
}

// Load expenses from backend
async function loadExpenses() {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/expenses`, {
            headers: {
                'x-user-id': USER_ID
            }
        });
        
        if (!response.ok) throw new Error('Failed to load expenses');
        
        const data = await response.json();
        expenses = data.data || [];
        
        displayExpenses();
        showError('');
    } catch (error) {
        console.error('Error loading expenses:', error);
        showError('Expenses load nahi ho paye. Backend server check karein.');
        expenses = loadFromLocalStorage(); // Fallback to localStorage
        displayExpenses();
    } finally {
        showLoading(false);
    }
}

// Display expenses in table
function displayExpenses() {
    const tbody = document.getElementById('expenses-body');
    const emptyMessage = document.getElementById('empty-message');
    
    if (expenses.length === 0) {
        tbody.innerHTML = '';
        emptyMessage.classList.remove('hidden');
        return;
    }
    
    emptyMessage.classList.add('hidden');
    
    tbody.innerHTML = expenses.map(expense => `
        <tr>
            <td>${formatDate(expense.date)}</td>
            <td>${expense.category}</td>
            <td>${expense.description || '-'}</td>
            <td class="amount">₹${expense.amount.toFixed(2)}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="editExpense('${expense.id}')">Edit</button>
                <button class="btn btn-delete" onclick="deleteExpense('${expense.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Handle form submit
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    
    if (!amount || amount <= 0) {
        showError('Amount valid nahi hai');
        return;
    }
    
    const expenseData = {
        amount,
        category,
        date,
        description,
        billUrl: null
    };
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': USER_ID
            },
            body: JSON.stringify(expenseData)
        });
        
        if (!response.ok) throw new Error('Failed to add expense');
        
        const data = await response.json();
        
        // Add to local array
        expenses.unshift(data.data);
        saveToLocalStorage();
        
        // Reset form
        document.getElementById('expense-form').reset();
        document.getElementById('date').valueAsDate = new Date();
        
        // Switch to list tab
        showTab('list');
        showError('', true);
        
    } catch (error) {
        console.error('Error adding expense:', error);
        
        // Fallback: add to localStorage
        expenseData.id = Date.now().toString();
        expenseData.createdAt = new Date().toISOString();
        expenses.unshift(expenseData);
        saveToLocalStorage();
        
        // Reset form
        document.getElementById('expense-form').reset();
        document.getElementById('date').valueAsDate = new Date();
        
        showTab('list');
        showError('Backend se connect nahi hua, lekin expense save ho gaya (local).');
    } finally {
        showLoading(false);
    }
}

// Delete expense
async function deleteExpense(id) {
    if (!confirm('Kya aap ye expense delete karna chahte hain?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/expenses/${id}`, {
            method: 'DELETE',
            headers: {
                'x-user-id': USER_ID
            }
        });
        
        if (!response.ok) throw new Error('Failed to delete');
        
        expenses = expenses.filter(e => e.id !== id);
        saveToLocalStorage();
        displayExpenses();
        showError('');
        
    } catch (error) {
        console.error('Error deleting expense:', error);
        
        // Fallback: delete from localStorage
        expenses = expenses.filter(e => e.id !== id);
        saveToLocalStorage();
        displayExpenses();
        showError('Backend se connect nahi hua, lekin expense delete ho gaya (local).');
    }
}

// Edit expense
function editExpense(id) {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;
    
    document.getElementById('amount').value = expense.amount;
    document.getElementById('category').value = expense.category;
    document.getElementById('date').value = expense.date;
    document.getElementById('description').value = expense.description || '';
    
    currentEditId = id;
    showTab('add');
    
    // Change button text
    const submitBtn = document.querySelector('#expense-form button[type="submit"]');
    submitBtn.textContent = 'Update Expense';
}

// Calculate and display summary
function calculateSummary() {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const count = expenses.length;
    const average = count > 0 ? total / count : 0;
    
    // Category breakdown
    const categoryBreakdown = {};
    expenses.forEach(expense => {
        if (!categoryBreakdown[expense.category]) {
            categoryBreakdown[expense.category] = { total: 0, count: 0 };
        }
        categoryBreakdown[expense.category].total += expense.amount;
        categoryBreakdown[expense.category].count += 1;
    });
    
    // Update stats
    document.getElementById('total-spent').textContent = `₹${total.toFixed(2)}`;
    document.getElementById('total-count').textContent = count;
    document.getElementById('average-spent').textContent = `₹${average.toFixed(2)}`;
    document.getElementById('category-count').textContent = Object.keys(categoryBreakdown).length;
    
    // Update category table
    const categoryBody = document.getElementById('category-body');
    categoryBody.innerHTML = Object.entries(categoryBreakdown)
        .sort(([,a], [,b]) => b.total - a.total)
        .map(([category, data]) => `
            <tr>
                <td>${category}</td>
                <td class="amount">₹${data.total.toFixed(2)}</td>
                <td>${data.count}</td>
                <td>${((data.total / total) * 100).toFixed(1)}%</td>
            </tr>
        `).join('');
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('hi-IN', options);
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

function showError(message, isSuccess = false) {
    const errorDiv = document.getElementById('error-message');
    if (message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        if (isSuccess) {
            errorDiv.style.backgroundColor = '#d4edda';
            errorDiv.style.color = '#155724';
        }
    } else {
        errorDiv.classList.add('hidden');
    }
}

// LocalStorage fallback
function saveToLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

funDelete expense function
async function deleteExpenseById(id) {
    return await deleteExpense(id);
}

// ction loadFromLocalStorage() {
    const stored = localStorage.getItem('expenses');
    return stored ? JSON.parse(stored) : [];
}

// Initial load from localStorage if backend fails
if (expenses.length === 0) {
    expenses = loadFromLocalStorage();
}
