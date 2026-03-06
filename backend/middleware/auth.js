import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    let token;

    //check if token exists in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }
            next();
        } catch (error) {
            const message = error?.message || String(error);
            console.error('Auth middleware error:', message);

            if (error?.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }

            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export default protect;