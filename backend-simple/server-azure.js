// Expense Tracker Backend with Azure Cosmos DB Integration
require('dotenv').config();

// Polyfill for Azure Cosmos SDK
const crypto = require('crypto');
if (typeof global.crypto === 'undefined') {
    global.crypto = crypto.webcrypto || crypto;
}

const http = require('http');
const url = require('url');
const { v4: uuidv4 } = require('uuid');
const { initializeDatabase, UserDB, ExpenseDB } = require('./cosmosdb');
const { hashPassword, comparePassword, generateToken, getUserFromRequest } = require('./auth');

const PORT = process.env.PORT || 3000;

// CORS headers
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// JSON response helper
function sendJSON(res, statusCode, data) {
    setCorsHeaders(res);
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

// Parse request body
function parseBody(req, callback) {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
        try {
            callback(null, body ? JSON.parse(body) : {});
        } catch (error) {
            callback(error);
        }
    });
}

// HTTP Server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // CORS preflight
    if (method === 'OPTIONS') {
        setCorsHeaders(res);
        res.writeHead(204);
        res.end();
        return;
    }

    try {
        // Root route - API info
        if (pathname === '/' && method === 'GET') {
            return sendJSON(res, 200, {
                name: 'Expense Tracker API',
                version: '1.0.0',
                status: 'running',
                endpoints: {
                    health: '/health',
                    auth: {
                        register: 'POST /api/auth/register',
                        login: 'POST /api/auth/login'
                    },
                    expenses: {
                        getAll: 'GET /api/expenses',
                        create: 'POST /api/expenses',
                        update: 'PUT /api/expenses/:id',
                        delete: 'DELETE /api/expenses/:id'
                    }
                }
            });
        }

        // Health check
        if (pathname === '/health' && method === 'GET') {
            return sendJSON(res, 200, { status: 'OK', message: 'Server is running' });
        }

        // ==================== AUTH ROUTES ====================
        
        // Register new user
        if (pathname === '/api/auth/register' && method === 'POST') {
            parseBody(req, async (err, body) => {
                if (err) return sendJSON(res, 400, { error: 'Invalid JSON' });
                
                const { username, password, name, email } = body;
                
                if (!username || !password || !name) {
                    return sendJSON(res, 400, { error: 'Username, password, and name are required' });
                }
                
                try {
                    // Check if user already exists
                    const existing = await UserDB.findByUsername(username);
                    if (existing) {
                        return sendJSON(res, 409, { error: 'Username already exists' });
                    }
                    
                    // Create new user
                    const hashedPassword = hashPassword(password);
                    const user = await UserDB.create({
                        username,
                        password: hashedPassword,
                        name,
                        email: email || ''
                    });
                    
                    // Generate token
                    const token = generateToken(user.id, user.username);
                    
                    sendJSON(res, 201, {
                        message: 'User created successfully',
                        token,
                        user: {
                            id: user.id,
                            username: user.username,
                            name: user.name,
                            email: user.email
                        }
                    });
                } catch (error) {
                    console.error('Register error:', error);
                    sendJSON(res, 500, { error: 'Failed to create user' });
                }
            });
            return;
        }
        
        // Login
        if (pathname === '/api/auth/login' && method === 'POST') {
            parseBody(req, async (err, body) => {
                if (err) return sendJSON(res, 400, { error: 'Invalid JSON' });
                
                const { username, password } = body;
                
                if (!username || !password) {
                    return sendJSON(res, 400, { error: 'Username and password are required' });
                }
                
                try {
                    // Find user
                    const user = await UserDB.findByUsername(username);
                    if (!user) {
                        return sendJSON(res, 401, { error: 'Invalid credentials' });
                    }
                    
                    // Verify password
                    if (!comparePassword(password, user.password)) {
                        return sendJSON(res, 401, { error: 'Invalid credentials' });
                    }
                    
                    // Generate token
                    const token = generateToken(user.id, user.username);
                    
                    sendJSON(res, 200, {
                        message: 'Login successful',
                        token,
                        user: {
                            id: user.id,
                            username: user.username,
                            name: user.name,
                            email: user.email
                        }
                    });
                } catch (error) {
                    console.error('Login error:', error);
                    sendJSON(res, 500, { error: 'Login failed' });
                }
            });
            return;
        }
        
        // ==================== EXPENSE ROUTES (Protected) ====================
        
        // Middleware: Extract user from token
        const userPayload = getUserFromRequest(req);
        if (!userPayload && pathname.startsWith('/api/expenses')) {
            return sendJSON(res, 401, { error: 'Unauthorized - Please login' });
        }
        
        // Get all expenses for logged-in user
        if (pathname === '/api/expenses' && method === 'GET') {
            try {
                const expenses = await ExpenseDB.getAllByUser(userPayload.userId);
                sendJSON(res, 200, { expenses });
            } catch (error) {
                console.error('Get expenses error:', error);
                sendJSON(res, 500, { error: 'Failed to fetch expenses' });
            }
            return;
        }
        
        // Create new expense
        if (pathname === '/api/expenses' && method === 'POST') {
            parseBody(req, async (err, body) => {
                if (err) return sendJSON(res, 400, { error: 'Invalid JSON' });
                
                const { amount, category, description, date } = body;
                
                if (!amount || !category) {
                    return sendJSON(res, 400, { error: 'Amount and category are required' });
                }
                
                try {
                    const expense = {
                        id: uuidv4(),
                        userId: userPayload.userId,
                        amount: parseFloat(amount),
                        category,
                        description: description || '',
                        date: date || new Date().toISOString(),
                        createdAt: new Date().toISOString()
                    };
                    
                    const created = await ExpenseDB.create(expense);
                    sendJSON(res, 201, { expense: created });
                } catch (error) {
                    console.error('Create expense error:', error);
                    sendJSON(res, 500, { error: 'Failed to create expense' });
                }
            });
            return;
        }
        
        // Get single expense by ID
        if (pathname.startsWith('/api/expenses/') && method === 'GET') {
            const expenseId = pathname.split('/')[3];
            try {
                const expense = await ExpenseDB.findById(expenseId, userPayload.userId);
                if (!expense) {
                    return sendJSON(res, 404, { error: 'Expense not found' });
                }
                sendJSON(res, 200, { expense });
            } catch (error) {
                console.error('Get expense error:', error);
                sendJSON(res, 500, { error: 'Failed to fetch expense' });
            }
            return;
        }
        
        // Update expense
        if (pathname.startsWith('/api/expenses/') && method === 'PUT') {
            const expenseId = pathname.split('/')[3];
            parseBody(req, async (err, body) => {
                if (err) return sendJSON(res, 400, { error: 'Invalid JSON' });
                
                try {
                    const updated = await ExpenseDB.update(expenseId, userPayload.userId, body);
                    if (!updated) {
                        return sendJSON(res, 404, { error: 'Expense not found' });
                    }
                    sendJSON(res, 200, { expense: updated });
                } catch (error) {
                    console.error('Update expense error:', error);
                    sendJSON(res, 500, { error: 'Failed to update expense' });
                }
            });
            return;
        }
        
        // Delete expense
        if (pathname.startsWith('/api/expenses/') && method === 'DELETE') {
            const expenseId = pathname.split('/')[3];
            try {
                const deleted = await ExpenseDB.delete(expenseId, userPayload.userId);
                if (!deleted) {
                    return sendJSON(res, 404, { error: 'Expense not found' });
                }
                sendJSON(res, 200, { message: 'Expense deleted successfully' });
            } catch (error) {
                console.error('Delete expense error:', error);
                sendJSON(res, 500, { error: 'Failed to delete expense' });
            }
            return;
        }
        
        // 404 - Route not found
        sendJSON(res, 404, { error: 'Route not found' });
        
    } catch (error) {
        console.error('Server error:', error);
        sendJSON(res, 500, { error: 'Internal server error' });
    }
});

// Start server and initialize database
async function startServer() {
    try {
        await initializeDatabase();
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`\n🚀 Server running on http://0.0.0.0:${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
            console.log('\n📍 Available endpoints:');
            console.log('   POST /api/auth/register - Register new user');
            console.log('   POST /api/auth/login - Login user');
            console.log('   GET  /api/expenses - Get all expenses (auth required)');
            console.log('   POST /api/expenses - Create expense (auth required)');
            console.log('   PUT  /api/expenses/:id - Update expense (auth required)');
            console.log('   DELETE /api/expenses/:id - Delete expense (auth required)');
            console.log('\n✨ Ready to accept requests!\n');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
