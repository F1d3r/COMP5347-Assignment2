// Define user model.

// TODO: Add the registration date for all users.
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    id: String,
    firstname: String,
    lastname: String,
    email: String,
    password: String
});

const User = mongoose.model('user', userSchema, 'user')

module.exports = User;