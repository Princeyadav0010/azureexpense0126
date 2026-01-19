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
            
            // Prepare expense data
            let billUrl = null;
            
            // Upload bill if present
            if (uploadedBillFile) {
                console.log('📤 Uploading bill:', uploadedBillFile.name, 'Size:', uploadedBillFile.size);
                if (submitBtn) submitBtn.textContent = 'Uploading bill...';
                
                try {
                    billUrl = await API.uploadBill(uploadedBillFile);
                    console.log('✅ Bill uploaded successfully:', billUrl);
                } catch (uploadError) {
                    console.error('❌ Bill upload failed:', uploadError);
                    showToast && showToast('Warning: Bill upload failed, but expense will be saved', 'warning');
                }
            } else {
                console.log('ℹ️ No bill file selected');
            }
            
            if (submitBtn) submitBtn.textContent = 'Saving expense...';
            
            // Create expense via API (with bill URL if available)
            const result = await API.createExpense(amount, category, description, date, billUrl);
            
            console.log('Expense created:', result);
            
            showToast && showToast('Expense added successfully to Azure!', 'success');
            
            // Reset form
            expenseForm.reset();
            if (dateInput) {
                const today = new Date().toISOString().split('T')[0];
                dateInput.value = today;
            }
            removeBill(); // Clear bill upload
            
            // Re-enable submit button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = '💾 Save Expense';
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
                submitBtn.textContent = '💾 Save Expense';
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

// AI Caption Generator Function - ACTIVATED
window.generateAICaption = async function() {
    console.log('🤖 AI Caption Generator activated!');
    
    const categorySelect = document.getElementById('category');
    const amountInput = document.getElementById('amount');
    const dateInput = document.getElementById('date');
    const descriptionInput = document.getElementById('description');
    
    if (!categorySelect || !categorySelect.value) {
        showToast && showToast('Please select a category first!', 'warning');
        return;
    }
    
    if (!amountInput || !amountInput.value) {
        showToast && showToast('Please enter amount first!', 'warning');
        return;
    }
    
    // Show loading state
    const aiBtn = document.querySelector('.btn-ai-suggest');
    if (aiBtn) {
        aiBtn.disabled = true;
        aiBtn.innerHTML = '⏳ Generating AI caption...';
    }
    
    try {
        // Create temporary expense object for AI
        const tempExpense = {
            amount: parseFloat(amountInput.value),
            category: categorySelect.value,
            date: dateInput.value || new Date().toISOString(),
            description: descriptionInput.value || ''
        };
        
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate smart caption using AI insights
        const caption = generateSmartCaption(tempExpense);
        
        // Set the description
        if (descriptionInput) {
            descriptionInput.value = caption;
            descriptionInput.style.animation = 'fadeIn 0.5s ease';
        }
        
        console.log('✨ AI Generated Caption:', caption);
        showToast && showToast('AI caption generated successfully! ✨', 'success');
        
    } catch (error) {
        console.error('AI Caption Error:', error);
        showToast && showToast('Failed to generate AI caption', 'error');
    } finally {
        // Restore button state
        if (aiBtn) {
            aiBtn.disabled = false;
            aiBtn.innerHTML = '✨ Generate AI Caption';
        }
    }
};

// Bill Upload Functions
let uploadedBillFile = null;

window.previewBill = function(event) {
    const file = event.target.files[0];
    if (!file) {
        console.log('⚠️ No file selected');
        return;
    }
    
    console.log('📎 File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        console.log('❌ File too large:', file.size);
        showToast && showToast('File size should not exceed 5MB', 'error');
        event.target.value = '';
        return;
    }
    
    // Store file for later upload
    uploadedBillFile = file;
    console.log('✅ Bill file stored for upload:', uploadedBillFile.name);
    
    // Preview for images
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('bill-preview');
            const img = document.getElementById('preview-image');
            
            if (img && preview) {
                img.src = e.target.result;
                preview.classList.remove('hidden');
            }
        };
        reader.readAsDataURL(file);
    } else {
        // For PDF files, show file name
        const preview = document.getElementById('bill-preview');
        const img = document.getElementById('preview-image');
        
        if (preview) {
            preview.classList.remove('hidden');
            if (img) {
                img.style.display = 'none';
            }
            // Add file name display
            const fileName = document.createElement('div');
            fileName.className = 'file-name-display';
            fileName.textContent = `📄 ${file.name}`;
            preview.insertBefore(fileName, preview.firstChild);
        }
    }
    
    console.log('Bill selected:', file.name, 'Size:', (file.size / 1024).toFixed(2), 'KB');
};

window.removeBill = function() {
    uploadedBillFile = null;
    const fileInput = document.getElementById('bill-upload');
    const preview = document.getElementById('bill-preview');
    
    if (fileInput) fileInput.value = '';
    if (preview) {
        preview.classList.add('hidden');
        // Remove any file name display
        const fileNameDisplay = preview.querySelector('.file-name-display');
        if (fileNameDisplay) fileNameDisplay.remove();
    }
    
    const img = document.getElementById('preview-image');
    if (img) {
        img.src = '';
        img.style.display = 'block';
    }
    
    console.log('Bill removed');
};

window.resetForm = function() {
    if (expenseForm) {
        expenseForm.reset();
        const today = new Date().toISOString().split('T')[0];
        if (dateInput) dateInput.value = today;
    }
    removeBill();
};

// Load stats when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing stats...');
    loadQuickStats();
});

console.log('Add Expense page ready with Azure backend!');
