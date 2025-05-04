const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Assuming this exists from init-db.js
const PhoneListing = require('../models/PhoneListing'); // Assuming this exists from init-db.js
const bcrypt = require('bcrypt');

// Admin authentication middleware - use this to protect admin routes
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Admin privileges required' });
};

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const admin = await User.findOne({ email, isAdmin: true });
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, admin.password);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Set admin session
    req.session.user = {
      _id: admin._id,
      email: admin.email,
      isAdmin: true
    };
    
    res.json({ 
      message: 'Admin logged in successfully',
      admin: {
        _id: admin._id,
        firstname: admin.firstname,
        lastname: admin.lastname,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.json({ message: 'Admin logged out successfully' });
  });
});

// Get all users (admin only)
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all phone listings (admin only)
router.get('/listings', isAdmin, async (req, res) => {
  try {
    const listings = await PhoneListing.find()
      .populate('seller', 'firstname lastname email');
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle listing disabled status (admin only)
router.patch('/listings/:listingId/toggle-status', isAdmin, async (req, res) => {
  try {
    const listing = await PhoneListing.findById(req.params.listingId);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    listing.disabled = !listing.disabled;
    await listing.save();
    
    res.json({ 
      message: 'Listing status toggled successfully',
      disabled: listing.disabled
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;