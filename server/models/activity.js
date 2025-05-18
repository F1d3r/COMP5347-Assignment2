// Define login model.

const mongoose = require("mongoose");
const ActivitySchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activity: {type: String, enum: ['login','logout','addtocart','purchase'], required: true},
    timestamp: { type: Date, default: Date.now }
});

// Export the model
const Activity = mongoose.model('Activity', ActivitySchema, 'activity')
module.exports = Activity;