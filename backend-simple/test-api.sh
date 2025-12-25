#!/bin/bash

# Test Script for Expense Tracker Backend API
# Usage: ./test-api.sh

echo "🧪 Testing Expense Tracker API..."
echo "=================================="

API_URL="http://localhost:3000"
TOKEN=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "\n${YELLOW}Test 1: Health Check${NC}"
curl -s ${API_URL}/health | jq .
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
    exit 1
fi

# Test 2: Register User
echo -e "\n${YELLOW}Test 2: Register New User${NC}"
REGISTER_RESPONSE=$(curl -s -X POST ${API_URL}/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser'$(date +%s)'",
    "password": "test123",
    "name": "Test User",
    "email": "test@example.com"
  }')

echo $REGISTER_RESPONSE | jq .

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    echo "Token: $TOKEN"
else
    echo -e "${RED}✗ Registration failed${NC}"
    exit 1
fi

# Test 3: Create Expense
echo -e "\n${YELLOW}Test 3: Create Expense${NC}"
CREATE_RESPONSE=$(curl -s -X POST ${API_URL}/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 500,
    "category": "Food",
    "description": "Test lunch expense",
    "date": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"
  }')

echo $CREATE_RESPONSE | jq .

EXPENSE_ID=$(echo $CREATE_RESPONSE | jq -r '.expense.id')

if [ "$EXPENSE_ID" != "null" ] && [ -n "$EXPENSE_ID" ]; then
    echo -e "${GREEN}✓ Expense created successfully${NC}"
    echo "Expense ID: $EXPENSE_ID"
else
    echo -e "${RED}✗ Failed to create expense${NC}"
    exit 1
fi

# Test 4: Get All Expenses
echo -e "\n${YELLOW}Test 4: Get All Expenses${NC}"
curl -s -X GET ${API_URL}/api/expenses \
  -H "Authorization: Bearer $TOKEN" | jq .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Retrieved expenses successfully${NC}"
else
    echo -e "${RED}✗ Failed to get expenses${NC}"
    exit 1
fi

# Test 5: Update Expense
echo -e "\n${YELLOW}Test 5: Update Expense${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT ${API_URL}/api/expenses/${EXPENSE_ID} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 750,
    "description": "Updated test expense"
  }')

echo $UPDATE_RESPONSE | jq .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Expense updated successfully${NC}"
else
    echo -e "${RED}✗ Failed to update expense${NC}"
    exit 1
fi

# Test 6: Delete Expense
echo -e "\n${YELLOW}Test 6: Delete Expense${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE ${API_URL}/api/expenses/${EXPENSE_ID} \
  -H "Authorization: Bearer $TOKEN")

echo $DELETE_RESPONSE | jq .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Expense deleted successfully${NC}"
else
    echo -e "${RED}✗ Failed to delete expense${NC}"
    exit 1
fi

# Test 7: Login with created user
echo -e "\n${YELLOW}Test 7: Login${NC}"
USERNAME=$(echo $REGISTER_RESPONSE | jq -r '.user.username')
LOGIN_RESPONSE=$(curl -s -X POST ${API_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"password\": \"test123\"
  }")

echo $LOGIN_RESPONSE | jq .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Login successful${NC}"
else
    echo -e "${RED}✗ Login failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}=================================="
echo "✅ All tests passed successfully!"
echo -e "==================================${NC}"
