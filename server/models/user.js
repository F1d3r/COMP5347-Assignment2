// Define user model.

// TODO: Add the registration date for all users.
const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    id: String,
    firstname: String,
    lastname: String,
    email: String,
    password: String
});


UserSchema.statics.findUser = async function(email, password){
    let user = this.findOne({'email': email, 'password':password})
    return user;
}

UserSchema.statics.findUser = async function(email){
    let user = this.findOne({'email': email})
    return user;
}

UserSchema.statics.createUser = async function(email, firstname, lastname, password){
    const existUser = await this.findOne({email});
    if(existUser){
        throw new Error("User already exists");
    }

    const userID = new mongoose.Types.ObjectId().toString();
    const newUser = new this({
        id: userID,
        firstname,
        lastname,
        email,
        password
    });

    await newUser.save();
    return newUser;
}


// Export the model
const User = mongoose.model('User', UserSchema, 'user')
module.exports = User;