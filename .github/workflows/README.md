# 🤖 GitHub Actions Workflows

यह folder में तीन automated workflows हैं जो आपके app को automatically deploy करते हैं।

## 📁 Files

### 1. `azure-deploy.yml` - Backend Deployment
**Kab chalti hai**: जब भी आप main branch में code push करें

**क्या करती है**:
- ✅ Docker image build करती है
- ✅ Azure Container Registry में push करती है  
- ✅ Azure Web App में deploy करती है
- ✅ Environment variables set करती है

**Time**: ~5-7 minutes

---

### 2. `frontend-deploy.yml` - Frontend Deployment  
**Kab chalti hai**: जब frontend folder में changes हों

**क्या करती है**:
- ✅ Frontend को build करती है
- ✅ Azure Static Web Apps में deploy करती है

**Time**: ~2-3 minutes

---

### 3. `ci-tests.yml` - Quality Checks
**Kab chalti hai**: हर push या pull request पर

**क्या करती है**:
- ✅ Backend code test करती है
- ✅ Security vulnerabilities check करती है
- ✅ Docker build test करती है
- ✅ Code quality verify करती है

**Time**: ~3-4 minutes

---

## 🚀 Setup करने के लिए

Complete setup guide के लिए देखें: [SETUP_GUIDE.md](./SETUP_GUIDE.md)

### Quick Steps:

1. **GitHub Secrets add करें**:
   - `AZURE_CREDENTIALS`
   - `ACR_USERNAME` & `ACR_PASSWORD`
   - `COSMOS_DB_ENDPOINT` & `COSMOS_DB_KEY`
   - `AZURE_STORAGE_CONNECTION_STRING`
   - `JWT_SECRET`
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`

2. **Workflow files में अपना Azure resource names update करें**

3. **Code push करें और magic देखें** ✨

---

## 📊 Monitoring

Deployment status देखने के लिए:
- GitHub repository → **Actions** tab
- वहां सभी workflow runs दिखेंगे
- Green ✅ = Success
- Red ❌ = Failed (logs check करें)

---

## 🔧 Manual Trigger

Workflows को manually भी चला सकते हैं:
1. GitHub → Actions tab
2. Workflow select करें
3. "Run workflow" button पर click करें

---

**Happy Deploying! 🚀**
