# 💰 Expense Tracker - Azure Cloud Edition

Full-stack expense tracking application with Azure Cosmos DB backend and modern frontend.

---

## 🎯 Features

### ✅ Completed
- 🔐 User Authentication (Register/Login)
- 💾 Azure Cosmos DB Integration
- 📊 Expense CRUD Operations
- 🎨 Beautiful UI with Dark/Light Mode
- 📱 Fully Responsive Design
- 🐳 Docker Support
- ☁️ Azure Deployment Ready

### 🚀 Coming Soon
- 📁 Azure Blob Storage for receipts
- 📧 Email notifications
- 📈 Advanced analytics
- 🤖 AI-powered expense categorization

---

## 📁 Project Structure

```
AZ project 221225/
├── backend-simple/          # Node.js Backend
│   ├── server-azure.js      # Main server with Azure integration
│   ├── cosmosdb.js          # Cosmos DB helper functions
│   ├── auth.js              # Authentication helpers
│   ├── Dockerfile           # Docker configuration
│   ├── .env.example         # Environment variables template
│   └── package.json         # Dependencies
│
├── frontend/public/         # Frontend Files
│   ├── index.html           # Landing page
│   ├── login.html           # Login/Register page
│   ├── dashboard.html       # Dashboard
│   ├── add-expense.html     # Add expense form
│   ├── expenses.html        # Expense list
│   ├── reports.html         # Reports & analytics
│   ├── settings.html        # User settings
│   ├── api-config.js        # API configuration
│   ├── login-script-azure.js # Auth with API
│   └── *.js, *.css          # Other scripts and styles
│
├── AZURE_DEPLOYMENT_GUIDE.md # Detailed deployment guide
├── QUICK_START.md            # 15-minute setup guide
└── README.md                 # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ installed
- Azure account (free tier works!)
- Docker (optional, for deployment)

### 1. Backend Setup (Local Development)

```bash
cd backend-simple

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Azure Cosmos DB credentials
# (You'll get these after creating Cosmos DB account)

# Run backend
node server-azure.js
```

Server will start on `http://localhost:3000`

### 2. Frontend Setup

```bash
cd frontend/public

# Start simple HTTP server
python3 -m http.server 8080
# or
# npx http-server -p 8080
```

Frontend will be available at `http://localhost:8080`

### 3. Test Locally

1. Open `http://localhost:8080` in browser
2. Click "Login" button
3. Register a new account
4. Start tracking expenses!

---

## ☁️ Azure Deployment

### Option 1: Quick Deploy (15 minutes)

Follow [QUICK_START.md](./QUICK_START.md) for fastest deployment.

### Option 2: Complete Guide (30 minutes)

Follow [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md) for step-by-step instructions.

### Key Steps:
1. **Create Azure Cosmos DB** (Serverless mode - Free!)
2. **Configure Backend** (Update .env file)
3. **Build Docker Image**
4. **Push to Azure Container Registry**
5. **Deploy to Azure App Service**
6. **Deploy Frontend** (Static Web Apps or Storage)

---

## 🔧 Configuration

### Backend Environment Variables

```bash
# Azure Cosmos DB
COSMOS_DB_ENDPOINT=https://your-account.documents.azure.com:443/
COSMOS_DB_KEY=your-primary-key-here
COSMOS_DB_DATABASE_NAME=ExpenseTrackerDB
COSMOS_DB_USERS_CONTAINER=Users
COSMOS_DB_EXPENSES_CONTAINER=Expenses

# Server
PORT=3000
NODE_ENV=development

# Authentication
JWT_SECRET=your-super-secret-key
```

### Frontend Configuration

```javascript
// Update API_CONFIG.BASE_URL in api-config.js:
const API_CONFIG = {
    BASE_URL: 'https://your-backend-app.azurewebsites.net'
};
```

---

## 📡 API Endpoints

### Authentication
```bash
POST /api/auth/register  # Register new user
POST /api/auth/login     # Login user
```

### Expenses (Requires authentication)
```bash
GET    /api/expenses          # Get all expenses
POST   /api/expenses          # Create expense
GET    /api/expenses/:id      # Get single expense
PUT    /api/expenses/:id      # Update expense
DELETE /api/expenses/:id      # Delete expense
```

### Example Request

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"secret123","name":"John Doe"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"secret123"}'

