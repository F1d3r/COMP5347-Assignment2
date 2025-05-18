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
    // Calculate average rating
    if (phone.reviews && phone.reviews.length > 0) {
      const ratings = phone.reviews.map(review => review.rating);
      phone.avgRating = parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2));
    } else {
      phone.avgRating = 0;
    }
  }
  
  return phone;
};

// Find the 5 phones with highest rating.
phoneListingSchema.statics.getBestSeller = async function() {
  const topPhones = await this.aggregate([
    { 
      $match: {
        disabled: false,
        stock: { $gt: 0 },
        reviews: { $exists: true },
        $expr: { $gte: [{ $size: "$reviews" }, 2] }
      }
    },
    { 
      $addFields: {
        avgRating: { $round: [{ $avg: "$reviews.rating" }, 2] }
      }
    },
    { $sort: { avgRating: -1 } },
    { $limit: 5 }
  ]);
  
  return topPhones;
};

// Find the 5 phones with lowest stock.
phoneListingSchema.statics.getSoldOutSoon = async function() {
  const soldOutSoonPhones = await this.aggregate([
    { 
      $match: { 
        disabled: false,
        stock: { $gt: 0 }
      }
    },
    { $sort: { stock: 1 } },
    { $limit: 5 }
  ]);

  return soldOutSoonPhones;
};

// Static function used to find the phone by key words search.
phoneListingSchema.statics.findPhones = function(keyword, brand) {
  const regex = new RegExp(keyword, 'i');
  
  if (brand === 'All') {
    return this.find({'title': {$regex: regex}})
      .sort({'price': 1});
  } else {
    return this.find({'title': {$regex: regex}, 'brand': brand})
      .sort({'price': 1});
  }
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