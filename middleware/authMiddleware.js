const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
     // Log all the request headers
     console.log('Request Headers:', req.headers);
    const authHeader = req.header('Authorization');
    console.log('Authorization Header:', authHeader);
    if (!authHeader) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. Token missing.' });
    }

    try {
        const decoded = jwt.verify(token, 'kjfoh349isb2f9b2if');
        req.userId = decoded.userId;
        console.log('--> User ID from token:', req.userId);
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

module.exports = authMiddleware;

