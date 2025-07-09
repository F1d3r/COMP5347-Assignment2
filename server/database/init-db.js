const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Models to initialize
const User = require('../models/User');
const PhoneListing = require('../models/PhoneListing');

// Default password hashing config.
require('dotenv').config();
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10;
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'Password123!';
const ADMIN_EMAIL = 'tut07g04.comp5347@gmail.com';
const ADMIN_DEFAULT_PASSWORD = 'Admin123!';
// MongoDB connection URI.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/OldPhoneDeals';
console.log("URI: ", MONGODB_URI);

// JSON File path.
const user_path = path.join(process.cwd(), 'database/userlist_demo.json');
const phone_path = path.join(process.cwd(), 'database/phonelisting_demo.json');

// Initialize the MongoDB with server's local json file.
initializeDatabase = async function() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Check if collections exist and have data
    const userCount = await User.countDocuments();
    const phoneCount = await PhoneListing.countDocuments();
    
    // Drop the collection if already exists.
    if (userCount > 0 || phoneCount > 0) {
      console.log('Database already contains data. Dropping collections...');
      await mongoose.connection.db.dropCollection('users');
      await mongoose.connection.db.dropCollection('phonelistings');
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
    console.log('Default password: ' + DEFAULT_PASSWORD);
    console.log('Creating users with hashed passwords...');
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    console.log('Default hash: '+ hashedPassword);
    
    // Create a map to store user IDs
    const userIdMap = new Map();
    
    // Process and insert users - Keep track of user IDs for linking
    const processedUsers = usersData.map(user => {
      // Generate a new ObjectId for each user
      const userId = new mongoose.Types.ObjectId();
      
      // Store this ID with email as key for later reference
      if (user.email) {
        userIdMap.set(user.email, userId);
      }
      
      return {
        _id: userId,
        firstname: user.firstname || 'Unknown',
        lastname: user.lastname || 'Unknown',
        email: user.email,
        password: hashedPassword,
        isVerified: true,
        registDate: new Date(),
        isAdmin: false,
        disabled: false
      };
    });
    
    // Insert users
    await User.insertMany(processedUsers);
    console.log(`${processedUsers.length} users inserted`);

    // Create admin user
    console.log('Creating admin user...');
    const adminEmail = ADMIN_EMAIL;
    const adminPassword = await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, SALT_ROUNDS);
    const adminId = new mongoose.Types.ObjectId();
    
    const admin = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        _id: adminId,
        firstname: 'Admin',
        lastname: 'User',
        email: adminEmail,
        password: adminPassword,
        isAdmin: true,
        isVerified: true,
        registDate: new Date(),
        disabled: false
      },
      { upsert: true, new: true }
    );
    
    // Add admin to the ID map
    userIdMap.set(adminEmail, admin._id);
    
    // Create a pool of valid seller IDs to use if original seller not found
    const validSellerIds = Array.from(userIdMap.values());
    

    // Process phone listings
    console.log('Inserting phones...');
    const processedPhones = await Promise.all(phoneListingsData.map(async(phone) => {
      // Map brand names to image files
      const imageFileName = `${phone.brand}.jpeg`;
      const imagePath = `/assets/images/${imageFileName}`;
      
      // Find a valid seller ID
      let sellerId;
      
      // First, try to find a matching user by email if provided in phone data
      if (phone.sellerEmail && userIdMap.has(phone.sellerEmail)) {
        sellerId = userIdMap.get(phone.sellerEmail);
      } 
      // If no email match, use a random valid seller
      else {
        const randomIndex = Math.floor(Math.random() * validSellerIds.length);
        sellerId = validSellerIds[randomIndex];
      }
      
      
      // Process reviews
      const processedReviews = (phone.reviews || []).map(review => {
        // Try to find a valid reviewer ID
        let reviewerId;
        
        // If reviewer email available, use that
        if (review.reviewerEmail && userIdMap.has(review.reviewerEmail)) {
          reviewerId = userIdMap.get(review.reviewerEmail);
        } 
        // Otherwise use a random valid user
        else {
          const randomIndex = Math.floor(Math.random() * validSellerIds.length);
          reviewerId = validSellerIds[randomIndex];
        }
        
        return {
          reviewer: reviewerId,
          rating: review.rating,
          comment: review.comment,
          hidden: review.hidden ? true : false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });
      
      return {
        title: phone.title,
        brand: phone.brand,
        image: imagePath,
        stock: phone.stock,
        seller: sellerId,
        price: phone.price,
        reviews: processedReviews,
        disabled: phone.disabled ? true : false
      };
    }));
    
    await PhoneListing.insertMany(processedPhones);
    console.log(`${processedPhones.length} phones inserted`);
    
    console.log('\nDatabase initialization completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin:');
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_DEFAULT_PASSWORD}`);
    console.log('\nUsers:');
    console.log(`  Default password for all imported users: ${DEFAULT_PASSWORD}`);
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  }
}

initializeDatabase();