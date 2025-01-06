const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const Goal = require('./models/goal');
require('dotenv').config(); 

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs', 'access.log'),
  { flags: 'a' }
);

app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/goals', async (req, res) => {
  try {
    const goals = await Goal.find();
    res.status(200).json({
      goals: goals.map((goal) => ({
        id: goal.id,
        text: goal.text,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load goals.' });
  }
});

app.post('/goals', async (req, res) => {
  const goalText = req.body.text;

  if (!goalText || goalText.trim().length === 0) {
    return res.status(422).json({ message: 'Invalid goal text.' });
  }

  const goal = new Goal({ text: goalText });

  try {
    await goal.save();
    res
      .status(201)
      .json({ message: 'Goal saved', goal: { id: goal.id, text: goalText } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save goal.' });
  }
});

app.delete('/goals/:id', async (req, res) => {
  try {
    await Goal.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Deleted goal!' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete goal.' });
  }
});

const mongoose = require('mongoose');
const http = require('http');
// const app = require('./app');
require('dotenv').config();

const port = process.env.PORT || 3000;
const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
  console.error('MONGO_URL is not defined in .env');
  process.exit(1);
}

mongoose.connect(
  mongoUrl,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      console.error('Failed to connect to MongoDB:', err);
    } else {
      console.log('Connected to MongoDB');
      const server = http.createServer(app); // Create HTTP server
      server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    }
  }
);

module.exports = app; // Export the app
