const mongoose = require('mongoose');
 
// Review Schema
const ReviewSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Review', ReviewSchema);