#!/bin/bash
# Quick Azure Deployment Script
# Run this after ensuring Cosmos DB is set up

set -e  # Exit on error

echo "🚀 Azure Expense Tracker Deployment Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI not installed${NC}"
    echo "Install: brew install azure-cli"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not installed${NC}"
    echo "Install: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Login check
echo "🔐 Checking Azure login..."
if ! az account show &> /dev/null; then
    echo "Please login to Azure..."
    az login
fi

SUBSCRIPTION=$(az account show --query name -o tsv)
echo -e "${GREEN}✅ Logged in: $SUBSCRIPTION${NC}"
echo ""

# Configuration
echo "📝 Configuration:"
echo "----------------"
RESOURCE_GROUP="expense-tracker-rg"
ACR_NAME="expensetracker$(date +%s)"
LOCATION="centralindia"
APP_SERVICE_PLAN="expense-backend-plan"
WEB_APP_NAME="expense-backend-$(date +%s)"

echo "Resource Group: $RESOURCE_GROUP"
echo "Registry: $ACR_NAME"
echo "Location: $LOCATION"
echo "App Service: $WEB_APP_NAME"
echo ""

read -p "Continue with deployment? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

# Step 1: Create Resource Group
echo ""
echo "📦 Step 1: Creating Resource Group..."
if az group show --name $RESOURCE_GROUP &> /dev/null; then
    echo -e "${YELLOW}⚠️  Resource group already exists${NC}"
else
    az group create --name $RESOURCE_GROUP --location $LOCATION -o none
    echo -e "${GREEN}✅ Resource Group created${NC}"
fi

# Step 2: Create Container Registry
echo ""
echo "📦 Step 2: Creating Container Registry..."
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --location $LOCATION \
  --admin-enabled true \
  -o none

echo -e "${GREEN}✅ Container Registry created${NC}"

# Step 3: Build Docker Image
echo ""
echo "🐳 Step 3: Building Docker Image..."
cd "$(dirname "$0")/backend-simple"
docker build -t expense-backend:latest . -q

echo -e "${GREEN}✅ Docker image built${NC}"

# Step 4: Push to ACR
echo ""
echo "📤 Step 4: Pushing to Container Registry..."
az acr login --name $ACR_NAME -o none
docker tag expense-backend:latest $ACR_NAME.azurecr.io/expense-backend:latest
docker push $ACR_NAME.azurecr.io/expense-backend:latest -q

echo -e "${GREEN}✅ Image pushed to ACR${NC}"

# Step 5: Create App Service Plan
echo ""
echo "📦 Step 5: Creating App Service Plan..."
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --is-linux \
  --sku B1 \
  -o none

echo -e "${GREEN}✅ App Service Plan created${NC}"

# Step 6: Create Web App
echo ""
echo "🌐 Step 6: Creating Web App..."
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $WEB_APP_NAME \
  --deployment-container-image-name $ACR_NAME.azurecr.io/expense-backend:latest \
  -o none

echo -e "${GREEN}✅ Web App created${NC}"

# Step 7: Configure ACR credentials
echo ""
echo "🔐 Step 7: Configuring Container Registry..."
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)

az webapp config container set \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --docker-registry-server-url https://$ACR_NAME.azurecr.io \
  --docker-registry-server-user $ACR_USERNAME \
  --docker-registry-server-password $ACR_PASSWORD \
  -o none

echo -e "${GREEN}✅ ACR configured${NC}"

# Step 8: Load environment variables from .env
echo ""
echo "⚙️  Step 8: Setting Environment Variables..."

# Read .env file
source .env

az webapp config appsettings set \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    COSMOS_DB_ENDPOINT="$COSMOS_DB_ENDPOINT" \
    COSMOS_DB_KEY="$COSMOS_DB_KEY" \
    COSMOS_DB_DATABASE_NAME="$COSMOS_DB_DATABASE_NAME" \
    COSMOS_DB_USERS_CONTAINER="$COSMOS_DB_USERS_CONTAINER" \
    COSMOS_DB_EXPENSES_CONTAINER="$COSMOS_DB_EXPENSES_CONTAINER" \
    PORT="3000" \
    NODE_ENV="production" \
    JWT_SECRET="production-secret-$(date +%s)" \
    WEBSITES_PORT="3000" \
  -o none

echo -e "${GREEN}✅ Environment variables set${NC}"

# Step 9: Enable CORS
echo ""
echo "🔓 Step 9: Enabling CORS..."
az webapp cors add \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --allowed-origins '*' \
  -o none

echo -e "${GREEN}✅ CORS enabled${NC}"

# Step 10: Restart App
echo ""
echo "♻️  Step 10: Restarting App..."
az webapp restart \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  -o none

echo -e "${GREEN}✅ App restarted${NC}"

# Get URLs
echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="
echo ""

APP_URL=$(az webapp show \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query defaultHostName -o tsv)

echo -e "${GREEN}✅ Backend URL: https://$APP_URL${NC}"
echo ""

# Test health endpoint
echo "🧪 Testing backend..."
sleep 30  # Wait for app to start

if curl -s https://$APP_URL/health | grep -q "OK"; then
    echo -e "${GREEN}✅ Backend is healthy!${NC}"
else
    echo -e "${YELLOW}⚠️  Backend may still be starting. Check logs:${NC}"
    echo "   az webapp log tail --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Update frontend API config: api-config.js"
echo "   BASE_URL: 'https://$APP_URL'"
echo ""
echo "2. Deploy frontend to Azure Static Web Apps or Storage"
echo ""
echo "3. Test your app:"
echo "   curl https://$APP_URL/health"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
