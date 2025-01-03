const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');

// Load environment variables from .env file
require('dotenv').config();

const Goal = require('./models/goal');

const app = express();

// Middleware for logging
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs', 'access.log'),
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));

// Middleware for parsing JSON
app.use(bodyParser.json());

// CORS Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Routes

// GET /goals
app.get('/goals', async (req, res) => {
  console.log('[GET /goals] Fetching goals');
  try {
    const goals = await Goal.find();
    res.status(200).json({
      goals: goals.map((goal) => ({
        id: goal.id,
        text: goal.text,
      })),
    });
    console.log('[GET /goals] Successfully fetched goals');
  } catch (err) {
    console.error('[GET /goals] Error:', err.message);
    res.status(500).json({ message: 'Failed to load goals.' });
  }
});

// POST /goals
app.post('/goals', async (req, res) => {
  const goalText = req.body.text;

  if (!goalText || goalText.trim().length === 0) {
    console.log('[POST /goals] Invalid input - no text');
    return res.status(422).json({ message: 'Invalid goal text.' });
  }

  try {
    const goal = new Goal({ text: goalText });
    await goal.save();
    res.status(201).json({
      message: 'Goal saved',
      goal: { id: goal.id, text: goal.text },
    });
    console.log('[POST /goals] Goal successfully saved');
  } catch (err) {
    console.error('[POST /goals] Error saving goal:', err.message);
    res.status(500).json({ message: 'Failed to save goal.' });
  }
});

// DELETE /goals/:id
app.delete('/goals/:id', async (req, res) => {
  const goalId = req.params.id;
  console.log(`[DELETE /goals/${goalId}] Deleting goal`);

  try {
    const result = await Goal.deleteOne({ _id: goalId });
    if (result.deletedCount === 0) {
      console.log(`[DELETE /goals/${goalId}] Goal not found`);
      return res.status(404).json({ message: 'Goal not found.' });
    }

    res.status(200).json({ message: 'Goal deleted!' });
    console.log(`[DELETE /goals/${goalId}] Successfully deleted goal`);
  } catch (err) {
    console.error(`[DELETE /goals/${goalId}] Error deleting goal:`, err.message);
    res.status(500).json({ message: 'Failed to delete goal.' });
  }
});

// MongoDB Connection
const mongoUrl = process.env.MONGO_URL;
const port = process.env.PORT || 321;

if (!mongoUrl) {
  console.error('Error: MONGO_URL is not defined in .env');
  process.exit(1);
}

console.log('Connecting to MongoDB with connection string:', mongoUrl);

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

module.exports = app;
