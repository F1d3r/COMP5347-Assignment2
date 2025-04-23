var mongoose = require('./db');

var PhoneSchema = new mongoose.Schema({
    id: String,
    title: String,
    brand: String,
    imageURL: String,
    stock: Number,
    seller: String,
    price: Number,
    reviews:[{
        reviewer: String,
        rating: Number,
        comments: String
    }]
});


// Static function used to find the phone by key words search.
PhoneSchema.statics.findPhones = function(search){
    // Set to case insensitive.
    const regex = new RegExp(search, 'i');
	return this.find({'title': {$regex: regex}})
    // Sort by the price in default.
	.sort({'price':1})
}


var Phone = mongoose.model('Phone', PhoneSchema, 'phonelisting');


module.exports = Phone;