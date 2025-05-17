const mongoose = require('mongoose');

// Review schema
const ReviewSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    hidden: Boolean
});

const PhoneSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    title: String,
    brand: String,
    imageURL: String,
    stock: Number,
    seller: String,
    price: Number,
    reviews:[ReviewSchema],
    disabled: {type: Boolean, default: false }
});

PhoneSchema.statics.getPhone = async function(_id){
	phone_id = new mongoose.Types.ObjectId(_id);
    const phone = await Phone.aggregate([
    { $match: 
        {
            _id: {$eq: phone_id}
        }
    },
    // Calculate the average rating for each phone
    { 
        $addFields: {
            avgRating: { $round: [{ $avg: "$reviews.rating" }, 2] }
        }
    }
    ]);
    return phone[0];
}


// Find the 5 phons with highest rating.
PhoneSchema.statics.getBestSeller = async function(){
    const topPhones = await Phone.aggregate([
    { $match: 
        {
            // Only consider phones available
            disabled: false,
            // Only consider phone with stock.
            stock: { $gt: 0 },
            // Only consider phones with at least 2 review
            $expr: { $gte: [{ $size: "$reviews" }, 2]}
        }
    },
    // Calculate the average rating for each phone
    { 
        $addFields: {
            avgRating: { $round: [{ $avg: "$reviews.rating" }, 2] }
        }
    },
    // Sort by average rating (highest first)
    { $sort: { avgRating: -1 } },
    // Return only the top result
    { $limit: 5 }
    ]);
    return topPhones;
}

// Find the 5 phons with lowest stock.
PhoneSchema.statics.getSoldOutSoon = async function(){
    // Using the pipeline to calculate the average rating for each phone.
    const soldOutSoonPhones =  await this.aggregate([
        // Filter the phones disabled.
        { $match: { 
            disabled: { $exists: true },
            disabled: { $eq: false },
            stock: {$ne: 0}
        }},
        // Sort on stock
        { $sort: { stock: 1} },
        
        // Get top 5.
        { $limit: 5 }
    ]);

    return soldOutSoonPhones;
}


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
    return Phone.distinct('brand').sort({'brand':1});
}

// Exports the model.
const Phone = mongoose.model('Phone', PhoneSchema, 'phone');
module.exports = Phone;