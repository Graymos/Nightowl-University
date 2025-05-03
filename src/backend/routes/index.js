// Main routes file
const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./users');
const courseRoutes = require('./courses');

// Use route modules
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);

// Base API route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Night Owl University API' });
});

module.exports = router;