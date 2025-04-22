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


// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for image assets)
app.use('/assets', express.static(path.join(__dirname, '../client/src/assets')));

// Router
const homeRouter = require('./routes/home.routes');
const authRouter = require('./routes/auth.routes');

app.use('/', homeRouter);
app.use('/auth', authRouter);

// Session aware
// const session = require('express-session');
// app.use(session({
//     secret: 'topSecret',
//     cookie: {maxAge: 360000},
//     resave: true,
//     saveUninitialized: true
// }));

// Import routes
// const authRoutes = require('./app/routes/auth.routes');
// const userRoutes = require('./app/routes/user.routes');
// const phoneRoutes = require('./app/routes/phone.routes');
// const adminRoutes = require('./app/routes/admin.routes');

// API Routes
// app.get('/api/test', (req, res) => {
//   res.json({ message: 'API is working!' });
// });

// TODO: Uncomment these routes when they're implemented
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/phones', phoneRoutes);
// app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: NODE_ENV === 'development' ? err : {}
  });
});


const User = require('./models/user');

// API route to check content in database
app.get('/items', async (req, res) => {
  try {
      const users = await User.find(); // Fetch all documents
      res.json(users);
  } catch (error) {
      res.status(500).json({ message: 'Error retrieving items', error });
  }
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


