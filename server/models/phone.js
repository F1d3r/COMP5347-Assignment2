const mongoose = require('mongoose');
 
// Review schema
const reviewSchema = new mongoose.Schema({
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    hidden: Boolean
});

const PhoneSchema = new mongoose.Schema({
    id: String,
    title: String,
    brand: String,
    imageURL: String,
    stock: Number,
    seller: String,
    price: Number,
    reviews:[reviewSchema]
});

// Static function used to find the phone by key words search.
PhoneSchema.statics.findPhones = function(keywrod, brand){
    // Set to case insensitive.
    const regex = new RegExp(keywrod, 'i');

    if(brand == 'All'){
        return this.find({'title': {$regex: regex}})
        .sort({'price':1})
    }else{
        return this.find({'title': {$regex: regex}, 'brand':brand})
        // Sort by the price in default.
        .sort({'price':1})
    }
}

// Static function used to get all brand in the database.
PhoneSchema.statics.getAllBrand = function(){
    return this.distinct('brand')
    .sort({'brand':1});
}

const Phone = mongoose.model('Phone', PhoneSchema, 'phone');

// Exports the model.
module.exports = Phone;