# Create Expense (use token from login response)
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"amount":500,"category":"Food","description":"Lunch","date":"2025-12-21"}'
```

---

## 🐳 Docker

### Build Image
```bash
cd backend-simple
docker build -t expense-backend .
```

### Run Container
```bash
docker run -p 3000:3000 \
  -e COSMOS_DB_ENDPOINT="your-endpoint" \
  -e COSMOS_DB_KEY="your-key" \
  -e COSMOS_DB_DATABASE_NAME="ExpenseTrackerDB" \
  -e COSMOS_DB_USERS_CONTAINER="Users" \
  -e COSMOS_DB_EXPENSES_CONTAINER="Expenses" \
  -e JWT_SECRET="your-secret" \
  expense-backend
```

### Using Docker Compose
```bash
# Update .env file
docker-compose up -d
```

---

## 🧪 Testing

### Manual Testing
```bash
# 1. Start backend
cd backend-simple && node server-azure.js

# 2. Start frontend
cd frontend/public && python3 -m http.server 8080

# 3. Open browser
open http://localhost:8080
```

### API Testing with curl
See [API Endpoints](#-api-endpoints) section above.

---

## 💰 Cost Estimation

### Azure Services (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Cosmos DB | Serverless | ₹0 - ₹500 (usage-based) |
| App Service | Basic B1 | ₹1,300 |
| Container Registry | Basic | ₹400 |
| Storage Account | Standard | ₹50 |
| **Total** | | **~₹2,250/month** |

### Free Tier Option
- Use Azure Free account
- Cosmos DB: 1000 RU/s free for 30 days
- App Service: Free F1 tier (limited)
- Storage: First 5GB free
- **Total Cost: ~₹0 for 30 days!**

---

## 🔒 Security Best Practices

- ✅ Never commit `.env` file to Git
- ✅ Use strong JWT secrets in production
- ✅ Enable CORS only for your domain
- ✅ Use HTTPS in production (Azure provides this)
- ✅ Enable Cosmos DB firewall rules
- ✅ Use Azure Key Vault for secrets (optional)
- ✅ Implement rate limiting (future enhancement)
- ✅ Hash passwords (currently using SHA-256, upgrade to bcrypt)

---

## 🐛 Common Issues & Solutions

### Issue: CORS Error in Frontend

**Solution:**
```javascript
// Backend: Update CORS headers in server-azure.js
res.setHeader('Access-Control-Allow-Origin', 'your-frontend-url');
```

### Issue: 401 Unauthorized

**Solution:**
- Check if token is being sent in Authorization header
- Verify token format: `Bearer YOUR_TOKEN`
- Token might be expired (7 days validity)

### Issue: Cosmos DB Connection Failed

**Solution:**
- Verify endpoint and key in .env file
- Check if database and containers exist
- Ensure network access is allowed (Azure Portal → Firewall settings)

### Issue: Docker Container Won't Start

**Solution:**
```bash
# Check logs
docker logs container-id

# Verify environment variables
docker exec container-id env | grep COSMOS
```

---

## 📚 Learning Resources

### Azure Documentation
- [Azure Cosmos DB](https://docs.microsoft.com/azure/cosmos-db/)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/)
- [Azure Container Registry](https://docs.microsoft.com/azure/container-registry/)

### Tutorials
- [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [QUICK_START.md](./QUICK_START.md) - 15-minute setup

---

## 🎓 What You'll Learn

By deploying this project, you'll learn:

1. ✅ Azure Cosmos DB (NoSQL database)
2. ✅ Azure App Service (PaaS hosting)
3. ✅ Azure Container Registry (Docker images)
4. ✅ Docker containerization
5. ✅ RESTful API design
6. ✅ JWT authentication
7. ✅ CI/CD with GitHub Actions
8. ✅ Cloud architecture best practices

---

## 🚀 Future Enhancements

- [ ] Azure Blob Storage for receipt uploads
- [ ] OCR using Azure Cognitive Services
- [ ] Email notifications via SendGrid
- [ ] Budget alerts
- [ ] Export to Excel/PDF
- [ ] Mobile app (React Native)
- [ ] AI-powered expense categorization
- [ ] Multi-currency support
- [ ] Recurring expenses
- [ ] Shared expenses with friends

---

## 📝 License

MIT License - Feel free to use for learning!

---

## 👤 Author

Built with ❤️ for learning Azure Cloud Services

---

## 🙏 Acknowledgments

- Azure Documentation Team
- Node.js Community
- Docker Community

---

## 📞 Support

### Need Help?
1. Check [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md)
2. Review [Common Issues](#-common-issues--solutions)
3. Open an issue on GitHub
4. Contact Azure Support (if Azure-related)

---

## 🎉 Ready to Deploy?

Choose your path:

1. **Quick & Easy**: [QUICK_START.md](./QUICK_START.md) (15 mins)
2. **Detailed**: [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md) (30 mins)
3. **Test Locally First**: Follow [Quick Start](#-quick-start) above

---

**Happy Coding! 🚀☁️**
