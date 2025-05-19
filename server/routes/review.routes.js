const express = require('express');
const router = express.Router();
const PhoneListing = require('../models/PhoneListing'); // Assuming this is created by another team member

// Get reviews for a specific listing
router.get('/listing/:listingId', async (req, res) => {
  try {
    const listing = await PhoneListing.findById(req.params.listingId)
      .populate('reviews.reviewer', 'firstname lastname');
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Filter out hidden reviews unless viewing as admin, seller, or reviewer
    // This logic depends on the authentication system others are building
    const reviews = listing.reviews;
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a review to a listing
router.post('/listing/:listingId', async (req, res) => {
  try {
    const { rating, comment, userId } = req.body;
    
    if (!rating || !comment || !userId) {
      return res.status(400).json({ message: 'Rating, comment and userId are required' });
    }
    
    const listing = await PhoneListing.findById(req.params.listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Add review to listing
    listing.reviews.push({
      reviewer: userId,
      rating: rating,
      comment: comment,
      hidden: false
    });
    
    await listing.save();
    
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle hidden status of a review
router.patch('/toggle-visibility/:listingId/:reviewId', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const listing = await PhoneListing.findById(req.params.listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    const reviewIndex = listing.reviews.findIndex(
      review => review._id.toString() === req.params.reviewId
    );
    
    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Toggle the hidden status
    listing.reviews[reviewIndex].hidden = !listing.reviews[reviewIndex].hidden;
    await listing.save();
    
    res.json({ 
      message: 'Review visibility toggled successfully',
      hidden: listing.reviews[reviewIndex].hidden
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;