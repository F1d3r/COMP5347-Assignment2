/**
 * Main server file for OldPhoneDeals application
 */

// Import dependencies
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');

// Load environment variables
require('dotenv').config();
const PORT = parseInt(process.env.PORT, 10) || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/oldphonedeals';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create Express server
const app = express();
// Import database operations.
const db = require('./models/db');

// Set view engine.
app.set('view engine', 'ejs');
// Set view path.
app.set('views', path.join(__dirname, './views'));
// Set the static directory.
app.use(express.static(path.join(__dirname, 'public')));


// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use session.
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {maxAge: 360000},
  resave: true,
  saveUninitialized: true
}));
// Initialize the sessions if the session is not.
app.use((req, res, next) => {
  if(!req.session.user){
    req.session.user = {
      role: 'guest',
      firstname: null,
      lastname: null,
      email: null
    }
  }
  next();
})


// Router
const userRouter = require('./routes/user.routes');
const phoneRouter = require('./routes/phone.routes');
app.use('/user', userRouter);
app.use('/phone', phoneRouter);



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: NODE_ENV === 'development' ? err : {}
  });
});



// Connect to MongoDB and start server
try{
  // Lauch server withouth initializing.
  db.connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
catch(error){
  console.error('MongoDB connection error:', error);
  process.exit(1);
};
