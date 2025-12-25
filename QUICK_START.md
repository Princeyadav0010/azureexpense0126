# ⚡ Quick Start - Azure Setup (15 Minutes)

Sabse fast way to get started with Azure!

---

## 1️⃣ Azure Cosmos DB (3 mins)

```bash
# Portal me search karo: "Cosmos DB"
# Click: Create → NoSQL
# Name: expense-tracker-db
# Mode: Serverless (Free tier)
# Location: Central India
# Create!

# Keys copy karo:
# URI aur Primary Key
```

---

## 2️⃣ Backend Setup (2 mins)

```bash
cd backend-simple

# .env file update karo:
COSMOS_DB_ENDPOINT=your-uri-here
COSMOS_DB_KEY=your-key-here
COSMOS_DB_DATABASE_NAME=ExpenseTrackerDB
COSMOS_DB_USERS_CONTAINER=Users
COSMOS_DB_EXPENSES_CONTAINER=Expenses
JWT_SECRET=any-random-string

# Test locally:
node server-azure.js
```

---

## 3️⃣ Docker Build (2 mins)

```bash
# Build image:
docker build -t expense-backend .

# Test:
docker run -p 3000:3000 --env-file .env expense-backend
```

---

## 4️⃣ Azure Container Registry (3 mins)

```bash
# Portal: Create "Container Registry"
# Name: expensetrackeracr
# SKU: Basic

# Push image:
az acr login --name expensetrackeracr
docker tag expense-backend expensetrackeracr.azurecr.io/expense-backend
docker push expensetrackeracr.azurecr.io/expense-backend
```

---

## 5️⃣ Azure App Service (3 mins)

```bash
# Portal: Create "Web App"
# Name: expense-backend-app
# Publish: Container
# Image: expensetrackeracr.azurecr.io/expense-backend

# Configuration → Add environment variables:
# (Same as .env file + WEBSITES_PORT=3000)

# Save & restart!
```

---

## 6️⃣ Frontend Deploy (2 mins)

```bash
# Portal: Create "Storage Account"
# Name: expensetrackerstorage
# Enable: Static website

# Upload frontend/public files to $web container

# Update config.js:
const API_BASE_URL = 'https://expense-backend-app.azurewebsites.net';
```

---

## ✅ Done! Test Your App

```bash
# Frontend URL:
https://expensetrackerstorage.z13.web.core.windows.net

# Backend API:
https://expense-backend-app.azurewebsites.net/health
```

---

## 🎯 Total Time: ~15 minutes
## 💰 Total Cost: ₹0 (Free tier use karke!)

---

Need detailed steps? Check [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md)
