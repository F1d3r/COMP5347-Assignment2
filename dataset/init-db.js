/**
 * Database Initialization Script for OldPhoneDeals
 * 
 * This script initializes the MongoDB database with:
 * - User data (with encrypted passwords)
 * - Phone listings (with updated image URLs)
 * - Admin user creation
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/oldphonedeals';

// Connect to MongoDB
async function initializeDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Define schemas
    console.log('Setting up schemas...');
    
    // User schema (updated to match your model)
    const userSchema = new mongoose.Schema({
      firstname: {
        type: String,
        required: true,
        trim: true
      },
      lastname: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
      },
      password: {
        type: String,
        required: true
      },
      isAdmin: {
        type: Boolean,
        default: false
      }
    }, {
      timestamps: true
    });
    
    // Review schema
    const reviewSchema = new mongoose.Schema({
      reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      listing: { type: mongoose.Schema.Types.ObjectId, ref: 'PhoneListing' },
      rating: Number,
      comment: String,
      hidden: Boolean
    });
    
    // Phone listing schema
    const phoneListingSchema = new mongoose.Schema({
      title: String,
      brand: String,
      image: String,
      stock: Number,
      seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      price: Number,
      reviews: [reviewSchema],
      disabled: Boolean
    });
    
    // Create models
    const User = mongoose.model('User', userSchema);
    const PhoneListing = mongoose.model('PhoneListing', phoneListingSchema);
    const Review = mongoose.model('Review', reviewSchema);

    // Check if collections exist and have data
    const userCount = await User.countDocuments();
    const phoneCount = await PhoneListing.countDocuments();
    
    if (userCount > 0 || phoneCount > 0) {
      console.log('Database already contains data. Dropping collections...');
      try {
        await mongoose.connection.db.dropCollection('users');
      } catch (err) {
        console.log('Users collection does not exist');
      }
      try {
        await mongoose.connection.db.dropCollection('phonelistings');
      } catch (err) {
        console.log('PhoneListings collection does not exist');
      }
      console.log('Collections dropped');
    }
    
    // Load data from JSON files
    console.log('Loading data from JSON files...');
    let phoneListingsData = [];
    let usersData = [];
    
    try {
      if (fs.existsSync(path.join(__dirname, 'phonelisting.json'))) {
        phoneListingsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'phonelisting.json'), 'utf8'));
      }
      if (fs.existsSync(path.join(__dirname, 'userlist.json'))) {
        usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'userlist.json'), 'utf8'));
      }
    } catch (error) {
      console.error('Error reading JSON files:', error.message);
      console.log('JSON files not found or invalid. Continuing with admin user creation only.');
    }
    
    // Hash a default password for all users
    console.log('Creating users with hashed passwords...');
    const saltRounds = 10;
    const defaultPassword = 'Password123!'; // Strong password with capital, lowercase, number, symbol
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
    
    // Process and insert users if data exists
    if (usersData.length > 0) {
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
          isAdmin: false // Regular users are not admins
        };
      });
      
      await User.insertMany(processedUsers);
      console.log(`${processedUsers.length} users inserted`);
    }
    
    // Process and insert phone listings if data exists
    if (phoneListingsData.length > 0) {
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
      
      await PhoneListing.insertMany(processedListings);
      console.log(`${processedListings.length} phone listings inserted`);
    }
    
    console.log('Creating admin user...');
    const adminEmail = 'admin@oldphonedeals.com';
    const adminPassword = await bcrypt.hash('Admin123!', saltRounds);
    
    // First, remove any existing admin user
    await User.deleteMany({ email: adminEmail });
    
    // Create new admin user with correct schema
    const adminUser = new User({
      firstname: 'Admin',
      lastname: 'User',
      email: adminEmail,
      password: adminPassword,
      isAdmin: true // This is the important field!
    });
    
    await adminUser.save();
    console.log('Admin user created successfully!');
    
    // Verify admin user was created correctly
    const verifyAdmin = await User.findOne({ email: adminEmail });
    console.log('Admin user verification:', {
      email: verifyAdmin.email,
      isAdmin: verifyAdmin.isAdmin,
      firstname: verifyAdmin.firstname,
      lastname: verifyAdmin.lastname
    });
    
    console.log('\nDatabase initialization completed successfully!');
    console.log('\nAdmin login credentials:');
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

// Run the initialization
initializeDatabase();