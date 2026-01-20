# 🎯 CI/CD Quick Reference

## 📁 Files Created

```
.github/
├── workflows/
│   ├── azure-deploy.yml       → Backend deployment
│   ├── frontend-deploy.yml    → Frontend deployment
│   ├── ci-tests.yml           → Quality checks
│   └── README.md              → Workflows info
└── SETUP_GUIDE.md             → Complete setup guide

azure-pipelines.yml            → Azure DevOps alternative
setup-cicd.sh                  → Automated setup helper
CICD_SETUP.md                  → This file
.gitignore                     → Git ignore rules
```

---

## ⚡ Quick Setup (5 minutes)

### 1. Run Setup Script
```bash
./setup-cicd.sh
```
यह script automatically सभी credentials निकाल देगा।

### 2. GitHub Secrets Add करें
GitHub → Settings → Secrets → New secret:

| Name | From |
|------|------|
| `AZURE_CREDENTIALS` | Setup script output |
| `ACR_USERNAME` | Setup script output |
| `ACR_PASSWORD` | Setup script output |
| `COSMOS_DB_ENDPOINT` | Setup script output |
| `COSMOS_DB_KEY` | Setup script output |
| `JWT_SECRET` | Setup script output |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Portal → Storage Account |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Azure Portal → Static Web App |

### 3. Update Workflow Files
Edit `.github/workflows/azure-deploy.yml`:
```yaml
env:
  AZURE_WEBAPP_NAME: your-actual-app-name    # Change
  ACR_NAME: your-acr-name                    # Change
```

### 4. Push & Deploy
```bash
git add .
git commit -m "Setup CI/CD"
git push origin main
```

---

## 🔄 Workflow Triggers

| Workflow | Trigger | Time |
|----------|---------|------|
| **Backend Deploy** | Push to main | ~6 min |
| **Frontend Deploy** | Push to main (frontend changes) | ~3 min |
| **CI Tests** | Every push/PR | ~4 min |

---

## 🛠️ Manual Commands

### Get Azure Credentials
```bash
az ad sp create-for-rbac \
  --name "expense-tracker-github" \
  --role contributor \
  --scopes /subscriptions/{sub-id}/resourceGroups/{rg-name} \
  --sdk-auth
```

### Get ACR Credentials
```bash
az acr credential show --name your-acr-name
```

### Get Cosmos DB Keys
```bash
az cosmosdb keys list \
  --name your-cosmos-name \
  --resource-group your-rg
```

### Generate JWT Secret
```bash
openssl rand -base64 32
```

---

## 📊 Monitor Deployments

### GitHub Actions
```
GitHub → Actions Tab
- Green ✅ = Success
- Red ❌ = Failed (click for logs)
- Yellow 🟡 = Running
```

### Azure Portal
```
App Service → Deployment Center → Logs
App Service → Log Stream (real-time)
```

### Test Deployment
```bash
# Health check
curl https://your-app.azurewebsites.net/health

# Test API
curl https://your-app.azurewebsites.net/api/expenses \
  -H "x-user-id: test-user"
```

---

## 🐛 Troubleshooting

### ❌ "Authentication failed"
```bash
# Re-create service principal
az ad sp create-for-rbac --name "expense-tracker-new" --role contributor
# Update AZURE_CREDENTIALS secret
```

### ❌ "Image not found"
```bash
# Check ACR
az acr repository list --name your-acr

# Verify credentials
az acr credential show --name your-acr
```

### ❌ "Cannot connect to Cosmos DB"
```bash
# Check firewall
az cosmosdb show --name your-cosmos --resource-group your-rg

# Verify keys
az cosmosdb keys list --name your-cosmos --resource-group your-rg
```

### ❌ "Deployment timeout"
```bash
# Check App Service logs
az webapp log tail --name your-app --resource-group your-rg
```

---

## 📚 Full Documentation

- **Setup Guide**: [.github/SETUP_GUIDE.md](.github/SETUP_GUIDE.md)
- **Workflows Info**: [.github/workflows/README.md](.github/workflows/README.md)
- **Azure Guide**: [AZURE_DEPLOYMENT_GUIDE.md](AZURE_DEPLOYMENT_GUIDE.md)

---

## ✅ Checklist

Before pushing:
- [ ] All GitHub secrets added
- [ ] Workflow files updated with app names
- [ ] `.env` files in `.gitignore`
- [ ] Local build successful
- [ ] Docker image builds
- [ ] Azure resources exist

After first deploy:
- [ ] Health check passes
- [ ] API responds
- [ ] Frontend loads
- [ ] Database connection works
- [ ] File upload works

---

## 💡 Tips

✨ **Test locally first**: `docker build` before pushing
✨ **Check logs**: GitHub Actions logs are detailed
✨ **Incremental deploys**: Push small changes
✨ **Use staging**: Create staging slot in Azure
✨ **Monitor costs**: Check Azure Cost Management

---

## 🚀 What Happens on Push

```mermaid
Push to GitHub
    ↓
GitHub Actions Triggered
    ↓
1. Run Tests (ci-tests.yml)
    ↓
2. Build Docker Image
    ↓
3. Push to ACR
    ↓
4. Deploy to Azure
    ↓
5. Configure Settings
    ↓
6. Health Check
    ↓
✅ Live!
```

---

**Need Help?** Check [SETUP_GUIDE.md](.github/SETUP_GUIDE.md) or Azure Portal logs.
