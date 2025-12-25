// AI-Powered Insights & Summary Generator

// AI Caption Generator for Expenses
function generateSmartCaption(expense) {
    const amount = parseFloat(expense.amount);
    const category = expense.category;
    const date = new Date(expense.date);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    const captions = {
        'Food': [
            `Delicious meal enjoyed on ${dayOfWeek}! 🍽️`,
            `Fueling up with great food - ₹${amount} well spent! 🍔`,
            `Another tasty experience at ₹${amount} 😋`,
            `Food brings joy! ${dayOfWeek} special treat 🍕`
        ],
        'Transport': [
            `Journey on ${dayOfWeek} - Safely reached destination! 🚗`,
            `Commute cost: ₹${amount} - Time well invested 🚕`,
            `Travel expenses for a productive ${dayOfWeek} 🚌`,
            `On the move! Transportation essential 🛺`
        ],
        'Entertainment': [
            `Fun times on ${dayOfWeek}! Entertainment ₹${amount} 🎬`,
            `Creating memories - Worth every rupee! 🎉`,
            `Relaxation and fun for ₹${amount} 🎮`,
            `${dayOfWeek} vibes! Entertainment done right 🎪`
        ],
        'Shopping': [
            `Smart shopping on ${dayOfWeek}! New additions 🛍️`,
            `Retail therapy - ₹${amount} invested in essentials 🛒`,
            `Shopping success! Great finds for ₹${amount} 💳`,
            `${dayOfWeek} shopping spree - Necessary purchases ✨`
        ],
        'Bills': [
            `Essential bills paid - Responsibility matters! 💡`,
            `Utilities and necessities - ₹${amount} well managed 📋`,
            `Keeping things running smoothly with ₹${amount} 🏠`,
            `${dayOfWeek} bill payment - Adulting done! ✅`
        ],
        'Health': [
            `Health is wealth! ₹${amount} for well-being ⚕️`,
            `Investing in health on ${dayOfWeek} 💊`,
            `Medical expenses - Taking care of myself ❤️`,
            `Wellness priority - ₹${amount} for better health 🏥`
        ],
        'Education': [
            `Learning investment - ₹${amount} for growth 📚`,
            `Knowledge pays! Education expense on ${dayOfWeek} 🎓`,
            `Skill development - ₹${amount} well invested 📖`,
            `Future-focused spending on education 🧠`
        ],
        'Other': [
            `Miscellaneous expense on ${dayOfWeek} 📌`,
            `Other necessary spending - ₹${amount} 📋`,
            `General expense managed on ${dayOfWeek} ✨`,
            `Diverse spending - ₹${amount} allocated 🔖`
        ]
    };
    
    const categoryCaption = captions[category] || captions['Other'];
    return categoryCaption[Math.floor(Math.random() * categoryCaption.length)];
}

// AI Monthly Summary Generator
function generateMonthlySummary(expenses) {
    if (expenses.length === 0) {
        return {
            title: "📊 Fresh Start!",
            summary: "No expenses recorded yet. Start tracking to get AI-powered insights!",
            insights: [],
            recommendations: ["Add your first expense to get started", "Track daily to build better habits"]
        };
    }
    
    const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const avgExpense = total / expenses.length;
    
    // Category analysis
    const categoryTotals = {};
    expenses.forEach(exp => {
        const cat = exp.category;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(exp.amount);
    });
    
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    const topCategoryPercent = ((topCategory[1] / total) * 100).toFixed(1);
    
    // Generate insights
    const insights = [];
    
    // Spending pattern
    if (avgExpense > 500) {
        insights.push("💰 Your average expense is ₹" + avgExpense.toFixed(2) + " - Consider budgeting for high-value items");
    } else {
        insights.push("✅ Great! You maintain moderate spending with avg ₹" + avgExpense.toFixed(2));
    }
    
    // Top category insight
    insights.push(`🏆 ${topCategory[0]} is your top category (${topCategoryPercent}% of total spending)`);
    
    // Frequency insight
    if (expenses.length > 20) {
        insights.push("📈 High transaction frequency detected - You're tracking consistently!");
    } else if (expenses.length > 10) {
        insights.push("📊 Good tracking habits - Keep logging expenses daily");
    }
    
    // Category diversity
    const uniqueCategories = Object.keys(categoryTotals).length;
    if (uniqueCategories >= 5) {
        insights.push(`🎯 Diverse spending across ${uniqueCategories} categories - Well-balanced!`);
    }
    
    // Generate recommendations
    const recommendations = [];
    
    if (topCategoryPercent > 40) {
        recommendations.push(`Consider reducing ${topCategory[0]} expenses - Currently ${topCategoryPercent}% of budget`);
    }
    
    if (avgExpense > 1000) {
        recommendations.push("Plan bulk purchases to reduce per-transaction costs");
    }
    
    if (!categoryTotals['Health'] || categoryTotals['Health'] < total * 0.05) {
        recommendations.push("💡 Allocate at least 5% budget for health & wellness");
    }
    
    if (expenses.length < 15) {
        recommendations.push("📝 Track all expenses daily for better insights");
    }
    
    recommendations.push("🎯 Set monthly limits per category for better control");
    recommendations.push("💾 Export data monthly for long-term analysis");
    
    // Generate title
    let title = "📊 Spending Analysis";
    if (total > 10000) {
        title = "💰 High Spending Alert!";
    } else if (total < 2000) {
        title = "✨ Excellent Budget Control!";
    }
    
    // Generate summary
    const summary = `This period you spent ₹${total.toFixed(2)} across ${expenses.length} transactions. ` +
                   `Your primary expense category is ${topCategory[0]} (₹${topCategory[1].toFixed(2)}). ` +
                   `Average transaction value is ₹${avgExpense.toFixed(2)}.`;
    
    return { title, summary, insights, recommendations };
}

