# 🚀 DEPLOY NOW - आपका प्रोजेक्ट Azure पर लगाएं

## ✅ चेक करें - क्या तैयार है

- ✅ Cosmos DB created और credentials `.env` में है
- ✅ Backend code ready (`server-azure.js`)
- ✅ Docker file ready
- ✅ Dependencies installed (`package.json`)

---

## 📋 Step 1: Azure Portal पर Cosmos DB Verify करें (5 minutes)

```bash
1. Azure Portal खोलें: https://portal.azure.com
2. Search करें: "expense-cosmos-db" (आपका DB name)
3. Data Explorer में जाएं
4. Check करें ये containers exist करते हैं या नहीं:
   ✅ Database: ExpenseDB
   ✅ Container: Users (partition key: /username)
   ✅ Container: Expenses (partition key: /userId)

अगर नहीं हैं तो बनाएं:
   - Click "New Container"
   - Database id: ExpenseDB
   - Container id: Users
   - Partition key: /username
   
   फिर दूसरा:
   - Container id: Expenses
   - Partition key: /userId
```

---

## 📋 Step 2: Local Test - Backend चला कर देखें (5 minutes)

Terminal में ये commands run करें:

```bash
# Backend folder में जाएं
cd "/Users/prince.kumar/Desktop/ AZ project 221225/backend-simple"

# Dependencies install करें (if not done)
npm install

# Server start करें
node server-azure.js
```

**Expected Output:**
```
🔄 Initializing Azure Cosmos DB...
✅ Database: ExpenseDB
✅ Container: Users
✅ Container: Expenses
✅ Cosmos DB initialization complete!
🚀 Server running on port 3000
```

**अगर error आए:**
- Check `.env` file में सही credentials हैं
- Check internet connection
- Check Cosmos DB firewall settings (allow all IPs for now)

---

## 📋 Step 3: API Test करें (5 minutes)

**नई terminal खोलें** और test करें:

```bash
# Health check
curl http://localhost:3000/health

# Register a test user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

**Expected:** आपको login response में `token` मिलेगा। Copy करें!

```bash
# Token से expense create करें (TOKEN_HERE को replace करें)
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d '{"amount":500,"category":"Food","description":"Test Expense","date":"2025-12-21"}'

# Expenses देखें
curl -H "Authorization: Bearer TOKEN_HERE" \
  http://localhost:3000/api/expenses
```

**अगर सब काम करे, तो आगे बढ़ें! 🎉**

---

## 📋 Step 4: Azure Container Registry (ACR) Setup (10 minutes)

### 4.1 Azure CLI Install & Login

```bash
# Azure CLI install (if not installed)
# macOS:
brew install azure-cli

# Login
az login
```

Browser खुलेगा, login करें।

### 4.2 Container Registry बनाएं

```bash
# Variables set करें
RESOURCE_GROUP="expense-tracker-rg"
ACR_NAME="expensetracker$(date +%s)"  # Unique name
LOCATION="centralindia"

# Resource Group बनाएं (if not exists)
az group create --name $RESOURCE_GROUP --location $LOCATION

# Container Registry बनाएं
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --location $LOCATION

# Admin enable करें
az acr update --name $ACR_NAME --admin-enabled true

# ACR credentials लें
az acr credential show --name $ACR_NAME
```

**ACR Username और Password note करें!**

---

## 📋 Step 5: Docker Image Build & Push (10 minutes)

```bash
# Backend folder में जाएं
cd "/Users/prince.kumar/Desktop/ AZ project 221225/backend-simple"

# Docker image build करें
docker build -t expense-backend:latest .

# ACR में login करें
az acr login --name $ACR_NAME

# Image tag करें (ACR_NAME replace करें)
docker tag expense-backend:latest $ACR_NAME.azurecr.io/expense-backend:latest

