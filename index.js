require('dotenv').config();
const express = require('express');
const request = require('request-promise-native');
const NodeCache = require('node-cache');
const session = require('express-session');
const morgan = require('morgan');  // Import morgan for logging

const app = express();

const PORT = 3000;
const userRoutes = require('./routes/userRoutes');
const hubspotRoutes = require('./routes/hubspotRoutes');
const workflowRoutes = require('./routes/workflowRoutes');

// Use morgan to log HTTP requests
app.use(morgan('dev'));  // Log requests to the console in 'dev' format

// Use a session to keep track of client ID
app.use(session({
  secret: Math.random().toString(36).substring(2),
  resave: false,
  saveUninitialized: true
}));

app.use('/', hubspotRoutes);
app.use('/', userRoutes);
app.use('/', workflowRoutes);


app.listen(PORT, () => console.log(`=== Starting your app on http://localhost:${PORT} ===`));
