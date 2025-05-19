const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PhoneListing = require('../models/PhoneListing');
const bcrypt = require('bcrypt');
const adminLogController = require('../controllers/adminLog.controller');

// Admin authentication middleware
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Admin privileges required' });
};

// Admin login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin user by email and isAdmin flag
    const admin = await User.findOne({ email: email, isAdmin: true });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Verify password
    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set admin session with timeout
    req.session.user = {
      _id: admin._id,
      email: admin.email,
      isAdmin: true
    };

    // Set session timeout (15 minutes)
    req.session.cookie.maxAge = 15 * 60 * 1000;

    // Log the admin login
    adminLogController.logAdminAction(
      req, 
      res, 
      admin._id, 
      'admin_login',
      null,
      { email: admin.email }
    );

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

// Admin logout endpoint
router.post('/logout', (req, res) => {
  // Log the admin logout if there's an admin session
  if (req.session && req.session.user && req.session.user._id) {
    adminLogController.logAdminAction(
      req, 
      res, 
      req.session.user._id, 
      'admin_logout'
    );
  }

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
    const Activity = require('../models/activity');
    
    // Get all users
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    // For each user, find their most recent login activity
    const usersWithLoginActivity = await Promise.all(users.map(async (user) => {
      const userObj = user.toObject();
      
      // Find the most recent login activity for this user
      const latestLogin = await Activity.findOne({
        userId: user._id,
        activity: 'login'
      }).sort({ timestamp: -1 });
      
      // Add lastLogin field if login activity was found
      if (latestLogin) {
        userObj.lastLogin = latestLogin.timestamp;
      }
      
      return userObj;
    }));
    
    res.json(usersWithLoginActivity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit a user (admin only)
router.patch('/users/:userId', isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstname, lastname, email } = req.body;

    // Validate input
    if (!firstname || !lastname || !email) {
      return res.status(400).json({ message: 'First name, last name, and email are required' });
    }

    // Get original user data for logging
    const originalUser = await User.findById(userId).select('-password');
    if (!originalUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email already exists for another user
    const existingUser = await User.findOne({ 
      email: email, 
      _id: { $ne: userId } 
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.toLowerCase().trim()
      },
      { new: true, runValidators: true }
    ).select('-password');

    // Log the user update
    adminLogController.logAdminAction(
      req, 
      res, 
      req.session.user._id, 
      'user_update',
      userId,
      { 
        before: {
          firstname: originalUser.firstname,
          lastname: originalUser.lastname,
          email: originalUser.email
        },
        after: {
          firstname: updatedUser.firstname,
          lastname: updatedUser.lastname,
          email: updatedUser.email
        }
      }
    );

    res.json({ 
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a user (admin only)
router.delete('/users/:userId', isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent admin from deleting themselves
    if (userId === req.session.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // First cascade delete related data
    const cascadeResults = await cascadeUserDelete(userId);
    
    // Log the user deletion
    adminLogController.logAdminAction(
      req, 
      res, 
      req.session.user._id, 
      'user_delete',
      userId,
      { 
        user: {
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname
        },
        cascadeResults: cascadeResults
      }
    );
    
    // Then delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ 
      message: 'User and all associated data deleted successfully',
      deletedListings: cascadeResults.deletedListings,
      modifiedListings: cascadeResults.modifiedListings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle user admin status (admin only)
router.patch('/users/:userId/toggle-admin', isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from removing their own admin status
    if (userId === req.session.user._id) {
      return res.status(400).json({ message: 'Cannot change your own admin status' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Save original status for logging
    const originalStatus = user.isAdmin;
    
    // Toggle admin status
    user.isAdmin = !user.isAdmin;
    await user.save();

    // Log the admin status change
    adminLogController.logAdminAction(
      req, 
      res, 
      req.session.user._id, 
      'user_toggle_admin',
      userId,
      { 
        user: {
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname
        },
        before: { isAdmin: originalStatus },
        after: { isAdmin: user.isAdmin }
      }
    );

    res.json({ 
      message: 'User admin status updated successfully',
      isAdmin: user.isAdmin
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all phone listings (admin only)
router.get('/listings', isAdmin, async (req, res) => {
  try {
    const listings = await PhoneListing.find()
      .populate('seller', 'firstname lastname email')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit a listing (admin only)
router.patch('/listings/:listingId', isAdmin, async (req, res) => {
  try {
    const { listingId } = req.params;
    const { title, brand, price, stock } = req.body;

    // Validate input
    if (!title || !brand || price === undefined || stock === undefined) {
      return res.status(400).json({ message: 'Title, brand, price, and stock are required' });
    }

    if (price < 0 || stock < 0) {
      return res.status(400).json({ message: 'Price and stock must be non-negative' });
    }

    // Get original listing for logging
    const originalListing = await PhoneListing.findById(listingId)
      .populate('seller', 'firstname lastname email');
    
    if (!originalListing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Update listing
    const updatedListing = await PhoneListing.findByIdAndUpdate(
      listingId,
      { 
        title: title.trim(),
        brand: brand.trim(),
        price: parseFloat(price),
        stock: parseInt(stock)
      },
      { new: true, runValidators: true }
    ).populate('seller', 'firstname lastname email');

    // Log the listing update
    adminLogController.logAdminAction(
      req, 
      res, 
      req.session.user._id, 
      'listing_update',
      listingId,
      { 
        before: {
          title: originalListing.title,
          brand: originalListing.brand,
          price: originalListing.price,
          stock: originalListing.stock
        },
        after: {
          title: updatedListing.title,
          brand: updatedListing.brand,
          price: updatedListing.price,
          stock: updatedListing.stock
        },
        seller: {
          _id: originalListing.seller._id,
          email: originalListing.seller.email
        }
      }
    );

    res.json({ 
      message: 'Listing updated successfully',
      listing: updatedListing
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a listing (admin only)
router.delete('/listings/:listingId', isAdmin, async (req, res) => {
  try {
    const { listingId } = req.params;

    // Get listing before deleting for logging
    const listing = await PhoneListing.findById(listingId)
      .populate('seller', 'firstname lastname email');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Log the listing deletion
    adminLogController.logAdminAction(
      req, 
      res, 
      req.session.user._id, 
      'listing_delete',
      listingId,
      { 
        listing: {
          title: listing.title,
          brand: listing.brand,
          price: listing.price
        },
        seller: {
          _id: listing.seller._id,
          email: listing.seller.email
        }
      }
    );

    // Delete the listing
    await PhoneListing.findByIdAndDelete(listingId);

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reviews across all listings (admin only)
router.get('/reviews', isAdmin, async (req, res) => {
  try {
    // Find all listings
    const listings = await PhoneListing.find()
      .populate('seller', 'firstname lastname email')
      .populate('reviews.reviewer', 'firstname lastname email');
    
    // Extract and flatten all reviews with listing context
    const allReviews = [];
    
    listings.forEach(listing => {
      if (listing.reviews && listing.reviews.length > 0) {
        listing.reviews.forEach(review => {
          allReviews.push({
            _id: review._id,
            listing: {
              _id: listing._id,
              title: listing.title,
              brand: listing.brand
            },
            reviewer: review.reviewer,
            rating: review.rating,
            comment: review.comment,
            hidden: review.hidden,
            createdAt: review.createdAt
          });
        });
      }
    });
    
    // Sort by most recent
    allReviews.sort((a, b) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    
    res.json(allReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search reviews (admin only)
router.get('/reviews/search', isAdmin, async (req, res) => {
  try {
    const { query, filter } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Build search conditions
    let listingCondition = {};
    let reviewCondition = {};
    
    switch (filter) {
      case 'listing':
        // Search by listing title
        listingCondition = { 
          title: { $regex: query, $options: 'i' }
        };
        break;
      case 'user':
        // We'll need to find users first whose name matches the query
        const users = await User.find({
          $or: [
            { firstname: { $regex: query, $options: 'i' } },
            { lastname: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }).select('_id');
        
        const userIds = users.map(user => user._id);
        reviewCondition = { 'reviews.reviewer': { $in: userIds } };
        break;
      default:
        // Search by review content (default)
        reviewCondition = { 
          'reviews.comment': { $regex: query, $options: 'i' }
        };
    }
    
    // Find listings that match either condition
    const listings = await PhoneListing.find({
      $or: [listingCondition, reviewCondition]
    })
    .populate('seller', 'firstname lastname email')
    .populate('reviews.reviewer', 'firstname lastname email');
    
    // Extract matching reviews
    const matchingReviews = [];
    
    listings.forEach(listing => {
      if (listing.reviews && listing.reviews.length > 0) {
        // Filter reviews if searching by content
        let filteredReviews = listing.reviews;
        
        if (filter !== 'listing' && filter !== 'user') {
          filteredReviews = listing.reviews.filter(review => 
            review.comment && review.comment.toLowerCase().includes(query.toLowerCase())
          );
        } else if (filter === 'user') {
          filteredReviews = listing.reviews.filter(review => 
            userIds.some(id => review.reviewer && review.reviewer._id.equals(id))
          );
        }
        
        filteredReviews.forEach(review => {
          matchingReviews.push({
            _id: review._id,
            listing: {
              _id: listing._id,
              title: listing.title,
              brand: listing.brand
            },
            reviewer: review.reviewer,
            rating: review.rating,
            comment: review.comment,
            hidden: review.hidden,
            createdAt: review.createdAt
          });
        });
      }
    });
    
    // Sort by most recent
    matchingReviews.sort((a, b) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    
    res.json(matchingReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a review (admin only)
router.delete('/reviews/:listingId/:reviewId', isAdmin, async (req, res) => {
  try {
    const { listingId, reviewId } = req.params;
    
    // Find the listing
    const listing = await PhoneListing.findById(listingId)
      .populate('reviews.reviewer', 'firstname lastname email');
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Find the review index
    const reviewIndex = listing.reviews.findIndex(
      review => review._id.toString() === reviewId
    );
    
    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Get review for logging before removing
    const reviewForLogging = {
      _id: listing.reviews[reviewIndex]._id,
      rating: listing.reviews[reviewIndex].rating,
      comment: listing.reviews[reviewIndex].comment,
      reviewer: listing.reviews[reviewIndex].reviewer
        ? {
            _id: listing.reviews[reviewIndex].reviewer._id,
            email: listing.reviews[reviewIndex].reviewer.email
          }
        : null
    };

    // Log the review deletion
    adminLogController.logAdminAction(
      req, 
      res, 
      req.session.user._id, 
      'review_delete',
      reviewId,
      { 
        review: reviewForLogging,
        listing: {
          _id: listing._id,
          title: listing.title
        }
      }
    );
    
    // Remove the review from the array
    listing.reviews.splice(reviewIndex, 1);
    
    // Save the listing
    await listing.save();
    
    res.json({ 
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle review visibility (admin only)
router.patch('/reviews/:listingId/:reviewId/toggle-visibility', isAdmin, async (req, res) => {
  try {
    const { listingId, reviewId } = req.params;
    
    // Find the listing
    const listing = await PhoneListing.findById(listingId)
      .populate('reviews.reviewer', 'firstname lastname email');
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Find the review in the listing
    const reviewIndex = listing.reviews.findIndex(
      review => review._id.toString() === reviewId
    );
    
    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Toggle the hidden status
    const currentVisibility = listing.reviews[reviewIndex].hidden === true;
    const previousVisibility = currentVisibility;
    listing.reviews[reviewIndex].hidden = !currentVisibility;
    
    // Log the review visibility toggle
    adminLogController.logAdminAction(
      req, 
      res, 
      req.session.user._id, 
      'review_toggle_visibility',
      reviewId,
      { 
        review: {
          _id: listing.reviews[reviewIndex]._id,
          comment: listing.reviews[reviewIndex].comment.substr(0, 50) + (listing.reviews[reviewIndex].comment.length > 50 ? '...' : ''),
          reviewer: listing.reviews[reviewIndex].reviewer
            ? {
                _id: listing.reviews[reviewIndex].reviewer._id,
                email: listing.reviews[reviewIndex].reviewer.email
              }
            : null
        },
        listing: {
          _id: listing._id,
          title: listing.title
        },
        visibility: {
          before: previousVisibility,
          after: !previousVisibility
        }
      }
    );
    
    await listing.save();
    
    res.json({
      message: `Review ${currentVisibility ? 'shown' : 'hidden'} successfully`,
      hidden: listing.reviews[reviewIndex].hidden
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle user disabled status (admin only)
router.patch('/users/:userId/toggle-disabled', isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent admin from disabling themselves
    if (userId === req.session.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot disable your own account' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Save original status for logging
    const originalStatus = user.disabled;
    
    // Toggle disabled status
    user.disabled = !user.disabled;
    await user.save();
    
    let cascadeResult = null;
    
    // Update related data
    if (user.disabled) {
      // If user is disabled, disable their listings and hide their reviews
      cascadeResult = await cascadeUserDisable(userId);
      
      // Log the user disable action
      adminLogController.logAdminAction(
        req, 
        res, 
        req.session.user._id, 
        'user_toggle_disable',
        userId,
        { 
          user: {
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname
          },
          before: { disabled: originalStatus },
          after: { disabled: user.disabled },
          cascadeResult: cascadeResult
        }
      );
      
      res.json({ 
        message: `User disabled successfully. Also disabled ${cascadeResult.disabledListings} listings and hid ${cascadeResult.hiddenReviews} reviews in ${cascadeResult.listingsWithReviews} listings.`,
        disabled: true
      });
    } else {
      // If user is re-enabled, re-enable their listings and unhide their reviews
      cascadeResult = await cascadeUserEnable(userId);
      
      // Log the user enable action
      adminLogController.logAdminAction(
        req, 
        res, 
        req.session.user._id, 
        'user_toggle_disable',
        userId,
        { 
          user: {
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname
          },
          before: { disabled: originalStatus },
          after: { disabled: user.disabled },
          cascadeResult: cascadeResult
        }
      );
      
      res.json({ 
        message: `User enabled successfully. Also re-enabled ${cascadeResult.enabledListings} listings and unhid ${cascadeResult.unhiddenReviews} reviews in ${cascadeResult.listingsWithReviews} listings.`,
        disabled: false
      });
    }
  } catch (error) {
    console.error('Error toggling user disabled status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Toggle listing disabled status (admin only)
router.patch('/listings/:listingId/toggle-status', isAdmin, async (req, res) => {
  try {
    const listing = await PhoneListing.findById(req.params.listingId)
      .populate('seller', 'firstname lastname email');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Save original status for logging
    const originalStatus = listing.disabled === true;
    
    // Ensure we're toggling a boolean value
    const currentStatus = listing.disabled === true;
    listing.disabled = !currentStatus;
    await listing.save();

    // Log the listing status toggle
    adminLogController.logAdminAction(
      req, 
      res, 
      req.session.user._id, 
      'listing_toggle_status',
      listing._id,
      { 
        listing: {
          title: listing.title,
          brand: listing.brand
        },
        seller: {
          _id: listing.seller._id,
          email: listing.seller.email
        },
        status: {
          before: originalStatus,
          after: listing.disabled
        }
      }
    );

    res.json({ 
      message: 'Listing status toggled successfully',
      disabled: listing.disabled
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get admin dashboard stats (admin only)
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const totalAdmins = await User.countDocuments({ isAdmin: true });
    const totalListings = await PhoneListing.countDocuments();
    const activeListings = await PhoneListing.countDocuments({ disabled: false });
    const recentUsers = await User.find({ isAdmin: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstname lastname createdAt');

    res.json({
      totalUsers,
      totalAdmins,
      totalListings,
      activeListings,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get admin notifications
router.get('/notifications', isAdmin, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({ 
      type: { $in: ['ADMIN_ALERT', 'ORDER_PLACED'] }
    })
    .sort({ createdAt: -1 })
    .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (admin only)
router.get('/orders', isAdmin, async (req, res) => {
  try {
    const Order = require('../models/order');
    const User = require('../models/User');
    // Find all orders and populate with user information
    const orders = await Order.find()
      .populate('userId', 'firstname lastname email')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error loading orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin only)
router.patch('/orders/:orderId/status', isAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const Order = require('../models/order');
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Get original order for logging
    const originalOrder = await Order.findById(orderId)
      .populate('userId', 'firstname lastname email');
    
    if (!originalOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Original status for logging
    const originalStatus = originalOrder.status;
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('userId', 'firstname lastname email');
    
    // Log the order status update
    adminLogController.logAdminAction(
      req, 
      res, 
      req.session.user._id, 
      'order_update_status',
      orderId,
      { 
        order: {
          _id: order._id,
          totalAmount: order.totalAmount,
          itemCount: order.items ? order.items.length : 0
        },
        user: order.userId ? {
          _id: order.userId._id,
          email: order.userId.email
        } : null,
        status: {
          before: originalStatus,
          after: status
        }
      }
    );
    
    // Create notification for the user if order is delivered
    if (status === 'delivered') {
      const Notification = require('../models/Notification');
      
      await Notification.create({
        user: order.userId._id,
        type: 'ORDER_DELIVERED',
        content: `Your order has been delivered!`,
        relatedItem: order._id,
        itemModel: 'Order'
      });
    }
    
    res.json({ 
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Export orders as CSV or JSON (admin only)
router.get('/orders/export/:format', isAdmin, async (req, res) => {
  try {
    const { format } = req.params;
    
    if (format !== 'csv' && format !== 'json') {
      return res.status(400).json({ message: 'Format must be either csv or json' });
    }
    
    const Order = require('../models/order');
    
    // Get all orders with user info
    const orders = await Order.find()
      .populate('userId', 'firstname lastname email')
      .sort({ createdAt: -1 });
    
    // Log the export operation
    adminLogController.logAdminAction(
      req, 
      res, 
      req.session.user._id, 
      'export_orders',
      null,
      { 
        format: format,
        count: orders.length
      }
    );
      
    if (format === 'json') {
      // Return JSON format
      return res.json(orders);
    } else {
      // CSV format
      const csv = [
        'Order ID,Date,Buyer Name,Buyer Email,Items,Quantity,Total,Status'
      ];
      
      orders.forEach(order => {
        const buyer = order.userId 
          ? `${order.userId.firstname} ${order.userId.lastname}`
          : 'Unknown User';
        
        const buyerEmail = order.userId ? order.userId.email : 'Unknown';
        const date = new Date(order.createdAt).toLocaleDateString();
        
        // For each item in the order, create a row
        if (order.items && order.items.length > 0) {
          order.items.forEach(item => {
            csv.push(
              `${order._id},${date},"${buyer}","${buyerEmail}","${item.title}",${item.quantity},$${order.totalAmount.toFixed(2)},${order.status}`
            );
          });
        } else {
          // If no items, still create a row
          csv.push(
            `${order._id},${date},"${buyer}","${buyerEmail}","No items",0,$${order.totalAmount.toFixed(2)},${order.status}`
          );
        }
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
      return res.status(200).send(csv.join('\n'));
    }
  } catch (error) {
    console.error('Error exporting orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.patch('/notifications/:notificationId/read', isAdmin, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Cascades user deletion: removes all listings and reviews
 */
async function cascadeUserDelete(userId) {
  try {
    // Delete all listings where user is the seller
    const deleteListingsResult = await PhoneListing.deleteMany({ seller: userId });
    
    // Remove all reviews where user is the reviewer
    const removeReviewsResult = await PhoneListing.updateMany(
      { 'reviews.reviewer': userId },
      { $pull: { reviews: { reviewer: userId } } }
    );
    
    console.log(`Cascaded deletion for user ${userId}:`);
    console.log(`- Deleted ${deleteListingsResult.deletedCount} listings`);
    console.log(`- Removed reviews from ${removeReviewsResult.modifiedCount} listings`);
    
    return {
      deletedListings: deleteListingsResult.deletedCount,
      modifiedListings: removeReviewsResult.modifiedCount
    };
  } catch (error) {
    console.error(`Error in cascadeUserDelete: ${error.message}`);
    throw error;
  }
}

/**
 * Cascades user disable: disables all listings and hides all reviews
 */
async function cascadeUserDisable(userId) {
  try {
    // Disable all listings where user is the seller
    const listingResult = await PhoneListing.updateMany(
      { seller: userId },
      { disabled: true }
    );
    
    // Find all listings that have reviews by this user
    const listingsWithUserReviews = await PhoneListing.find({ 
      'reviews.reviewer': userId 
    });
    
    // Update each review by this user in each listing
    let reviewsUpdated = 0;
    
    for (const listing of listingsWithUserReviews) {
      // Find and update each review by this user in this listing
      let modified = false;
      
      for (let i = 0; i < listing.reviews.length; i++) {
        if (listing.reviews[i].reviewer.toString() === userId.toString()) {
          listing.reviews[i].hidden = true;
          modified = true;
          reviewsUpdated++;
        }
      }
      
      // Save the listing if any reviews were modified
      if (modified) {
        await listing.save();
      }
    }
    
    console.log(`Cascaded disable for user ${userId}: disabled ${listingResult.modifiedCount} listings, hid ${reviewsUpdated} reviews`);
    
    // Return the counts as an object
    return {
      disabledListings: listingResult.modifiedCount,
      hiddenReviews: reviewsUpdated,
      listingsWithReviews: listingsWithUserReviews.length
    };
  } catch (error) {
    console.error(`Error in cascadeUserDisable: ${error.message}`);
    throw error;
  }
}

// Cascade user enable: re-enables listings and unhides reviews
async function cascadeUserEnable(userId) {
  try {
    // Re-enable all listings where user is the seller
    const listingResult = await PhoneListing.updateMany(
      { seller: userId },
      { disabled: false }
    );
    
    // Find all listings that have reviews by this user
    const listingsWithUserReviews = await PhoneListing.find({ 
      'reviews.reviewer': userId 
    });
    
    // Update each review by this user in each listing
    let reviewsUpdated = 0;
    
    for (const listing of listingsWithUserReviews) {
      let modified = false;
      
      for (let i = 0; i < listing.reviews.length; i++) {
        if (listing.reviews[i].reviewer.toString() === userId.toString()) {
          listing.reviews[i].hidden = false;
          modified = true;
          reviewsUpdated++;
        }
      }
      
      // Save the listing if any reviews were modified
      if (modified) {
        await listing.save();
      }
    }
    
    console.log(`Cascaded enable for user ${userId}: enabled ${listingResult.modifiedCount} listings, unhid ${reviewsUpdated} reviews`);
    
    // Return the counts as an object
    return {
      enabledListings: listingResult.modifiedCount,
      unhiddenReviews: reviewsUpdated,
      listingsWithReviews: listingsWithUserReviews.length
    };
  } catch (error) {
    console.error(`Error in cascadeUserEnable: ${error.message}`);
    throw error;
  }
}

module.exports = router;