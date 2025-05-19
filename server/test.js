// Add this code to a temporary file and run it
const mongoose = require('mongoose');
const User = require('./models/User');
const PhoneListing = require('./models/PhoneListing');

async function checkCollections() {
  try {
    await mongoose.connect('mongodb://localhost:27017/OldPhoneDeals');
    
    console.log("Collections used by models:");
    console.log("User model using collection:", User.collection.collectionName);
    console.log("PhoneListing model using collection:", PhoneListing.collection.collectionName);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

checkCollections();
