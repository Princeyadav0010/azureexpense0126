#!/bin/bash

echo "🧪 Testing Expense Tracker API..."
echo ""

# Register a test user
echo "1️⃣ Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"apitest'$(date +%s)'","password":"test123","name":"API Test User"}')

echo "$REGISTER_RESPONSE" | jq .

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Registration failed, trying login with existing user..."
    
    # Try login
    echo ""
    echo "2️⃣ Testing Login..."
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"username":"prince","password":"123"}')
    
    echo "$LOGIN_RESPONSE" | jq .
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
fi

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Could not get auth token!"
    exit 1
fi

echo ""
echo "✅ Got token: ${TOKEN:0:20}..."

# Create an expense
echo ""
echo "3️⃣ Testing Create Expense..."
EXPENSE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 500,
    "category": "Food",
    "description": "Test expense from API",
    "date": "'$(date +%Y-%m-%d)'"
  }')

echo "$EXPENSE_RESPONSE" | jq .

if echo "$EXPENSE_RESPONSE" | jq -e '.expense' > /dev/null 2>&1; then
    echo ""
    echo "✅ Expense created successfully!"
else
    echo ""
    echo "❌ Failed to create expense!"
    echo "Response: $EXPENSE_RESPONSE"
fi

# Get all expenses
echo ""
echo "4️⃣ Testing Get Expenses..."
GET_RESPONSE=$(curl -s -X GET http://localhost:3000/api/expenses \
  -H "Authorization: Bearer $TOKEN")

echo "$GET_RESPONSE" | jq '.expenses | length' | xargs -I {} echo "Total expenses: {}"

echo ""
echo "✅ Test complete!"
