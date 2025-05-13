/**
 * Main server file for OldPhoneDeals application
 */

// Load environment variables
require('dotenv').config();
const PORT = parseInt(process.env.PORT, 10) || 3000;

// Import dependencies
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session')


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
const authRouter = require('./routes/auth.routes');
app.use('/', userRouter);
app.use('/auth', authRouter);



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: NODE_ENV === 'development' ? err : {}
  });
});


// Initialize the database.
// db.initializeDatabase();

// Connect to MongoDB and start server
try{
  db.connectDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}catch(dbError){
  console.log("Failed to connect to database.")
}