// Smart Spending Alerts
function generateSpendingAlerts(expenses) {
    const alerts = [];
    const now = new Date();
    
    // Daily spending check
    const today = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.toDateString() === now.toDateString();
    });
    
    const todayTotal = today.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    
    if (todayTotal > 2000) {
        alerts.push({
            type: 'warning',
            message: `⚠️ High spending today: ₹${todayTotal.toFixed(2)} - Review your budget!`
        });
    } else if (todayTotal > 1000) {
        alerts.push({
            type: 'info',
            message: `📊 Today's spending: ₹${todayTotal.toFixed(2)} - Stay mindful!`
        });
    }
    
    // Category concentration
    const categoryTotals = {};
    expenses.forEach(exp => {
        const cat = exp.category;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(exp.amount);
    });
    
    const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    Object.entries(categoryTotals).forEach(([cat, amount]) => {
        const percent = (amount / total) * 100;
        if (percent > 50) {
            alerts.push({
                type: 'warning',
                message: `⚠️ ${cat} expenses are ${percent.toFixed(1)}% of total - Consider diversifying!`
            });
        }
    });
    
    // Positive reinforcement
    if (expenses.length >= 10 && todayTotal < 500) {
        alerts.push({
            type: 'success',
            message: '✅ Great job! Controlled spending today - Keep it up! 🎉'
        });
    }
    
    return alerts;
}

// Predict future spending
function predictNextMonthSpending(expenses) {
    if (expenses.length < 5) {
        return "Need more data for prediction. Add more expenses!";
    }
    
    const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const avgPerTransaction = total / expenses.length;
    const daysTracked = getDaysTracked(expenses);
    const avgTransactionsPerDay = expenses.length / daysTracked;
    
    const predictedMonthlyTransactions = avgTransactionsPerDay * 30;
    const predictedMonthlySpending = predictedMonthlyTransactions * avgPerTransaction;
    
    return `Based on current patterns, predicted monthly spending: ₹${predictedMonthlySpending.toFixed(2)} (approx ${Math.round(predictedMonthlyTransactions)} transactions)`;
}

function getDaysTracked(expenses) {
    if (expenses.length === 0) return 1;
    
    const dates = expenses.map(exp => new Date(exp.date).toDateString());
    const uniqueDates = [...new Set(dates)];
    return uniqueDates.length;
}

// Savings suggestions
function generateSavingsSuggestions(expenses) {
    const suggestions = [];
    
    const categoryTotals = {};
    expenses.forEach(exp => {
        const cat = exp.category;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(exp.amount);
    });
    
    // Food savings
    if (categoryTotals['Food'] > 5000) {
        suggestions.push({
            category: 'Food',
            tip: '🍽️ Try meal planning to reduce food expenses by 20-30%',
            potentialSaving: (categoryTotals['Food'] * 0.25).toFixed(2)
        });
    }
    
    // Transport savings
    if (categoryTotals['Transport'] > 3000) {
        suggestions.push({
            category: 'Transport',
            tip: '🚗 Consider carpooling or public transport to save ₹500-1000/month',
            potentialSaving: '800'
        });
    }
    
    // Entertainment
    if (categoryTotals['Entertainment'] > 2000) {
        suggestions.push({
            category: 'Entertainment',
            tip: '🎬 Look for free/discounted entertainment options',
            potentialSaving: (categoryTotals['Entertainment'] * 0.30).toFixed(2)
        });
    }
    
    // Shopping
    if (categoryTotals['Shopping'] > 5000) {
        suggestions.push({
            category: 'Shopping',
            tip: '🛍️ Wait 24 hours before non-essential purchases',
            potentialSaving: (categoryTotals['Shopping'] * 0.20).toFixed(2)
        });
    }
    
    return suggestions;
}

// Export functions
window.AIInsights = {
    generateSmartCaption,
    generateMonthlySummary,
    generateSpendingAlerts,
    predictNextMonthSpending,
    generateSavingsSuggestions
};
