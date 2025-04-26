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
const db = require('./server/models/db');

// Set view engine.
app.set('view engine', 'ejs');
// Set view path.
app.set('views', path.join(__dirname, './server/views'));
// Set the static directory.
app.use(express.static(path.join(__dirname, 'public')));


// Middleware
// app.use(cors());
// app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use session.
app.use(session({
  secret: 'topSecret',
  cookie: {maxAge: 360000},
  resave: true,
  saveUninitialized: true
}));

// Static files (for image assets)
// app.use('/assets', express.static(path.join(__dirname, './client/src/assets')));


// Router
const userRouter = require('./server/routes/user.routes');
const authRouter = require('./server/routes/auth.routes');
app.use('/', userRouter);
app.use('/auth', authRouter);



// Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     message: err.message || 'Internal Server Error',
//     error: NODE_ENV === 'development' ? err : {}
//   });
// });


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