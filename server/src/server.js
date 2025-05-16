
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
const db = require('./models/db');

// Create Express app
const app = express();

// Environment variables
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/OldPhoneDeals';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for image assets)
app.use('/assets', express.static(path.join(__dirname, '../client/src/assets')));

// Import routes
// const authRoutes = require('./routes/auth.routes');
// const userRoutes = require('./routes/user.routes');
const phoneRoutes = require('./routes/phone.routes');
// const adminRoutes = require('./routes/admin.routes');

// API Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// TODO: Uncomment these routes when they're implemented
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
app.use('/phones', phoneRoutes);
// app.use('/api/admin', adminRoutes);

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
.then(async () => {
  // // Initialize the database.
  // db.initializeDatabase().
  // then(()=>{
  //   db.connectDB();
  //   app.listen(PORT, () => {
  //     console.log(`Server running on port ${PORT}`);
  //   });
  // })

  // Lauch server withouth initializing.
  db.connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});
