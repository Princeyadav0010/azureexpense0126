#!/bin/bash

# Simple Expense Tracker - Quick Start Script

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  💰 Simple Expense Tracker - Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Node.js
echo "✓ Node.js check kar rahe hain..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js install nahi hai!"
    echo "   Download karein: https://nodejs.org"
    exit 1
fi
echo "✓ Node.js version: $(node --version)"
echo ""

# Start backend
echo "🚀 Backend server start ho raha hai..."
cd backend-simple
node server.js &
BACKEND_PID=$!
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Server chal raha hai!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Frontend kholen:"
echo "   File: frontend/public/index.html"
echo "   Browser mein right-click karke 'Open with Browser'"
echo ""
echo "🌐 Backend URL: http://localhost:3000"
echo "💻 Frontend: index.html file kholen"
echo ""
echo "⏹️  Band karne ke liye: Ctrl+C dabayein"
echo ""

# Wait for Ctrl+C
wait $BACKEND_PID
