#!/bin/bash

# Stop Expense Tracker Servers

echo "🛑 Stopping Expense Tracker..."

# Read PIDs
BACKEND_PID=$(cat .backend.pid 2>/dev/null)
FRONTEND_PID=$(cat .frontend.pid 2>/dev/null)

# Stop backend
if [ ! -z "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null && echo "✅ Backend stopped (PID: $BACKEND_PID)"
fi

# Stop frontend
if [ ! -z "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null && echo "✅ Frontend stopped (PID: $FRONTEND_PID)"
fi

# Cleanup ports
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:8080 | xargs kill -9 2>/dev/null

# Remove PID files
rm -f .backend.pid .frontend.pid

echo "✅ All servers stopped!"
