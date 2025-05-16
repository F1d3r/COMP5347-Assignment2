const mongoose = require('mongoose');

// MongoDB connection URI.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/OldPhoneDeals';
console.log("URI:", MONGODB_URI);

// Connect to MongoDB with URI
module.exports.connectDB = async function(){
  mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
}