require('dotenv').config();
const express = require('express');
const morgan = require('morgan');  
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

const app = express();

const PORT = 3000;
const userRoutes = require('./routes/userRoutes');
const hubspotRoutes = require('./routes/hubspotRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const testRoutes = require('./routes/testRoutes');

// Use morgan to log HTTP requests
app.use(morgan('dev'));  // Log requests to the console in 'dev' format

app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,  // MongoDB connection string
    collectionName: 'sessions'
  }),
  cookie: { maxAge: 24 * 60 * 60 * 1000 }  // 1-day session expiration
}));

// Use a session to keep track of client ID
// app.use(session({
//   secret: Math.random().toString(36).substring(2),
//   resave: false,
//   saveUninitialized: true
// }));

// MongoDB connection
const mongoUri = process.env.MONGO_URI;  // Ensure MONGO_URI is set in your .env file

mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/', hubspotRoutes);
app.use('/', userRoutes);
app.use('/', workflowRoutes);
app.use('/', testRoutes);

// Start server
app.listen(PORT, () => console.log(`=== Starting your app on http://localhost:${PORT} ===`));
