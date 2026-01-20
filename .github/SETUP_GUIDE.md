# 🚀 GitHub Actions CI/CD Setup Guide

यह guide आपको बताएगा कि कैसे GitHub Actions से Azure में automatic deployment करें।

## 📋 Prerequisites

1. ✅ Azure Account
2. ✅ GitHub Repository
3. ✅ Azure Web App created
4. ✅ Azure Container Registry created
5. ✅ Azure Cosmos DB setup

---

## 🔐 Step 1: Azure Service Principal बनाएं

यह deployment के लिए authentication credentials है।

```bash
# Azure CLI में login करें
az login

# Service Principal बनाएं
az ad sp create-for-rbac \
  --name "expense-tracker-github" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group} \
  --sdk-auth

# Output copy करें - यह आपका AZURE_CREDENTIALS होगा
```

---

## 🔑 Step 2: GitHub Secrets Setup करें

अपने GitHub repo में जाकर **Settings** → **Secrets and variables** → **Actions** में ये secrets add करें:

### Backend Deployment Secrets:

```
AZURE_CREDENTIALS
{
  "clientId": "xxxx",
  "clientSecret": "xxxx",
  "subscriptionId": "xxxx",
  "tenantId": "xxxx"
}

ACR_USERNAME
Your Azure Container Registry username

ACR_PASSWORD
Your Azure Container Registry password

COSMOS_DB_ENDPOINT
https://your-account.documents.azure.com:443/

COSMOS_DB_KEY
Your Cosmos DB primary key

AZURE_STORAGE_CONNECTION_STRING
DefaultEndpointsProtocol=https;AccountName=...

JWT_SECRET
your-super-secret-jwt-key-for-production
```

### Frontend Deployment Secret:

```
AZURE_STATIC_WEB_APPS_API_TOKEN
Your Static Web Apps deployment token
```

---

## 🛠️ Step 3: Azure Resources की जानकारी update करें

### Backend Workflow File में:

File: `.github/workflows/azure-deploy.yml`

```yaml
env:
  AZURE_WEBAPP_NAME: your-app-name        # Change this
  ACR_NAME: your-acr-name                 # Change this
```

---

## 🎯 Step 4: Test करें

### Automatic Deployment:

```bash
# Code commit और push करें
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main

# GitHub में जाकर Actions tab में deployment देखें
```

### Manual Deployment:

GitHub Actions tab में जाकर workflow को manually भी trigger कर सकते हैं।

---

## 📊 Workflows की जानकारी

### 1. `azure-deploy.yml` - Backend Deployment
- **Trigger**: Push to main/master branch
- **Steps**: 
  - Docker image build करता है
  - Azure Container Registry में push करता है
  - Azure Web App में deploy करता है
  - Environment variables configure करता है

### 2. `frontend-deploy.yml` - Frontend Deployment
- **Trigger**: Push to main/master with frontend changes
- **Steps**:
  - Frontend को Azure Static Web Apps में deploy करता है

### 3. `ci-tests.yml` - Quality Checks
- **Trigger**: Every push or pull request
- **Steps**:
  - Backend tests चलाता है
  - Security scan करता है
  - Docker build test करता है

---

## 🔍 Troubleshooting

### Deployment fail हो रही है?

1. **Secrets check करें**: सभी secrets सही से configured हैं?
2. **Logs देखें**: GitHub Actions → Failed workflow → Logs
3. **Azure Portal**: App Service logs check करें
4. **Permissions**: Service Principal को proper permissions हैं?

### Common Issues:

#### Error: "Authentication failed"
```bash
# Service Principal फिर से बनाएं और AZURE_CREDENTIALS update करें
az ad sp create-for-rbac --name "expense-tracker-github-new" --role contributor
```

#### Error: "Image not found"
```bash
# ACR credentials check करें
az acr credential show --name your-acr-name
```

#### Error: "Cosmos DB connection failed"
```bash
# Cosmos DB endpoint और key verify करें
# Azure Portal → Cosmos DB → Keys
```

---

## ✅ Verification Steps

Deployment successful हुई है check करने के लिए:

```bash
# 1. Backend health check
curl https://your-app-name.azurewebsites.net/health

# 2. Test API
curl https://your-app-name.azurewebsites.net/api/expenses \
  -H "x-user-id: test-user"

# 3. Frontend check
# Browser में अपना Static Web App URL खोलें
```

---

## 🎉 Next Steps

1. ✅ Monitoring setup करें (Azure Application Insights)
2. ✅ Custom domain add करें
3. ✅ SSL certificate configure करें
4. ✅ Staging environment बनाएं

---

## 📚 Additional Resources

- [Azure Web Apps Documentation](https://docs.microsoft.com/azure/app-service/)
- [GitHub Actions for Azure](https://github.com/Azure/actions)
- [Azure Container Registry](https://docs.microsoft.com/azure/container-registry/)

---

## 💡 Tips

- हमेशा `.env` file को `.gitignore` में रखें
- Production secrets को कभी भी commit न करें
- Regular security scans चलाते रहें
- Deployment logs monitor करें

---

**Need help?** Check GitHub Actions logs या Azure Portal में diagnostics देखें।
