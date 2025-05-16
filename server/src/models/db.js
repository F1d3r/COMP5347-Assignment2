const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');


// Models to initialize.
// const User = require('./user');
const {Phone} = require('./phone');

// Default password hashing config.
require('dotenv').config();
const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
const defaultPassword = process.env.DEFAULT_PASSWORD || 'Password123!'; 
// MongoDB connection URI.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/OldPhoneDeals';

// JSON File path.
// const user_path = path.join(process.cwd(), '/Dataset/userlist.json');
const phone_path = path.join(process.cwd(), '../Dataset/phonelisting.json');


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
    // const userCount = await User.countDocuments();
    const phoneCount = await Phone.countDocuments();
    // Drop the collection if already exists.
    if (phoneCount > 0) { // userCount > 0 || phoneCount > 0
      console.log('Database already contains data. Dropping collections...');
      // await mongoose.connection.db.dropCollection('user');
      await mongoose.connection.db.dropCollection('phone');
      console.log('Collections dropped');
    }
    
    // Load data from JSON files
    console.log('Loading data from JSON files...');
    let phoneListingsData; // phoneListingsData, usersData
    
    try {
      // usersData = JSON.parse(fs.readFileSync(path.join(user_path), 'utf8'));
      phoneListingsData = JSON.parse(fs.readFileSync(phone_path), 'utf8');
    } catch (error) {
      console.error('Error reading JSON files:', error.message);
      console.log('Make sure the JSON files (phonelisting.json and userlist.json) exist in the dataset directory.');
      process.exit(1);
    }
    
    // // Hash a default password for all users
    // console.log('Default password: ' + defaultPassword);
    // console.log('Creating users with hashed passwords...');
    // const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
    // console.log('Default hash: '+ hashedPassword);
    // // Process and insert users
    // const processedUsers = usersData.map(user => {
    //   // Convert string IDs to ObjectIDs if necessary
    //   let userId = user._id;
    //   if (typeof userId === 'object' && userId.$oid) {
    //     userId = new mongoose.Types.ObjectId(userId.$oid);
    //   }
      
    //   return {
    //     _id: userId,
    //     firstname: user.firstname,
    //     lastname: user.lastname,
    //     email: user.email,
    //     password: hashedPassword,
    //     isVerified: true, // For initial data, consider users already verified
    //     verifyToken: null
    //   };
    // });

    // TODO: Add the registration date for all users.
    
    // await User.insertMany(processedUsers);
    // console.log(`${processedUsers.length} users inserted`);
    
    // Process and insert phone listings
    console.log('Inserting phone listings...');
    const processedListings = phoneListingsData.map(listing => {
      // Map brand names to image files
      const imageFileName = `${listing.brand}.jpeg`;
      const imagePath = `/assets/images/${imageFileName}`;
      
      // Process reviews
      const processedReviews = (listing.reviews || []).map(review => {
        let reviewerId = review.reviewer;
        if (typeof reviewerId === 'string') {
          reviewerId = new mongoose.Types.ObjectId(reviewerId);
        }
        
        return {
          reviewer: reviewerId,
          rating: review.rating,
          comment: review.comment,
          hidden: review.hidden ? true : false
        };
      });
      
      // Process seller ID
      let sellerId = listing.seller;
      if (typeof sellerId === 'string') {
        sellerId = new mongoose.Types.ObjectId(sellerId);
      }
      
      return {
        title: listing.title,
        brand: listing.brand,
        image: imagePath,
        stock: listing.stock,
        seller: sellerId,
        price: listing.price,
        reviews: processedReviews,
        disabled: listing.disabled ? true : false
      };
    });
    
    await Phone.insertMany(processedListings);
    console.log(`${processedListings.length} phone listings inserted`);
    
    // // Create admin user if it doesn't exist
    // console.log('Creating admin user...');
    // const adminEmail = 'admin@oldphonedeals.com';
    // const adminPassword = await bcrypt.hash('Admin123!', saltRounds);
    
    // await User.findOneAndUpdate(
    //   { email: adminEmail },
    //   {
    //     firstname: 'Admin',
    //     lastname: 'User',
    //     email: adminEmail,
    //     password: adminPassword,
    //     isAdmin: true,
    //     isVerified: true
    //   },
    //   { upsert: true, new: true }
    // );
    
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