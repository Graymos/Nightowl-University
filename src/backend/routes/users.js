// User routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken, authenticate } = require('../middleware/auth');

// Register a new student
router.post('/register/student', async (req, res) => {
  try {
    const { first_name, middle_name, last_name, email, password, phone_number } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      first_name,
      middle_name,
      last_name,
      email,
      password: hashedPassword,
      phone_number,
      role: 'student'
    });

    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({ message: 'Error registering student', error: error.message });
  }
});

// Register a new faculty member
router.post('/register/faculty', async (req, res) => {
  try {
    const { first_name, middle_name, last_name, email, password, phone_number } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      first_name,
      middle_name: middle_name || null,
      last_name,
      email,
      password: hashedPassword,
      phone_number: phone_number || null,
      role: 'instructor'
    });

    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    res.status(201).json({
      message: 'Faculty registered successfully',
      token,
      user: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Error registering faculty:', error);
    res.status(500).json({ message: 'Error registering faculty', error: error.message });
  }
});

// Login for students and faculty
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

// Get user profile (protected route)
router.get('/profile', authenticate, async (req, res) => {
  try {
    // User is already attached to req by authenticate middleware
    res.json({
      user: {
        id: req.user.id,
        first_name: req.user.first_name,
        middle_name: req.user.middle_name,
        last_name: req.user.last_name,
        email: req.user.email,
        phone_number: req.user.phone_number,
        discord_id: req.user.discord_id,
        teams_id: req.user.teams_id,
        role: req.user.role,
        created_at: req.user.created_at
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

module.exports = router;