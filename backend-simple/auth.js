// Simple Authentication Helpers
// Note: For production, use proper JWT libraries like 'jsonwebtoken'

const crypto = require('crypto');

// Simple password hashing (For production use bcrypt)
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function comparePassword(password, hash) {
    return hashPassword(password) === hash;
}

// Simple JWT-like token (For production use 'jsonwebtoken' library)
function generateToken(userId, username) {
    const payload = {
        userId,
        username,
        timestamp: Date.now()
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function verifyToken(token) {
    try {
        const payload = JSON.parse(Buffer.from(token, 'base64').toString());
        // Check if token is less than 7 days old
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - payload.timestamp > sevenDays) {
            return null;
        }
        return payload;
    } catch (error) {
        return null;
    }
}

// Extract user ID from request headers
function getUserFromRequest(req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return null;
    
    const token = authHeader.replace('Bearer ', '');
    const payload = verifyToken(token);
    return payload;
}

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken,
    getUserFromRequest
};
