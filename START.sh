#!/bin/bash

# Expense Tracker - Complete Startup Script
# This starts both backend and frontend servers

echo "🚀 Starting Expense Tracker with Azure Cosmos DB"
echo "================================================"
echo ""

# Kill any existing processes on ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:8080 | xargs kill -9 2>/dev/null
sleep 2

# Start Backend
echo "🔵 Starting Backend (Azure Cosmos DB)..."
cd "backend-simple"
node server-azure.js &
BACKEND_PID=$!
cd ..
sleep 5

# Test backend
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend started successfully on http://localhost:3000"
else
    echo "❌ Backend failed to start!"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start Frontend  
echo "🔵 Starting Frontend..."
cd "frontend/public"
python3 -m http.server 8080 &
FRONTEND_PID=$!
cd ../..
sleep 3

echo ""
echo "=================================="
echo "✅ Expense Tracker is now running!"
echo "=================================="
echo ""
echo "📱 Frontend: http://localhost:8080"
echo "🔌 Backend API: http://localhost:3000"
echo "☁️  Database: Azure Cosmos DB (Cloud)"
echo ""
echo "📝 Backend PID: $BACKEND_PID"
echo "📝 Frontend PID: $FRONTEND_PID"
echo ""
echo "🛑 To stop: ./STOP.sh"
echo "   Or manually: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🌐 Open browser: http://localhost:8080"
echo ""

# Save PIDs for stop script
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

# Keep script running
wait