# Push करें
docker push $ACR_NAME.azurecr.io/expense-backend:latest
```

**Verify:** Azure Portal → Container Registry → Repositories में `expense-backend` दिखना चाहिए।

---

## 📋 Step 6: Azure App Service Deploy (15 minutes)

### 6.1 App Service Plan & Web App बनाएं

```bash
# Variables
APP_SERVICE_PLAN="expense-backend-plan"
WEB_APP_NAME="expense-backend-$(date +%s)"  # Unique name

# App Service Plan बनाएं
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --is-linux \
  --sku B1

# Web App बनाएं with ACR
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $WEB_APP_NAME \
  --deployment-container-image-name $ACR_NAME.azurecr.io/expense-backend:latest

# ACR credentials configure करें
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)

az webapp config container set \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --docker-registry-server-url https://$ACR_NAME.azurecr.io \
  --docker-registry-server-user $ACR_USERNAME \
  --docker-registry-server-password $ACR_PASSWORD
```

### 6.2 Environment Variables Configure करें

```bash
# .env file से values लें और App Service में set करें
az webapp config appsettings set \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    COSMOS_DB_ENDPOINT="YOUR_COSMOS_DB_ENDPOINT" \
    COSMOS_DB_KEY="YOUR_COSMOS_DB_KEY" \
    COSMOS_DB_DATABASE_NAME="ExpenseDB" \
    COSMOS_DB_USERS_CONTAINER="Users" \
    COSMOS_DB_EXPENSES_CONTAINER="Expenses" \
    PORT="3000" \
    NODE_ENV="production" \
    JWT_SECRET="production-secret-key-change-this-12345" \
    WEBSITES_PORT="3000"

# CORS enable करें
az webapp cors add \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --allowed-origins '*'
```

### 6.3 App Restart करें

```bash
az webapp restart \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP
```

---

## 📋 Step 7: Backend URL लें और Test करें (5 minutes)

```bash
# App URL लें
APP_URL=$(az webapp show \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query defaultHostName -o tsv)

echo "🎉 Your Backend URL: https://$APP_URL"

# Health check
curl https://$APP_URL/health

# Test register
curl -X POST https://$APP_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"azureuser","password":"test123","name":"Azure User"}'
```

**Expected:** `{"message":"User created successfully","token":"..."}`

---

## 📋 Step 8: Frontend Update करें (5 minutes)

Frontend में Backend URL update करें:

```bash
# Frontend API config खोलें
code "/Users/prince.kumar/Desktop/ AZ project 221225/frontend/public/api-config.js"
```

Line 8 में change करें:
```javascript
BASE_URL: 'https://YOUR-APP-NAME.azurewebsites.net'  // YOUR-APP-NAME replace करें
```

---

## 📋 Step 9: Frontend Deploy (Static Web App) (10 minutes)

### Option A: Azure Static Web Apps (Recommended)

```bash
# Static Web App बनाएं
STATIC_APP_NAME="expense-frontend-$(date +%s)"

az staticwebapp create \
  --name $STATIC_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --source "/Users/prince.kumar/Desktop/ AZ project 221225/frontend/public" \
  --app-location "/" \
  --output-location "." \
  --sku Free
```

### Option B: Azure Storage Static Website (Free)

```bash
# Storage account बनाएं
STORAGE_ACCOUNT="expenseweb$(date +%s | cut -c 5-13)"

az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS

# Static website enable करें
az storage blob service-properties update \
  --account-name $STORAGE_ACCOUNT \
  --static-website \
  --index-document index.html \
  --404-document index.html

# Files upload करें
az storage blob upload-batch \
  --account-name $STORAGE_ACCOUNT \
  --destination '$web' \
  --source "/Users/prince.kumar/Desktop/ AZ project 221225/frontend/public"

# Frontend URL लें
FRONTEND_URL=$(az storage account show \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --query "primaryEndpoints.web" -o tsv)

