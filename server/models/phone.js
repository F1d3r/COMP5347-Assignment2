const mongoose = require('mongoose');
 
// Review schema
const ReviewSchema = new mongoose.Schema({
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
    reviews:[ReviewSchema],
    disabled: Boolean
});


// Find the 5 phons with highest rating.
PhoneSchema.statics.getBestSeller = async function(){
    // Using the pipeline to calculate the average rating for each phone.
    const topPhones =  await this.aggregate([
        // Filter the phones disabled.
        { $match: { 
            disabled: { $exists: true },
            disabled: { $eq: false },
        }},

        // Add a field for average rating.
        { $addFields: {
            avgRating: { 
                $cond: {
                    // 0 If no review.
                    if: { $eq: [{ $size: "$reviews" }, 0] },
                    then: 0,
                    // Else the average of all revies.
                    else: { $avg: "$reviews.rating" }
                }
            },
        }},

        // Sort on averageRating by descending order.
        { $sort: { averageRating: -1} },
        
        // Get top 5.
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
    return this.distinct('brand')
    .sort({'brand':1});
}

// Exports the model.
const Phone = mongoose.model('Phone', PhoneSchema, 'phone');
module.exports = Phone;