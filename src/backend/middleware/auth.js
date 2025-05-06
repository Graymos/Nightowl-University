// Authentication middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT secret key - in production, this should be in environment variables
const JWT_SECRET = 'your-secret-key'; // TODO: Move to environment variables

// Generate JWT token
const generateToken = (userData) => {
  return jwt.sign(userData, JWT_SECRET, { expiresIn: '24h' });
};

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Authentication error', error: error.message });
  }
};

// Role-based authorization middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    next();
  };
};

// Middleware to check if user is an instructor
const isInstructor = (req, res, next) => {
  if (req.user && req.user.role === 'instructor') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Instructor role required.' });
  }
};

// Middleware to check if user is a student
const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Student role required.' });
  }
};

module.exports = {
  generateToken,
  authenticate,
  authorize,
  isInstructor,
  isStudent
};