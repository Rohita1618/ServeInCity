const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Make sure this path matches where your User model is!

// 🛡️ Guard 1: Are they logged in?
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Extract the token from the "Bearer <token>" string
            token = req.headers.authorization.split(' ')[1];

            // 2. Decode the token using your secret key from the .env file
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Find the user in the database and attach them to the request
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Security check passed, let them through!
        } catch (error) {
            console.error("Token verification failed:", error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// 👑 Guard 2: Are they an Admin?
const isAdmin = (req, res, next) => {
    // This assumes the 'protect' middleware ran first and attached req.user
    if (req.user && req.user.role === 'admin') {
        next(); // They are an admin, let them through!
    } else {
        res.status(403).json({ message: "Access denied. Administrator clearance required." });
    }
};

module.exports = { protect, isAdmin };