// Define mobile phone model.
const mongoose = require("mongoose");
const mobileSchema = new mongoose.Schema({
    phone_id: String,
    title: String,
    brand: String,
    image_url: String,
    stock: Number,
    seller: String,
    price: Number,
    reviews: [{
        reviewer: String,
        rating: Number,
        comment: Text
    }]
});

const Phone = mongoose.model("phonelisting", mobileSchema)

module.exports = Phone;