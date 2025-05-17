const mongoose = require('mongoose');
 
// Review schema
const ReviewSchema = new mongoose.Schema({
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    hidden: Boolean
});


// Exports the model.
const Review = mongoose.model('Review', ReviewSchema, 'review');
module.exports = Review;