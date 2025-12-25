// Azure Cosmos DB Configuration and Helper Functions
require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');

// Cosmos DB Client Setup
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseName = process.env.COSMOS_DB_DATABASE_NAME;
const usersContainerName = process.env.COSMOS_DB_USERS_CONTAINER;
const expensesContainerName = process.env.COSMOS_DB_EXPENSES_CONTAINER;

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseName);
const usersContainer = database.container(usersContainerName);
const expensesContainer = database.container(expensesContainerName);

// Initialize Database and Containers
async function initializeDatabase() {
    try {
        console.log('🔄 Initializing Azure Cosmos DB...');
        
        // Create database if not exists
        const { database: db } = await client.databases.createIfNotExists({
            id: databaseName
        });
        console.log(`✅ Database: ${databaseName}`);
        
        // Create Users container with partition key
        await db.containers.createIfNotExists({
            id: usersContainerName,
            partitionKey: { paths: ['/username'] }
        });
        console.log(`✅ Container: ${usersContainerName}`);
        
        // Create Expenses container with partition key
        await db.containers.createIfNotExists({
            id: expensesContainerName,
            partitionKey: { paths: ['/userId'] }
        });
        console.log(`✅ Container: ${expensesContainerName}`);
        
        console.log('✅ Cosmos DB initialization complete!');
    } catch (error) {
        console.error('❌ Error initializing Cosmos DB:', error.message);
        throw error;
    }
}

// User Operations
const UserDB = {
    // Create new user
    async create(userData) {
        const { username, password, name, email } = userData;
        const user = {
            id: username, // Using username as id for uniqueness
            username,
            password, // In production, hash this!
            name,
            email: email || '',
            createdAt: new Date().toISOString()
        };
        
        const { resource } = await usersContainer.items.create(user);
        return resource;
    },
    
    // Find user by username
    async findByUsername(username) {
        const querySpec = {
            query: 'SELECT * FROM Users u WHERE u.username = @username',
            parameters: [{ name: '@username', value: username }]
        };
        
        const { resources } = await usersContainer.items.query(querySpec).fetchAll();
        return resources[0] || null;
    },
    
    // Find user by id
    async findById(userId) {
        try {
            const { resource } = await usersContainer.item(userId, userId).read();
            return resource;
        } catch (error) {
            if (error.code === 404) return null;
            throw error;
        }
    }
};

// Expense Operations
const ExpenseDB = {
    // Create new expense
    async create(expenseData) {
        const { resource } = await expensesContainer.items.create(expenseData);
        return resource;
    },
    
    // Get all expenses for a user
    async getAllByUser(userId) {
        const querySpec = {
            query: 'SELECT * FROM Expenses e WHERE e.userId = @userId ORDER BY e.date DESC',
            parameters: [{ name: '@userId', value: userId }]
        };
        
        const { resources } = await expensesContainer.items.query(querySpec).fetchAll();
        return resources;
    },
    
    // Get expense by id
    async findById(expenseId, userId) {
        try {
            const { resource } = await expensesContainer.item(expenseId, userId).read();
            return resource;
        } catch (error) {
            if (error.code === 404) return null;
            throw error;
        }
    },
    
    // Update expense
    async update(expenseId, userId, updateData) {
        const existing = await this.findById(expenseId, userId);
        if (!existing) return null;
        
        const updated = { ...existing, ...updateData };
        const { resource } = await expensesContainer.item(expenseId, userId).replace(updated);
        return resource;
    },
    
    // Delete expense
    async delete(expenseId, userId) {
        try {
            await expensesContainer.item(expenseId, userId).delete();
            return true;
        } catch (error) {
            if (error.code === 404) return false;
            throw error;
        }
    },
    
    // Get expenses by category
    async getByCategory(userId, category) {
        const querySpec = {
            query: 'SELECT * FROM Expenses e WHERE e.userId = @userId AND e.category = @category ORDER BY e.date DESC',
            parameters: [
                { name: '@userId', value: userId },
                { name: '@category', value: category }
            ]
        };
        
        const { resources } = await expensesContainer.items.query(querySpec).fetchAll();
        return resources;
    },
    
    // Get expenses by date range
    async getByDateRange(userId, startDate, endDate) {
        const querySpec = {
            query: 'SELECT * FROM Expenses e WHERE e.userId = @userId AND e.date >= @startDate AND e.date <= @endDate ORDER BY e.date DESC',
            parameters: [
                { name: '@userId', value: userId },
                { name: '@startDate', value: startDate },
                { name: '@endDate', value: endDate }
            ]
        };
        
        const { resources } = await expensesContainer.items.query(querySpec).fetchAll();
        return resources;
    }
};

module.exports = {
    initializeDatabase,
    UserDB,
    ExpenseDB,
    usersContainer,
    expensesContainer
};
