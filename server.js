/**
 * Main server file for OldPhoneDeals application
 */








// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');


// Create Express server
const app = express();

// Environment variables
const PORT = process.env.PORT || 3000;
const MONGODB_URI = 'mongodb://localhost:27017/OldPhoneDeals';
const NODE_ENV = process.env.NODE_ENV || 'development';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './server/views'));


// Middleware
// app.use(cors());
// app.use(helmet());
app.use(morgan('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Static files (for image assets)
// app.use('/assets', express.static(path.join(__dirname, './client/src/assets')));


// Router
const userRouter = require('./server/routes/user.routes');

app.use('/', userRouter);

// Set the static directory.
app.use(express.static(path.join(__dirname, 'public')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: NODE_ENV === 'development' ? err : {}
  });
});


// Connect to MongoDB and start server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });