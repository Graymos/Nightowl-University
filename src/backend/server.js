// Main Express server setup
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { setupDatabase } = require('./config/database');
const routes = require('./routes');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize database
setupDatabase();

// Use the API routes
app.use('/api', routes);

// Serve the main HTML file for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});