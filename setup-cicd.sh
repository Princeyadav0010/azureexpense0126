#!/bin/bash
# Quick Setup Script for CI/CD

echo "🚀 CI/CD Setup Helper"
echo "===================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not installed"
    echo "   Install: brew install azure-cli (macOS)"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git not installed"
    exit 1
fi

echo "✅ Prerequisites OK"
echo ""

# Login to Azure
echo "🔐 Azure Login..."
az login

# Get subscription info
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)

echo ""
echo "📊 Current Subscription:"
echo "   Name: $SUBSCRIPTION_NAME"
echo "   ID: $SUBSCRIPTION_ID"
echo ""

# Get resource group
echo "📦 Resource Groups:"
az group list --query "[].{Name:name, Location:location}" -o table
echo ""

read -p "Enter Resource Group name: " RESOURCE_GROUP

# Verify resource group exists
if ! az group show --name $RESOURCE_GROUP &> /dev/null; then
    echo "❌ Resource group not found!"
    exit 1
fi

echo ""
echo "🔑 Creating Service Principal for GitHub Actions..."
echo ""

# Create service principal
CREDENTIALS=$(az ad sp create-for-rbac \
  --name "expense-tracker-github-$(date +%s)" \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP \
  --sdk-auth)

echo ""
echo "✅ Service Principal Created!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 GITHUB SECRET: AZURE_CREDENTIALS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$CREDENTIALS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Copy the above JSON and add it as a GitHub secret named: AZURE_CREDENTIALS"
echo ""

# Get ACR credentials
echo "🐳 Getting Container Registry credentials..."
echo ""
read -p "Enter ACR name (without .azurecr.io): " ACR_NAME

if az acr show --name $ACR_NAME &> /dev/null; then
    ACR_CREDS=$(az acr credential show --name $ACR_NAME)
    ACR_USERNAME=$(echo $ACR_CREDS | jq -r .username)
    ACR_PASSWORD=$(echo $ACR_CREDS | jq -r .passwords[0].value)
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 CONTAINER REGISTRY SECRETS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "ACR_USERNAME: $ACR_USERNAME"
    echo "ACR_PASSWORD: $ACR_PASSWORD"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
else
    echo "⚠️  ACR not found or no access"
fi

# Get Cosmos DB credentials
echo "🗄️  Getting Cosmos DB credentials..."
echo ""
read -p "Enter Cosmos DB account name: " COSMOS_NAME

if az cosmosdb show --name $COSMOS_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    COSMOS_ENDPOINT=$(az cosmosdb show --name $COSMOS_NAME --resource-group $RESOURCE_GROUP --query documentEndpoint -o tsv)
    COSMOS_KEY=$(az cosmosdb keys list --name $COSMOS_NAME --resource-group $RESOURCE_GROUP --query primaryMasterKey -o tsv)
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 COSMOS DB SECRETS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "COSMOS_DB_ENDPOINT: $COSMOS_ENDPOINT"
    echo "COSMOS_DB_KEY: $COSMOS_KEY"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
else
    echo "⚠️  Cosmos DB not found or no access"
fi

# Generate JWT Secret
JWT_SECRET=$(openssl rand -base64 32)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 JWT SECRET (Generated)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "JWT_SECRET: $JWT_SECRET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Copy all the secrets above"
echo "2. Go to GitHub: Settings → Secrets and variables → Actions"
echo "3. Add each secret with the exact name shown"
echo "4. Update .github/workflows/azure-deploy.yml with your app names"
echo "5. Push code to GitHub"
echo "6. Check GitHub Actions tab for deployment"
echo ""
echo "📚 Full guide: .github/SETUP_GUIDE.md"
echo ""
