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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/OldPhoneDeals';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create Express server
const app = express();
// Import database operations.
// const db = require('./models/db');

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

// Session middleware (needed for admin auth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 15 * 60 * 1000 // 15 minutes
  }
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
});

// Static files (for image assets)
app.use('/assets', express.static(path.join(__dirname, '../client/src/assets')));

// Import routes
const userRouter = require('./routes/user.routes');
const phonelistingRouter = require('./routes/phonelisting.routes');
const adminRoutes = require('./routes/admin.routes');
const reviewRoutes = require('./routes/review.routes');
const notificationRoutes = require('./routes/notifications.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const orderRoutes = require('./routes/order.routes');

// API Routes (MUST come before static file serving and catch-all)
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// API routes
app.use('/user', userRouter);
app.use('/phonelisting', phonelistingRouter);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);

// Serve static files from Angular build
app.use(express.static(path.join(__dirname, '../client/dist/oldphonedeals-client/browser')));

// Catch-all handler: send back Angular's index.html file for any non-API routes
// THIS MUST BE THE LAST ROUTE
app.get('*path', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/oldphonedeals-client/browser/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: NODE_ENV === 'development' ? err : {}
  });
});


// Connect to MongoDB and start server
try {
  // Connect to MongoDB
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
} catch(error) {
  console.error('Server initialization error:', error);
  process.exit(1);
}