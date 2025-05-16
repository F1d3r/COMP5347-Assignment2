// Define user model.

const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    firstname: { type: String, default: 'Unknown' },
    lastname: { type: String, default: 'Unknown' },
    email: { type: String, required: true},
    password: { type: String, required: true},
    isVerified: { type: Boolean, default: false },
    verifyToken: String,
    registDate: { type: Date, default: Date.now }
});

UserSchema.statics.createUser = async function(email, firstname, lastname, password, verifyToken){
    const existUser = await this.findOne({email});
    if(existUser){
        throw new Error("User already exists");
    }

    const userID = new mongoose.Types.ObjectId();
    const newUser = new this({
        _id: userID,
        firstname,
        lastname,
        email,
        password,
        // Default set unverified.
        isVerified: false,
        verifyToken
    });

    await newUser.save();
    return newUser;
}



// Export the model
const User = mongoose.model('User', UserSchema, 'user')
module.exports = User;