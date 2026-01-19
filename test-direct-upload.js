// Direct test of file upload to Azure Blob Storage
require('dotenv').config({ path: './backend-simple/.env' });
const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

async function testUpload() {
    try {
        console.log('🔵 Testing Azure Blob Upload...\n');
        
        const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
        const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'bills';
        
        if (!connStr) {
            console.error('❌ AZURE_STORAGE_CONNECTION_STRING not found!');
            process.exit(1);
        }
        
        console.log('Container:', containerName);
        
        // Connect to blob storage
        const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        
        // Check if container exists
        const exists = await containerClient.exists();
        console.log('Container exists:', exists ? '✅' : '❌');
        
        if (!exists) {
            console.log('Creating container...');
            await containerClient.create({ access: 'blob' });
            console.log('✅ Container created');
        }
        
        // Create a test file
        const testContent = 'Test file upload at ' + new Date().toISOString();
        const blobName = `test-${uuidv4()}.txt`;
        
        console.log('\n🔵 Uploading test file:', blobName);
        
        // Upload
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(testContent, testContent.length, {
            blobHTTPHeaders: { blobContentType: 'text/plain' }
        });
        
        console.log('✅ File uploaded successfully!');
        console.log('📦 URL:', blockBlobClient.url);
        
        // List blobs to verify
        console.log('\n📋 Files in container:');
        let count = 0;
        for await (const blob of containerClient.listBlobsFlat()) {
            count++;
            console.log(`  ${count}. ${blob.name}`);
        }
        
        console.log('\n✅ Test completed successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.statusCode) console.error('Status Code:', error.statusCode);
        process.exit(1);
    }
}

testUpload();
