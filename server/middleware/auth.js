const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
};

// Role-based guard factory
const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: `Access denied. Required roles: ${roles.join(', ')}` });
    }
    next();
};

module.exports = { protect, requireRole };