echo "🎉 Your Frontend URL: $FRONTEND_URL"
```

---

## 📋 Step 10: Final Testing (5 minutes)

```bash
# Frontend खोलें browser में
open $FRONTEND_URL

# Test करें:
1. ✅ Register new user
2. ✅ Login
3. ✅ Add expense
4. ✅ View expenses
5. ✅ Delete expense
```

---

## 🎉 DEPLOYMENT COMPLETE!

### Your URLs:
```bash
# Print all URLs
echo "Backend: https://$APP_URL"
echo "Frontend: $FRONTEND_URL"
echo "Cosmos DB: Azure Portal → expense-cosmos-db"
```

---

## 🔥 Quick Commands Summary

```bash
# Complete deployment in one go (copy-paste sab ek sath)
cd "/Users/prince.kumar/Desktop/ AZ project 221225/backend-simple"

# Variables
RESOURCE_GROUP="expense-tracker-rg"
ACR_NAME="expensetracker$(date +%s)"
LOCATION="centralindia"
APP_SERVICE_PLAN="expense-backend-plan"
WEB_APP_NAME="expense-backend-$(date +%s)"
STORAGE_ACCOUNT="expenseweb$(date +%s | cut -c 5-13)"

# 1. Login
az login

# 2. Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION

# 3. Container Registry
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --location $LOCATION
az acr update --name $ACR_NAME --admin-enabled true

# 4. Build & Push
docker build -t expense-backend:latest .
az acr login --name $ACR_NAME
docker tag expense-backend:latest $ACR_NAME.azurecr.io/expense-backend:latest
docker push $ACR_NAME.azurecr.io/expense-backend:latest

# 5. App Service
az appservice plan create --name $APP_SERVICE_PLAN --resource-group $RESOURCE_GROUP --location $LOCATION --is-linux --sku B1
az webapp create --resource-group $RESOURCE_GROUP --plan $APP_SERVICE_PLAN --name $WEB_APP_NAME --deployment-container-image-name $ACR_NAME.azurecr.io/expense-backend:latest

# 6. Configure
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)
az webapp config container set --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --docker-registry-server-url https://$ACR_NAME.azurecr.io --docker-registry-server-user $ACR_USERNAME --docker-registry-server-password $ACR_PASSWORD

# 7. Environment Variables
az webapp config appsettings set --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --settings COSMOS_DB_ENDPOINT="YOUR_COSMOS_DB_ENDPOINT" COSMOS_DB_KEY="YOUR_COSMOS_DB_KEY" COSMOS_DB_DATABASE_NAME="ExpenseDB" COSMOS_DB_USERS_CONTAINER="Users" COSMOS_DB_EXPENSES_CONTAINER="Expenses" PORT="3000" NODE_ENV="production" JWT_SECRET="prod-secret-$(date +%s)" WEBSITES_PORT="3000"

# 8. CORS
az webapp cors add --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --allowed-origins '*'

# 9. Restart
az webapp restart --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP

# 10. Get URLs
APP_URL=$(az webapp show --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --query defaultHostName -o tsv)
echo "🎉 Backend URL: https://$APP_URL"

# 11. Test
curl https://$APP_URL/health
```

---

## ❓ Common Issues & Solutions

### Issue 1: "Database not found"
```bash
# Cosmos DB में manually containers बनाएं Azure Portal से
```

### Issue 2: "Container failed to start"
```bash
# Logs देखें
az webapp log tail --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP
```

### Issue 3: "CORS error in frontend"
```bash
# CORS फिर से enable करें
az webapp cors add --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --allowed-origins '*'
```

### Issue 4: "Unauthorized"
```bash
# JWT_SECRET check करें App Service settings में
az webapp config appsettings list --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP
```

---

## 📞 Need Help?

1. Azure Portal Logs: App Service → Log Stream
2. Container Logs: `az webapp log tail`
3. Cosmos DB: Data Explorer में data check करें

---

**Happy Deploying! 🚀**
