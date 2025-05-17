/**
 * Database Initialization Script with Data Integrity Checks
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// Load environment variables
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/oldphonedeals';

async function initializeDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Define schemas
    const reviewSchema = new mongoose.Schema({
      reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String },
      hidden: { type: Boolean, default: false }
    }, { timestamps: true });
    
    const phoneListingSchema = new mongoose.Schema({
      title: { type: String, required: true, trim: true },
      brand: { type: String, required: true, trim: true },
      image: { type: String },
      stock: { type: Number, default: 0 },
      seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      price: { type: Number, default: 0 },
      reviews: [reviewSchema],
      disabled: { type: Boolean, default: false }
    }, { timestamps: true });
    
    const userSchema = new mongoose.Schema({
      firstname: { type: String, required: true, trim: true },
      lastname: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      password: { type: String, required: true },
      isAdmin: { type: Boolean, default: false },
      disabled: {
          type: Boolean,
          default: false
        }
      }, {
        timestamps: true
      });

    // Create models
    const User = mongoose.model('User', userSchema);
    const PhoneListing = mongoose.model('PhoneListing', phoneListingSchema);
    
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await PhoneListing.deleteMany({});
    
    // Generate a strong hashed password for all users
    console.log('Generating secure password...');
    const saltRounds = 10;
    const defaultPassword = 'Password123!'; // Strong password with capital, lowercase, number, symbol
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
    
    // Load user data and insert users first
    console.log('Processing users...');
    let usersData;
    try {
      usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'userlist.json'), 'utf8'));
    } catch (error) {
      console.error('Error reading userlist.json:', error.message);
      process.exit(1);
    }
    
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
        isAdmin: user.isAdmin || false,
        disabled: false
      };
    });
    
    // Create admin user if not exists
    const adminEmail = 'admin@oldphonedeals.com';
    if (!processedUsers.some(user => user.email === adminEmail)) {
      console.log('Creating admin user...');
      processedUsers.push({
        firstname: 'Admin',
        lastname: 'User',
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
        disabled: false
      });
    }
    
    await User.insertMany(processedUsers);
    console.log(`${processedUsers.length} users inserted`);
    
    // Load phone listing data
    console.log('Processing phone listings...');
    let phoneListingsData;
    try {
      phoneListingsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'phonelisting.json'), 'utf8'));
    } catch (error) {
      console.error('Error reading phonelisting.json:', error.message);
      process.exit(1);
    }
    
    // Process and insert phone listings
    const validListings = [];
    let skippedListings = 0;
    let skippedReviews = 0;
    
    for (const listing of phoneListingsData) {
      // Verify seller exists
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
      validListings.push({
        title: listing.title,
        brand: listing.brand,
        image: `/assets/images/${listing.brand}.jpeg`, // Use brand-based image path
        stock: listing.stock || 0,
        seller: new mongoose.Types.ObjectId(sellerId),
        price: listing.price || 0,
        reviews: validReviews,
        disabled: listing.disabled ? true : false
      });
    }
    
    await PhoneListing.insertMany(validListings);
    console.log(`${validListings.length} phone listings inserted`);
    console.log(`Skipped ${skippedListings} listings with invalid sellers`);
    console.log(`Skipped ${skippedReviews} reviews with invalid reviewers`);
    
    // Print summary
    console.log('\nDatabase initialization completed successfully!');
    console.log('\nAdmin login credentials:');
    console.log('  Email: admin@oldphonedeals.com');
    console.log('  Password: Password123!');
    console.log('\nUsers:');
    console.log('  Default password for all users: Password123!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  }
}

// Run the initialization
initializeDatabase();