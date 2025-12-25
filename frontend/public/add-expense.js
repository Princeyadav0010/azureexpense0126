// add-expense.js - Add Expense Page Logic

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

// Set today's date as default
document.getElementById('date').valueAsDate = new Date();

// Bill upload handling
let billFile = null;

window.previewBill = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        alert('❌ File size should be less than 5MB');
        event.target.value = '';
        return;
    }
    
    // Store file for upload
    billFile = file;
    
    // Show preview for images
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('preview-image').src = e.target.result;
            document.getElementById('bill-preview').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    } else {
        // For PDFs, show a placeholder
        document.getElementById('preview-image').src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQ4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+ThDwvdGV4dD48L3N2Zz4=';
        document.getElementById('bill-preview').classList.remove('hidden');
    }
};

window.removeBill = function() {
    billFile = null;
    document.getElementById('bill-upload').value = '';
    document.getElementById('bill-preview').classList.add('hidden');
    document.getElementById('preview-image').src = '';
};

// Handle form submission
document.getElementById('expense-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const expense = {
        id: Date.now().toString(),
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        date: document.getElementById('date').value,
        paymentMethod: document.getElementById('payment-method').value,
        description: document.getElementById('description').value,
        billImage: null
    };
    
    // Convert bill to base64 if uploaded
    if (billFile) {
        const reader = new FileReader();
        await new Promise((resolve) => {
            reader.onload = function(e) {
                expense.billImage = e.target.result;
                expense.billFileName = billFile.name;
                resolve();
            };
            reader.readAsDataURL(billFile);
        });
    }
    
    try {
        // Direct API call instead of using addExpense function
        const API_BASE = 'http://localhost:3000/api';
        const USER_ID = 'default-user';
        
        const response = await fetch(`${API_BASE}/expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': USER_ID
            },
            body: JSON.stringify(expense)
        });
        
        if (!response.ok) throw new Error('Backend error');
        
        const data = await response.json();
        
        // Also save to localStorage
        let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        expenses.unshift(data.data || expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
        // Show success message
        const successMsg = document.getElementById('success-message');
        successMsg.classList.remove('hidden');
        setTimeout(() => successMsg.classList.add('hidden'), 3000);
        
        // Reset form
        document.getElementById('expense-form').reset();
        document.getElementById('date').valueAsDate = new Date();
        removeBill();
        
        // Update side stats
        updateSideStats();
        
    } catch (error) {
        console.error('Backend failed, saving locally:', error);
        
        // Fallback: Save to localStorage only
        let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        expenses.unshift(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
        // Show success message
        const successMsg = document.getElementById('success-message');
        successMsg.classList.remove('hidden');
        setTimeout(() => successMsg.classList.add('hidden'), 3000);
        
        // Reset form
        document.getElementById('expense-form').reset();
        document.getElementById('date').valueAsDate = new Date();
        removeBill();
        
        // Update side stats
        updateSideStats();
    }
});

function resetForm() {
    document.getElementById('expense-form').reset();
    document.getElementById('date').valueAsDate = new Date();
    removeBill();
    removeBill();
}

async function updateSideStats() {
    // Load from localStorage
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const now = new Date();
    
    // Today's total
    const today = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.toDateString() === now.toDateString();
    });
    const todayTotal = today.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    document.getElementById('today-total').textContent = `₹${todayTotal.toFixed(2)}`;
    
    // This week's total
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const thisWeek = expenses.filter(exp => new Date(exp.date) >= weekStart);
    const weekTotal = thisWeek.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    document.getElementById('week-total').textContent = `₹${weekTotal.toFixed(2)}`;
    
    // Last entry
    if (expenses.length > 0) {
        const last = expenses[0];
        document.getElementById('last-entry').textContent = 
            `${last.category} - ₹${parseFloat(last.amount).toFixed(2)}`;
    }
}

// Load side stats on page load
updateSideStats();

// AI Caption Generator Function
function generateAICaption() {
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    
    if (!amount || !category || !date) {
        alert('Please fill Amount, Category, and Date first!');
        return;
    }
    
    const tempExpense = { amount, category, date };
    const caption = AIInsights.generateSmartCaption(tempExpense);
    
    document.getElementById('description').value = caption;
    
    // Show animation
    const textarea = document.getElementById('description');
    textarea.style.animation = 'slideDown 0.3s ease';
    setTimeout(() => textarea.style.animation = '', 300);
}
