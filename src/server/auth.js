const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('./models');

// Secret key for JWT - should be in .env file
const JWT_SECRET = process.env.JWT_SECRET || 'night-owl-university-secret-key';

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a password with a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if password matches
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate a JWT token
 * @param {object} user - User object
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
  const payload = {
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
};

/**
 * Verify JWT token middleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const authenticateJWT = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

/**
 * Check if user is an instructor
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const instructorAuth = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Access denied. Instructor role required.' });
  }
  next();
};

/**
 * Register a new user
 * @param {object} db - SQLite database instance
 * @param {object} userData - User data
 * @returns {Promise<object>} - User object and token
 */
const registerUser = async (db, userData) => {
  try {
    // Check if user exists
    const existingUser = await User.findByEmail(db, userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email format');
    }
    
    // If it's an instructor, validate .edu domain (optional based on requirements)
    if (userData.role === 'instructor' && !userData.email.endsWith('.edu')) {
      throw new Error('Instructor email must use a .edu domain');
    }
    
    // Hash password
    userData.password = await hashPassword(userData.password);
    
    // Create user
    const user = await User.create(db, userData);
    
    // Generate token
    const token = generateToken(user);
    
    return {
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      },
      token
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Authenticate user and get token
 * @param {object} db - SQLite database instance
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} - User object and token
 */
const loginUser = async (db, email, password) => {
  try {
    // Check if user exists
    const user = await User.findByEmail(db, email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Check password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    
    // Generate token
    const token = generateToken(user);
    
    return {
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      },
      token
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  authenticateJWT,
  instructorAuth,
  registerUser,
  loginUser
};