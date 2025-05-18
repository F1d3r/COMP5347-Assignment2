const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// Models to initialize.
const User = require('../models/User');
const Phone = require('../models/phone');
const Activity = require('../models/activity');

// Default password hashing config.
require('dotenv').config();
const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
const defaultPassword = process.env.DEFAULT_PASSWORD || 'Password123!'; 
// MongoDB connection URI.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/OldPhoneDeals';

// JSON File path.
const user_path = path.join(process.cwd(), '/Dataset/userlist.json');
const phone_path = path.join(process.cwd(), '/Dataset/phonelisting.json');

// Connect to MongoDB with URI
module.exports.connectDB = async function(){
  mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
}

// Initialize the MongoDB with server's local json file.
module.exports.initializeDatabase = async function() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Check if collections exist and have data
    const userCount = await User.countDocuments();
    const phoneCount = await Phone.countDocuments();
    const activityCount = await Activity.countDocuments();
    // Drop the collection if already exists.
    if (userCount > 0 || phoneCount > 0) {
      console.log('Database already contains data. Dropping collections...');
      await mongoose.connection.db.dropCollection('user');
      await mongoose.connection.db.dropCollection('phone');
      await mongoose.connection.db.dropCollection('activity');
      console.log('Collections dropped');
    }

    // Load data from JSON files
    console.log('Loading data from JSON files...');
    let phoneListingsData, usersData;
    try {
      usersData = JSON.parse(fs.readFileSync(path.join(user_path), 'utf8'));
      phoneListingsData = JSON.parse(fs.readFileSync(phone_path, 'utf8'));
    } catch (error) {
      console.error('Error reading JSON files:', error.message);
      console.log('Make sure the JSON files (phonelisting.json and userlist.json) exist in the dataset directory.');
      process.exit(1);
    }

    // Hash a default password for all users
    console.log('Default password: ' + defaultPassword);
    console.log('Creating users with hashed passwords...');
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
    console.log('Default hash: '+ hashedPassword);
    
    // Create a map of valid user IDs for fast lookup
    const userMap = new Map();
    
    // Process and insert users
    const processedUsers = usersData.map(user => {
      // Convert string IDs to ObjectIDs if necessary
      let userId = user._id;
      if (typeof userId === 'object' && userId.$oid) {
        userId = new mongoose.Types.ObjectId(userId.$oid);
      } else if (typeof userId === 'string') {
        userId = new mongoose.Types.ObjectId(userId);
      }
      
      // Add to our valid user map for reference checking
      userMap.set(userId.toString(), true);
      
      return {
        _id: userId,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        password: hashedPassword,
        isVerified: true, // For initial data, consider users already verified
        verifyToken: null,
      };
    });
    
    // Insert users
    await User.insertMany(processedUsers);
    console.log(`${processedUsers.length} users inserted`);

    // Create admin user if it doesn't exist
    console.log('Creating admin user...');
    const adminEmail = 'tut07g04.comp5347@gmail.com';
    const adminPassword = await bcrypt.hash('Admin123!', saltRounds);
    
    admin = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        firstname: 'Admin',
        lastname: 'User',
        email: adminEmail,
        password: adminPassword,
        isAdmin: true,
        isVerified: true
      },
      { upsert: true, new: true }
    );
    
    // Process and insert phone listings
    console.log('Inserting phone listings...');
    const processedListings = [];
    let skippedListings = 0;
    
    for (const listing of phoneListingsData) {
      // Map brand names to image files
      const imageFileName = `${listing.brand}.jpeg`;
      const imagePath = `/assets/images/${imageFileName}`;
      
      // Process seller ID
      let sellerId = listing.seller;
      if (typeof sellerId === 'object' && sellerId.$oid) {
        sellerId = sellerId.$oid;
      }
      
      // Skip listing if seller doesn't exist
      if (!userMap.has(sellerId)) {
        console.log(`Skipping listing "${listing.title}" - seller ${sellerId} not found`);
        skippedListings++;
        continue;
      }
      
      // Process valid reviews
      const validReviews = [];
      let skippedReviews = 0;
      
      if (listing.reviews && listing.reviews.length > 0) {
        for (const review of listing.reviews) {
          let reviewerId = review.reviewer;
          if (typeof reviewerId === 'object' && reviewerId.$oid) {
            reviewerId = reviewerId.$oid;
          }
          
          // Skip review if reviewer doesn't exist
          if (!userMap.has(reviewerId)) {
            console.log(`Skipping review for listing "${listing.title}" - reviewer ${reviewerId} not found`);
            skippedReviews++;
            continue;
          }
          
          // Add valid review
          validReviews.push({
            reviewer: new mongoose.Types.ObjectId(reviewerId),
            rating: review.rating,
            comment: review.comment,
            hidden: review.hidden ? true : false
          });
        }
      }
      
      // Create listing with valid data
      processedListings.push({
        title: listing.title,
        brand: listing.brand,
        image: imagePath,
        stock: listing.stock || 0,
        seller: new mongoose.Types.ObjectId(sellerId),
        price: listing.price || 0,
        reviews: validReviews,
        disabled: listing.disabled ? true : false
      });
    }
    
    await Phone.insertMany(processedListings);
    console.log(`${processedListings.length} phone listings inserted`);
    console.log(`Skipped ${skippedListings} listings with invalid sellers`);
    
    // Create activity collection
    let adminId = admin._id;
    if (typeof adminId === 'object' && adminId.$oid) {
      adminId = new mongoose.Types.ObjectId(adminId.$oid);
    }
    const activity1 = new Activity({
      _id: new mongoose.Types.ObjectId(),
      userId: adminId,
      activity: 'login'
    });
    const activity2 = new Activity({
      _id: new mongoose.Types.ObjectId(),
      userId: adminId,
      activity: 'logout'
    });
    await activity1.save();
    await activity2.save();
    console.log("Activity collection created.");
    
    // Print summary
    console.log('\nDatabase initialization completed successfully!');
    console.log('\nAdmin login credentials:');
    console.log('  Email: tut07g04.comp5347@gmail.com');
    console.log('  Password: Admin123!');
    console.log('\nUsers:');
    console.log('  Default password for all users: Password123!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  }
}