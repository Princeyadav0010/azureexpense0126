// settings.js - Settings Page Logic with Azure Backend

// Check authentication
if (!API.isAuthenticated()) {
    window.location.replace('login.html');
}

const currentUser = API.getCurrentUser();

// Set current date
document.getElementById('current-date').textContent = new Date().toLocaleDateString('hi-IN');

// Force light theme always
localStorage.setItem('theme', 'light');
document.body.setAttribute('data-theme', 'light');

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

function exportAllData() {
    // Export all expenses from Azure
    API.getExpenses()
        .then(data => {
            const expenses = data.expenses || [];
            const dataStr = JSON.stringify(expenses, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            alert('Data exported successfully from Azure!');
        })
        .catch(error => {
            console.error('Export failed:', error);
            alert('Failed to export data from Azure');
        });
}

function importData() {
    alert('Import functionality will be available soon!\n\nYou can currently add expenses through the Add Expense page.');
    // TODO: Implement bulk import to Azure
}

function clearAllData() {
    alert('Clear all data functionality is not available.\n\nYou can delete individual expenses from the Expenses page.\n\nFor account deletion, please contact support.');
}
