// Define user model.
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    id: String,
    first_name: String,
    last_name: String,
    email: String,
    password: String
});

const User = mongoose.model('userlist', userSchema, 'userlist')

module.exports = User;