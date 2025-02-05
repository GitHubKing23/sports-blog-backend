const jwt = require('jsonwebtoken');

// Middleware to protect routes (authenticate site owner)
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Extract token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user email (from decoded token) to request object
            req.user = { email: decoded.email }; 
            console.log('[Authentication] User authenticated:', req.user.email);

            next(); // Pass control to the next middleware or route handler
        } catch (error) {
            console.error('[Authentication Error] Token verification failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    } else {
        console.error('[Authentication Error] No token provided in headers');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to ensure the user is the site owner
const isSiteOwner = (req, res, next) => {
    const siteOwnerEmail = process.env.SITE_OWNER_EMAIL;

    if (req.user && req.user.email === siteOwnerEmail) {
        console.log('[Authorization] User is site owner:', req.user.email);
        next(); // Pass control to the next middleware or route handler
    } else {
        console.error('[Authorization Error] Access denied. User is not site owner:', req.user?.email || 'Unknown');
        return res.status(403).json({ message: 'Not authorized as site owner' });
    }
};

module.exports = { protect, isSiteOwner };
