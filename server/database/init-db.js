const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');


// Models to initialize.
const User = require('../models/user');
const Phone = require('../models/phone');
const Activity = require('../models/activity');
const Review = require('../models/review')

// Default password hashing config.
require('dotenv').config();
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10;
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'Password123!';
const ADMIN_EMAIL = process.env.EMAIL_USER || 'tut07g04.comp5347@gmail.com';
const ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin123!';
// MongoDB connection URI.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/OldPhoneDeals';
console.log("URI: ", MONGODB_URI);

// JSON File path.
const user_path = path.join(process.cwd(), 'database/userlist.json');
const phone_path = path.join(process.cwd(), 'database/phonelisting.json');


// Initialize the MongoDB with server's local json file.
initializeDatabase = async function() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');


    // Check if collections exist and have data
    const userCount = await User.countDocuments();
    const phoneCount = await Phone.countDocuments();
    const activityCount = await Activity.countDocuments();
    const reviewCount = await Review.countDocuments();
    // Drop the collection if already exists.
    if (userCount > 0 || phoneCount > 0 
      || activityCount > 0 || reviewCount > 0) {
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
      phoneListingsData = JSON.parse(fs.readFileSync(phone_path), 'utf8');
    } catch (error) {
      console.error('Error reading JSON files:', error.message);
      console.log('Make sure the JSON files (phonelisting.json and userlist.json) exist in the dataset directory.');
      process.exit(1);
    }
    

    // Hash a default password for all users
    console.log('Default password: ' + DEFAULT_PASSWORD);
    console.log('Creating users with hashed passwords...');
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    console.log('Default hash: '+ hashedPassword);
    // Process and insert users
    const processedUsers = usersData.map(user => {
      // Convert string IDs to ObjectIDs if necessary
      let userId = user._id;
      if (typeof userId === 'object' && userId.$oid) {
        userId = new mongoose.Types.ObjectId(userId.$oid);
      }
      
      return {
        _id: userId,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        password: hashedPassword,
        isVerified: true, // For initial data, consider users already verified
      };
    });
    // Insert users.
    await User.insertMany(processedUsers);
    console.log(`${processedUsers.length} users inserted`);

    // Create admin user if it doesn't exist
    console.log('Creating admin user...');
    const adminEmail = ADMIN_EMAIL;
    const adminPassword = await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, SALT_ROUNDS);
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
    console.log('Inserting phones...');
    const processedPhones = await Promise.all(phoneListingsData.map(async(phone) => {
      // Map brand names to image files
      const imageFileName = `${phone.brand}.jpeg`;
      const imagePath = `/assets/images/${imageFileName}`;
      
      // Process reviews
      const processedReviewsId = await Promise.all((phone.reviews || []).map(async(review) => {
        // Convert string IDs to ObjectIDs if necessary
        let reviewerId = review.reviewer;
        if (typeof reviewerId === 'string') {
          reviewerId = new mongoose.Types.ObjectId(reviewerId);
        }
        const insertedReview = await Review.create({
          reviewer:reviewerId,
          rating: review.rating,
          comment: review.comment,
          hidden: review.hidden ? true : false
        })
        return insertedReview._id;
      }));
      console.log(`${processedReviewsId.length} reviews inserted`);
      
      // Process seller ID
      let sellerId = phone.seller;
      if (typeof sellerId === 'string') {
        sellerId = new mongoose.Types.ObjectId(sellerId);
      }
      
      return {
        title: phone.title,
        brand: phone.brand,
        image: imagePath,
        stock: phone.stock,
        seller: sellerId,
        price: phone.price,
        reviews: processedReviewsId,
        disabled: phone.disabled ? true : false
      };
    }));
    
    await Phone.insertMany(processedPhones);
    console.log(`${processedPhones.length} phones inserted`);
    
    // Create activity collection.
    let adminId = admin._id;
    if (typeof adminId === 'object' && adminId.$oid) {
      adminId = new mongoose.Types.ObjectId(adminId.$oid);
    }
    const activity1 = new Activity({
      _id: new mongoose.Types.ObjectId(),
      userId: adminId,
      activity: 'login'
    })
    const activity2 = new Activity({
      _id: new mongoose.Types.ObjectId(),
      userId: adminId,
      activity: 'logout'
    })
    await activity1.save();
    await activity2.save();
    console.log("Activity collection created.");


    
    console.log('\nDatabase initialization completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin:');
    console.log('  Email: admin@oldphonedeals.com');
    console.log('  Password: Admin123!');
    console.log('\nUsers:');
    console.log('  Default password for all imported users: Password123!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  }
}


initializeDatabase();