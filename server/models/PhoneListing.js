const mongoose = require('mongoose');

// Review Schema (nested in PhoneListing)
const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  hidden: { type: Boolean, default: false }
}, {
  timestamps: true
});

const phoneListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  reviews: [reviewSchema],
  disabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Get the complete information for certain phone.
// Including the seller info, and the reviews info.
phoneListingSchema.statics.getPhone = async function(_id) {
  const phoneId = new mongoose.Types.ObjectId(_id);
  // Since reviews are embedded, we just need to populate seller and reviewer
  const phone = await this.findById(phoneId)
    .populate('seller', '-password')
    .populate('reviews.reviewer', '-password')
    .lean();

  if (phone) {
    // Filter out reviews from hidden/disabled users and hidden reviews
    if (phone.reviews && phone.reviews.length > 0) {
      phone.reviews = phone.reviews.filter(review => 
        !review.hidden && review.reviewer && !review.reviewer.disabled
      );
      
      // Calculate average rating based on visible reviews only
      if (phone.reviews.length > 0) {
        const ratings = phone.reviews.map(review => review.rating);
        phone.avgRating = parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2));
      } else {
        phone.avgRating = 0;
      }
    } else {
      phone.avgRating = 0;
    }
  }
  
  return phone;
};

// Find the 5 phones with highest rating.
phoneListingSchema.statics.getBestSeller = async function() {
  // First get phones that meet base criteria
  const phones = await this.find({
    disabled: false,
    stock: { $gt: 0 },
    reviews: { $exists: true },
    'reviews.1': { $exists: true } // At least 2 reviews
  })
  .populate('reviews.reviewer', '-password')
  .lean();
  
  // Process phones to filter out hidden reviews and recalculate avg ratings
  const processedPhones = phones.map(phone => {
    // Filter out hidden reviews and reviews from disabled users
    const visibleReviews = phone.reviews.filter(review => 
      !review.hidden && review.reviewer && !review.reviewer.disabled
    );
    
    // Calculate avgRating based on visible reviews
    if (visibleReviews.length > 0) {
      const ratings = visibleReviews.map(review => review.rating);
      phone.avgRating = parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2));
    } else {
      phone.avgRating = 0;
    }
    
    // Save the filtered reviews back
    phone.reviews = visibleReviews;
    return phone;
  });
  
  // Filter to phones that still have at least 2 reviews after filtering
  const validPhones = processedPhones.filter(phone => phone.reviews.length >= 2);
  
  // Sort by avgRating and take top 5
  const topPhones = validPhones
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 5);
  
  return topPhones;
};

// Find the 5 phones with lowest stock.
phoneListingSchema.statics.getSoldOutSoon = async function() {
  // Get phones with stock > 0 and not disabled
  const phones = await this.find({
    disabled: false,
    stock: { $gt: 0 }
  })
  .populate('reviews.reviewer', '-password')
  .lean();
  
  // Process phones to filter hidden reviews and recalculate ratings
  const processedPhones = phones.map(phone => {
    // Filter out hidden reviews and reviews from disabled users
    if (phone.reviews && phone.reviews.length > 0) {
      const visibleReviews = phone.reviews.filter(review => 
        !review.hidden && review.reviewer && !review.reviewer.disabled
      );
      
      // Calculate avgRating based on visible reviews only
      if (visibleReviews.length > 0) {
        const ratings = visibleReviews.map(review => review.rating);
        phone.avgRating = parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2));
      } else {
        phone.avgRating = 0;
      }
      
      // Save the filtered reviews back
      phone.reviews = visibleReviews;
    } else {
      phone.avgRating = 0;
    }
    
    return phone;
  });
  
  // Sort by stock (ascending) and take top 5
  const soldOutSoonPhones = processedPhones
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);
  
  return soldOutSoonPhones;
};

// Static function used to find the phone by key words search.
phoneListingSchema.statics.findPhones = async function(keyword, brand) {
  const regex = new RegExp(keyword, 'i');
  let query;
  
  if (brand === 'All') {
    query = this.find({'title': {$regex: regex}});
  } else {
    query = this.find({'title': {$regex: regex}, 'brand': brand});
  }
  
  // Populate seller information
  const phones = await query
    .populate('seller', '-password')
    .sort({'price': 1})
    .lean();
  
  // Calculate average rating for each phone and filter out hidden reviews
  return phones.map(phone => {
    if (phone.reviews && phone.reviews.length > 0) {
      // Filter out reviews from hidden/disabled users and hidden reviews
      phone.reviews = phone.reviews.filter(review => 
        !review.hidden && review.reviewer && !review.reviewer.disabled
      );
      
      if (phone.reviews.length > 0) {
        const ratings = phone.reviews.map(review => review.rating);
        phone.avgRating = parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2));
      } else {
        phone.avgRating = 0;
      }
    } else {
      phone.avgRating = 0;
    }
    return phone;
  });
};

// Static function used to get all brands in the database.
phoneListingSchema.statics.getAllBrand = function() {
  return this.distinct('brand').sort();
};

// For backward compatibility with any code that might rely on getAllPhones
phoneListingSchema.statics.getAllPhones = function() {
  return this.find({}).exec();
};

const PhoneListing = mongoose.model('PhoneListing', phoneListingSchema);
module.exports = PhoneListing;