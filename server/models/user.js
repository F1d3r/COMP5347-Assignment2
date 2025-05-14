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
    let user = this.find({'email': email, 'password':password})
    return user;
}


// Export the model
const User = mongoose.model('User', UserSchema, 'user')
module.exports = User;