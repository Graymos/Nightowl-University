// Main Express server setup
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Use the users router for all user-related endpoints
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

// You can add other routers here as needed, e.g. courses, reviews, etc.

// Optionally, a root endpoint for health check
app.get('/', (req, res) => {
  res.send('NightOwl University backend is running.');
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});