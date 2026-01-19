// Create Azure Blob Storage Container
require('dotenv').config();
const { BlobServiceClient } = require('@azure/storage-blob');

async function createContainer() {
    try {
        console.log('🔵 Connecting to Azure Blob Storage...');
        
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'bills';
        
        if (!connectionString) {
            console.error('❌ AZURE_STORAGE_CONNECTION_STRING not found in .env');
            process.exit(1);
        }
        
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        
        console.log(`🔵 Creating container: ${containerName}...`);
        
        // Create container if it doesn't exist
        const createResponse = await containerClient.createIfNotExists({
            access: 'blob' // Public read access for blobs
        });
        
        if (createResponse.succeeded) {
            console.log(`✅ Container "${containerName}" created successfully!`);
        } else {
            console.log(`ℹ️  Container "${containerName}" already exists`);
        }
        
        console.log(`📦 Container URL: ${containerClient.url}`);
        console.log('\n✅ Setup complete! You can now upload bills.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.statusCode) {
            console.error('Status Code:', error.statusCode);
        }
        process.exit(1);
    }
}

createContainer();
