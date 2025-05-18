// Define user model.
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    firstname: { type: String, default: 'Unknown' },
    lastname: { type: String, default: 'Unknown' },
    email: { type: String, required: true},
    password: { type: String, required: true},
    isVerified: { type: Boolean, default: false },
    registDate: { type: Date, default: Date.now },
    verifyToken: {type: String, defualt: null },
    isAdmin: {
        type: Boolean,
        default: false
      },
    disabled: {
    type: Boolean,
    default: false
    }},
    {
    timestamps: true
      });


    UserSchema.statics.createUser = async function(email, firstname, lastname, password, verifyToken, isAdmin = false, disabled = false) {
        // Check if user with this email already exists
        const existUser = await this.findOne({email});
        if(existUser){
            throw new Error("User already exists");
        }
    
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Invalid email format");
        }
    
        // Validate password (at least 8 characters with numbers and letters)
        if (password.length < 8) {
            throw new Error("Password must be at least 8 characters long");
        }
    
        // Create new user with all parameters
        const userID = new mongoose.Types.ObjectId();
        const newUser = new this({
            _id: userID,
            firstname: firstname || 'Unknown',
            lastname: lastname || 'Unknown',
            email,
            password,
            isVerified: false,
            verifyToken,
            isAdmin,
            disabled,
            registDate: new Date()
        });
    
        // Save and return the new user
        await newUser.save();
        return newUser;
    }

module.exports = mongoose.model('User', UserSchema);