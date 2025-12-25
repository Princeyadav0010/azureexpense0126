# 🚀 Azure Deployment Guide - Expense Tracker

Complete step-by-step guide to deploy your Expense Tracker application on Azure.

---

## 📋 Prerequisites

- Azure Account ([Free tier bhi chalega](https://azure.microsoft.com/free))
- Docker installed locally
- GitHub account
- Node.js installed (v18+)

---

## STEP 1: Azure Cosmos DB Setup

### 1.1 Create Cosmos DB Account

```bash
# Azure Portal se:
1. Search "Azure Cosmos DB"
2. Click "Create"
3. Select "Azure Cosmos DB for NoSQL"
4. Fill details:
   - Subscription: Your subscription
   - Resource Group: expense-tracker-rg (create new)
   - Account Name: expense-tracker-db (unique name)
   - Location: Central India (ya nearest)
   - Capacity mode: Serverless (cost effective for dev)
5. Click "Review + Create"
```

### 1.2 Get Connection Details

```bash
# Cosmos DB account ke "Keys" section se:
1. URI: https://your-account.documents.azure.com:443/
2. Primary Key: Copy karke safe rakho
```

### 1.3 Create Database & Containers

```bash
# Data Explorer se:
1. Click "New Database"
   - Database id: ExpenseTrackerDB
   
2. Create "Users" Container
   - Container id: Users
   - Partition key: /username
   
3. Create "Expenses" Container
   - Container id: Expenses
   - Partition key: /userId
```

---

## STEP 2: Update Backend .env File

```bash
# backend-simple/.env file me ye values add karo:

COSMOS_DB_ENDPOINT=https://your-account.documents.azure.com:443/
COSMOS_DB_KEY=your-primary-key-here
COSMOS_DB_DATABASE_NAME=ExpenseTrackerDB
COSMOS_DB_USERS_CONTAINER=Users
COSMOS_DB_EXPENSES_CONTAINER=Expenses

PORT=3000
NODE_ENV=production
JWT_SECRET=your-super-secret-key-change-this
```

---

## STEP 3: Test Backend Locally with Azure

```bash
# Terminal se:
cd backend-simple
node server-azure.js

# Test endpoints:
# Register user:
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","name":"Test User"}'

# Login:
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# Create expense (token from login response use karo):
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"amount":500,"category":"Food","description":"Lunch"}'
```

---

## STEP 4: Docker Build & Test

```bash
# Backend Docker image build karo:
cd backend-simple
docker build -t expense-backend .

# Local test:
docker run -p 3000:3000 \
  -e COSMOS_DB_ENDPOINT="your-endpoint" \
  -e COSMOS_DB_KEY="your-key" \
  -e COSMOS_DB_DATABASE_NAME="ExpenseTrackerDB" \
  -e COSMOS_DB_USERS_CONTAINER="Users" \
  -e COSMOS_DB_EXPENSES_CONTAINER="Expenses" \
  -e JWT_SECRET="your-secret" \
  expense-backend

# Browser me check karo: http://localhost:3000/health
```

---

## STEP 5: Azure Container Registry (ACR)

### 5.1 Create ACR

```bash
# Azure Portal se:
1. Search "Container Registry"
2. Click "Create"
3. Fill details:
   - Registry name: expensetrackeracr (unique)
   - Resource group: expense-tracker-rg
   - Location: Central India
   - SKU: Basic
4. Click "Review + Create"
```

### 5.2 Push Image to ACR

```bash
# Login to ACR:
az login
az acr login --name expensetrackeracr

# Tag image:
docker tag expense-backend expensetrackeracr.azurecr.io/expense-backend:latest

# Push to ACR:
docker push expensetrackeracr.azurecr.io/expense-backend:latest
```

---

## STEP 6: Azure App Service (Backend Deployment)

### 6.1 Create App Service

```bash
# Azure Portal se:
1. Search "App Services"
2. Click "Create" → "Web App"
3. Fill details:
   - Name: expense-backend-app (unique)
   - Publish: Container
   - Operating System: Linux
   - Region: Central India
   - Pricing plan: Basic B1 (ya Free F1 for testing)
4. Click "Next: Container"
5. Select:
   - Image Source: Azure Container Registry
   - Registry: expensetrackeracr
   - Image: expense-backend
   - Tag: latest
6. Click "Review + Create"
```

### 6.2 Configure Environment Variables

```bash
# App Service → Configuration → Application settings:

Add these:
- COSMOS_DB_ENDPOINT: https://your-account.documents.azure.com:443/
- COSMOS_DB_KEY: your-primary-key
- COSMOS_DB_DATABASE_NAME: ExpenseTrackerDB
- COSMOS_DB_USERS_CONTAINER: Users
- COSMOS_DB_EXPENSES_CONTAINER: Expenses
- PORT: 3000
- NODE_ENV: production
- JWT_SECRET: your-production-secret
- WEBSITES_PORT: 3000 (Important for Azure!)

Click "Save"
```

### 6.3 Test Backend

```bash
# App Service ka URL: https://expense-backend-app.azurewebsites.net

# Test:
curl https://expense-backend-app.azurewebsites.net/health
```

---

## STEP 7: Frontend Configuration

### 7.1 Create API Config File

```javascript
// frontend/public/config.js
const API_BASE_URL = 'https://expense-backend-app.azurewebsites.net';
```

### 7.2 Update Frontend Code

```javascript
// Replace localStorage with API calls
// Example in login-script.js:

async function login(username, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard.html';
    }
}
```

---

## STEP 8: Deploy Frontend (Azure Static Web Apps)

### 8.1 Create Static Web App

```bash
# Azure Portal se:
1. Search "Static Web Apps"
2. Click "Create"
3. Fill details:
   - Name: expense-frontend
   - Region: Central India
   - Source: Other (manual deployment)
4. Click "Review + Create"
```

### 8.2 Deploy Frontend

```bash
# Install Azure Static Web Apps CLI:
npm install -g @azure/static-web-apps-cli

# Frontend folder se deploy:
cd frontend
swa deploy --deployment-token YOUR_DEPLOYMENT_TOKEN
```

### Option B: Simple - Use Azure Storage Static Website

```bash
# 1. Create Storage Account:
#    - Name: expensetrackerstorage
#    - Performance: Standard
#    - Replication: LRS

# 2. Enable Static Website:
#    - Storage Account → Static website → Enabled
#    - Index document: index.html
#    - Error document: index.html

# 3. Upload files:
#    - Upload all files from frontend/public to $web container

# 4. Get URL:
#    - Primary endpoint: https://expensetrackerstorage.z13.web.core.windows.net
```

---

## STEP 9: GitHub Actions CI/CD

### 9.1 Create GitHub Secrets

```bash
# GitHub Repository → Settings → Secrets and variables → Actions

Add these secrets:
- AZURE_CONTAINER_REGISTRY: expensetrackeracr.azurecr.io
- AZURE_REGISTRY_USERNAME: (from ACR → Access keys)
- AZURE_REGISTRY_PASSWORD: (from ACR → Access keys)
- AZURE_WEBAPP_NAME: expense-backend-app
```

### 9.2 Create Workflow File

```yaml
# .github/workflows/backend-deploy.yml
name: Deploy Backend to Azure

on:
  push:
    branches: [ main ]
    paths:
      - 'backend-simple/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Login to Azure Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ secrets.AZURE_CONTAINER_REGISTRY }}
        username: ${{ secrets.AZURE_REGISTRY_USERNAME }}
        password: ${{ secrets.AZURE_REGISTRY_PASSWORD }}
    
    - name: Build and push Docker image
      working-directory: ./backend-simple
      run: |
        docker build -t ${{ secrets.AZURE_CONTAINER_REGISTRY }}/expense-backend:${{ github.sha }} .
        docker push ${{ secrets.AZURE_CONTAINER_REGISTRY }}/expense-backend:${{ github.sha }}
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
        images: ${{ secrets.AZURE_CONTAINER_REGISTRY }}/expense-backend:${{ github.sha }}
```

---

## STEP 10: Testing Complete Flow

```bash
# 1. Register user:
Frontend: https://expensetrackerstorage.z13.web.core.windows.net
Click "Register" → Fill details → Submit

# 2. Login:
Enter credentials → Dashboard dikhega

# 3. Add expense:
Dashboard → Add Expense → Fill form → Save

# 4. Verify in Azure:
Cosmos DB → Data Explorer → Expenses container → Check new item

# 5. Check logs:
App Service → Log stream → Real-time logs dekho
```

---

## 🔒 Security Checklist

- [ ] .env file GitHub par push nahi karo
- [ ] Cosmos DB firewall enable karo (only App Service IP allow)
- [ ] CORS properly configure karo (only your domain)
- [ ] Strong JWT secret use karo
- [ ] HTTPS enable karo (Azure automatically karta hai)
- [ ] ACR admin access disable karo (use managed identity)

---

## 💰 Cost Estimation (Monthly)

```
Azure Cosmos DB (Serverless): ₹0 - ₹500 (usage based)
App Service (Basic B1): ₹1,300
Storage Account (Static Website): ₹50
Container Registry (Basic): ₹400
---
Total: ~₹2,250/month

Free tier use karke: Almost ₹0 for development!
```

---

## 🆘 Common Issues & Solutions

### Issue 1: CORS Error
```javascript
// Backend me CORS properly set karo:
res.setHeader('Access-Control-Allow-Origin', 'your-frontend-url');
```

### Issue 2: 500 Error on Azure
```bash
# App Service logs check karo:
az webapp log tail --name expense-backend-app --resource-group expense-tracker-rg
```

### Issue 3: Container not starting
```bash
# Environment variables check karo:
az webapp config appsettings list --name expense-backend-app --resource-group expense-tracker-rg
```

---

## 📚 Next Steps (Optional)

1. **Azure Application Insights** - Monitoring & logging
2. **Azure Key Vault** - Secure secrets management
3. **Azure Blob Storage** - Bill/receipt uploads
4. **Azure Functions** - OCR for bill scanning
5. **Azure CDN** - Frontend ko fast serve karo
6. **Custom Domain** - Professional URL

---

## 🎉 Congratulations!

Aapka Expense Tracker ab Azure par live hai! 🚀

**Support:** Koi issue ho to Azure Portal se Support ticket create kar sakte ho.

---

**Made with ❤️ for learning Azure Cloud Services**
