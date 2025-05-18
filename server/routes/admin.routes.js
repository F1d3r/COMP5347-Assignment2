const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PhoneListing = require('../models/PhoneListing');
const bcrypt = require('bcrypt');

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
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit a user (admin only) - NEW ENDPOINT
router.patch('/users/:userId', isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstname, lastname, email } = req.body;

    // Validate input
    if (!firstname || !lastname || !email) {
      return res.status(400).json({ message: 'First name, last name, and email are required' });
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

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a user (admin only)
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

    user.isAdmin = !user.isAdmin;
    await user.save();

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

// Edit a listing (admin only) - NEW ENDPOINT
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

    if (!updatedListing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

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

    const listing = await PhoneListing.findByIdAndDelete(listingId);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

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
    const listing = await PhoneListing.findById(listingId);
    
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
    const listing = await PhoneListing.findById(listingId);
    
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
    listing.reviews[reviewIndex].hidden = !currentVisibility;
    
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
    
    // Toggle disabled status
    user.disabled = !user.disabled;
    await user.save();
    
    let cascadeResult = null;
    
    // Update related data
    if (user.disabled) {
      // If user is disabled, disable their listings and hide their reviews
      cascadeResult = await cascadeUserDisable(userId);
      
      res.json({ 
        message: `User disabled successfully. Also disabled ${cascadeResult.disabledListings} listings and hid ${cascadeResult.hiddenReviews} reviews in ${cascadeResult.listingsWithReviews} listings.`,
        disabled: true
      });
    } else {
      // If user is re-enabled, re-enable their listings and unhide their reviews
      cascadeResult = await cascadeUserEnable(userId);
      
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
    const listing = await PhoneListing.findById(req.params.listingId);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Ensure we're toggling a boolean value
    const currentStatus = listing.disabled === true;
    listing.disabled = !currentStatus;
    await listing.save();

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