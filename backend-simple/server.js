// Simple Expense Tracker Backend - Plain JavaScript
// Yahan hum basic HTTP server use kar rahe hain bina framework ke

const http = require('http');
const url = require('url');
const PORT = process.env.PORT || 3000;

// In-memory storage (Simple array mein data store karenge)
let expenses = [];
let idCounter = 1;

// CORS headers for frontend
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
}

// JSON response helper
function sendJSON(res, statusCode, data) {
    setCorsHeaders(res);
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

// Request body parser
function parseBody(req, callback) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const parsed = body ? JSON.parse(body) : {};
            callback(null, parsed);
        } catch (error) {
            callback(error);
        }
    });
}

// HTTP Server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // CORS preflight
    if (method === 'OPTIONS') {
        setCorsHeaders(res);
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`${method} ${pathname}`);

    // Routes
    
    // Health check
    if (pathname === '/health' && method === 'GET') {
        sendJSON(res, 200, {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        });
        return;
    }

    // GET /api/expenses - List all expenses
    if (pathname === '/api/expenses' && method === 'GET') {
        sendJSON(res, 200, {
            success: true,
            count: expenses.length,
            data: expenses
        });
        return;
    }

    // GET /api/expenses/:id - Get single expense
    if (pathname.match(/^\/api\/expenses\/\d+$/) && method === 'GET') {
        const id = pathname.split('/')[3];
        const expense = expenses.find(e => e.id === id);
        
        if (!expense) {
            sendJSON(res, 404, { error: 'Expense nahi mila' });
            return;
        }
        
        sendJSON(res, 200, {
            success: true,
            data: expense
        });
        return;
    }

    // POST /api/expenses - Create expense
    if (pathname === '/api/expenses' && method === 'POST') {
        parseBody(req, (err, body) => {
            if (err) {
                sendJSON(res, 400, { error: 'Invalid data' });
                return;
            }

            const { amount, category, date, description } = body;

            if (!amount || !category) {
                sendJSON(res, 400, { error: 'Amount aur category zaruri hai' });
                return;
            }

            const expense = {
                id: String(idCounter++),
                amount: parseFloat(amount),
                category,
                date: date || new Date().toISOString().split('T')[0],
                description: description || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            expenses.unshift(expense);

            sendJSON(res, 201, {
                success: true,
                data: expense
            });
        });
        return;
    }

    // PUT /api/expenses/:id - Update expense
    if (pathname.match(/^\/api\/expenses\/\d+$/) && method === 'PUT') {
        const id = pathname.split('/')[3];
        
        parseBody(req, (err, body) => {
            if (err) {
                sendJSON(res, 400, { error: 'Invalid data' });
                return;
            }

            const index = expenses.findIndex(e => e.id === id);
            
            if (index === -1) {
                sendJSON(res, 404, { error: 'Expense nahi mila' });
                return;
            }

            expenses[index] = {
                ...expenses[index],
                ...body,
                id: expenses[index].id,
                createdAt: expenses[index].createdAt,
                updatedAt: new Date().toISOString()
            };

            sendJSON(res, 200, {
                success: true,
                data: expenses[index]
            });
        });
        return;
    }

    // DELETE /api/expenses/:id - Delete expense
    if (pathname.match(/^\/api\/expenses\/\d+$/) && method === 'DELETE') {
        const id = pathname.split('/')[3];
        const index = expenses.findIndex(e => e.id === id);
        
        if (index === -1) {
            sendJSON(res, 404, { error: 'Expense nahi mila' });
            return;
        }

        expenses.splice(index, 1);

        sendJSON(res, 200, {
            success: true,
            message: 'Expense delete ho gaya'
        });
        return;
    }

    // GET /api/expenses/summary/by-category - Summary
    if (pathname === '/api/expenses/summary/by-category' && method === 'GET') {
        const summary = {};
        
        expenses.forEach(expense => {
            if (!summary[expense.category]) {
                summary[expense.category] = { total: 0, count: 0 };
            }
            summary[expense.category].total += expense.amount;
            summary[expense.category].count += 1;
        });

        sendJSON(res, 200, {
            success: true,
            data: summary
        });
        return;
    }

    // 404 - Route not found
    sendJSON(res, 404, { error: 'Route nahi mila' });
});

// Start server
server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║  🚀 Expense Tracker Backend Shuru Ho Gaya!    ║
║                                                ║
║  Server: http://localhost:${PORT}              ║
║  Health: http://localhost:${PORT}/health       ║
║  API:    http://localhost:${PORT}/api/expenses ║
║                                                ║
║  Backend simple JavaScript mein hai           ║
║  Koi framework nahi use kiya                  ║
╚════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Server band ho raha hai...');
    server.close(() => {
        console.log('Server band ho gaya');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nServer band ho raha hai...');
    server.close(() => {
        console.log('Server band ho gaya');
        process.exit(0);
    });
});
