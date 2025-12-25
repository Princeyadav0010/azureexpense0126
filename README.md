# Cloud-Based Expense Tracker

🚀 A full-stack, production-ready expense tracking application powered by Azure cloud services.

## 📋 Features

### Core Functionality
- ✅ Upload and manage expense bills (images & PDFs)
- ✅ Add/Edit/Delete expenses with amount, category, date, description
- ✅ View complete expense history with sorting
- ✅ Real-time expense summary and analytics
- ✅ Category-wise expense breakdown with charts

### Technology Stack

**Frontend:**
- React 18 with modern hooks
- Responsive design with CSS Grid
- Chart.js for expense visualization
- Axios for API communication

**Backend:**
- Node.js with Express.js
- RESTful API architecture
- Comprehensive error handling & logging
- Middleware for security (CORS, Helmet, Morgan)

**Cloud Infrastructure:**
- **Azure Blob Storage** - Bill/receipt storage with metadata
- **Azure Cosmos DB** - Scalable NoSQL database for expense records
- **Docker** - Containerized deployment
- **NGINX** - Reverse proxy & static file serving
- **GitHub Actions** - CI/CD automation

## 🏗️ Project Structure

```
├── backend/
│   ├── src/
│   │   ├── server.js              # Express server setup
│   │   ├── routes/
│   │   │   ├── expenses.js        # Expense CRUD endpoints
│   │   │   └── upload.js          # File upload endpoints
│   │   ├── middleware/
│   │   │   └── errorHandler.js    # Error handling
│   │   └── utils/
│   │       ├── logger.js          # Logging utility
│   │       ├── azureStorage.js    # Blob Storage integration
│   │       └── cosmosdb.js        # Cosmos DB integration
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ExpenseForm.js     # Add expense form
│   │   │   ├── ExpenseList.js     # Expenses table
│   │   │   └── Summary.js         # Analytics dashboard
│   │   ├── utils/
│   │   │   └── formatters.js      # Data formatting
│   │   ├── App.js                 # Main app component
│   │   └── index.js               # React entry point
│   └── package.json
│
├── docker/
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
│
├── nginx/
│   └── nginx.conf                 # Reverse proxy config
│
├── .github/workflows/
│   └── ci-cd.yml                  # GitHub Actions pipeline
│
└── docker-compose.yml             # Local development setup
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Azure account with:
  - Storage Account (Blob Storage)
  - Cosmos DB account (SQL API)

### Local Development

1. **Clone and setup:**
```bash
git clone <repository>
cd expense-tracker
```

2. **Configure environment:**
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your Azure credentials

# Frontend
cd ../frontend
echo "REACT_APP_API_BASE=http://localhost:3000/api" > .env.local
```

3. **Run with Docker Compose:**
```bash
docker-compose up
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api
- Health Check: http://localhost:3000/health

4. **Or run separately:**

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm start
```

## 🔧 API Endpoints

### Expenses
- `GET /api/expenses` - List all expenses for user
- `GET /api/expenses/:id` - Get specific expense
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/summary/by-category` - Get spending summary

### File Upload
- `POST /api/upload/bill` - Upload bill/receipt
- `GET /api/upload/list/all` - List uploaded files
- `DELETE /api/upload/:fileName` - Delete file

### Health
- `GET /health` - Service health check

## 🗄️ Database Schema

### Expenses Collection (Cosmos DB)
```json
{
  "id": "uuid",
  "userId": "user-identifier",
  "amount": 50.00,
  "category": "Food",
  "date": "2024-12-19",
  "description": "Lunch",
  "billUrl": "https://storage.azure.com/...",
  "createdAt": "2024-12-19T10:00:00Z",
  "updatedAt": "2024-12-19T10:00:00Z"
}
```

## 🔒 Security Features

- ✅ CORS protection with whitelist
- ✅ Helmet.js for HTTP headers security
- ✅ Input validation and sanitization
- ✅ User isolation (x-user-id header)
- ✅ Azure managed authentication
- ✅ HTTPS/TLS support
- ✅ Environment variables for secrets
- ✅ Request logging & monitoring

## 📊 Performance Optimizations

- Request body size limit: 50MB
- File upload limit: 10MB
- NGINX gzip compression
- Static asset caching (1 year expiry)
- Database query optimization
- Connection pooling (Cosmos DB)
- Health checks for load balancing

## 📈 Monitoring & Logging

Structured logging with levels:
- `error` - Errors and exceptions
- `warn` - Warning conditions
- `info` - Informational messages
- `debug` - Detailed debugging info

Configure via `LOG_LEVEL` environment variable.

## 🚀 Deployment

### Azure Container Instances
```bash
az container create \
  --resource-group mygroup \
  --name expense-tracker \
  --image myregistry.azurecr.io/expense-tracker:latest \
  --environment-variables \
    AZURE_STORAGE_CONNECTION_STRING="..." \
    AZURE_COSMOS_ENDPOINT="..." \
    AZURE_COSMOS_KEY="..."
```

### Azure App Service
```bash
az appservice plan create --name myplan --resource-group mygroup --sku B1 --is-linux
az webapp create --name myapp --plan myplan --resource-group mygroup --runtime "node|18-lts"
```

### GitHub Actions CI/CD
Automated pipeline runs on:
- Every push to `main` and `develop`
- Pull requests to `main`
- Builds Docker images
- Runs tests & linting
- Deploys to Azure

## 🧪 Testing

Backend:
```bash
cd backend
npm test
```

Frontend:
```bash
cd frontend
npm test
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=3000
NODE_ENV=production
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=...
AZURE_STORAGE_CONTAINER_NAME=expense-bills
AZURE_COSMOS_ENDPOINT=https://account.documents.azure.com:443/
AZURE_COSMOS_KEY=your-primary-key
AZURE_COSMOS_DATABASE=expensedb
AZURE_COSMOS_CONTAINER=expenses
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

### Frontend (.env.local)
```env
REACT_APP_API_BASE=https://api.yourdomain.com
```

## 🛠️ Troubleshooting

**Backend won't start:**
```bash
# Check Node version
node --version  # Should be 18+

# Check Azure credentials
echo $AZURE_STORAGE_CONNECTION_STRING

# Check logs
npm run dev  # Watch logs in development
```

**Cosmos DB connection issues:**
```bash
# Test connection
node -e "const { CosmosClient } = require('@azure/cosmos'); 
  new CosmosClient({endpoint: process.env.AZURE_COSMOS_ENDPOINT, key: process.env.AZURE_COSMOS_KEY})
  .databases.readAll().fetchAll().then(() => console.log('✓ Connected'))"
```

**Frontend API calls failing:**
```bash
# Check CORS origin
curl -H "Origin: http://localhost:3000" http://localhost:3000/health

# Verify API base URL
console.log(process.env.REACT_APP_API_BASE)
```

## 📚 Best Practices Implemented

✅ **Code Organization** - Clear separation of concerns
✅ **Error Handling** - Comprehensive try-catch with logging
✅ **Security** - Encryption, validation, authentication
✅ **Performance** - Caching, compression, optimization
✅ **Scalability** - Stateless design, containerized
✅ **Maintainability** - Well-documented, consistent style
✅ **Testing** - Unit tests, integration tests
✅ **DevOps** - CI/CD automation, health checks

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For issues, questions, or suggestions:
- Create an issue on GitHub
- Check documentation in `/docs`
- Review API documentation

---

**Made with ❤️ using Azure Cloud Services**
