const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    reviewer: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    hidden: { type: Boolean }                   
}); 

const phoneSchema = new mongoose.Schema({
    title: { type: String, required: true },
    brand: {type: String, required: true },
    image: { type: String, required: true },
    stock: { type: Number, required: true },
    seller: { type: String, required: true }, 
    price: { type: Number, required: true },
    disabled: { type: Boolean },          
    reviews: [reviewSchema]             
});

// create model
const Phone = mongoose.model('Phone', phoneSchema);

// export an object including model and functions
module.exports = {
    Phone,

    // get all phones
    getAllPhones: async function() {
        return await Phone.find();
    },

    // get phone with id
    getOnePhone: async function (query) {
        return await Phone.findOne(query);
    },

    // get five phones that have the least quantity available
    getLeastQuantityPhones: async function() {
        return await Phone.aggregate([
            { $match: { disabled: false , stock: { $gt: 0 } } },
            { $sort: { stock: 1 } },
            { $limit: 5 },
            // {
            //     $project: {
            //         _id: 0,
            //         image: 1,
            //         price: 1
            //     }
            // }
        ]);
    },

    // get five phones that have the highest average rating
    getBestSellers: async function() {
        return await Phone.aggregate([
            { $match: { disabled: false,
                stock: { $gt: 0 },
                $expr: { $gte: [ { $size: "$reviews" }, 2 ] }
            }},
            { $unwind: "$reviews" },
            {
                $group: {
                    _id: "$_id",
                title: { $first: "$title" },
                brand: { $first: "$brand" },
                image: { $first: "$image" },
                stock: { $first: "$stock" },
                seller: { $first: "$seller" },
                price: { $first: "$price" },
                disabled: { $first: "$disabled" },
                avgRating: { $avg: "$reviews.rating" },
                reviewCount: { $sum: 1 }
                }
            },
            {
                $addFields: {
                avgRating: { $round: ["$avgRating", 2] }
                }
            },
            { $sort: { avgRating: -1 } },
            { $limit: 5 },
            // { 
            //     $project: { 
            //         _id: 0, 
            //         image: 1, 
            //         avgRating: 1 
            //     } 
            // }
        ]);
    },
    
    // get all phone brands
    getAllBrands: async function() {
        return await Phone.distinct('brand');
    },

    // get searched phones with keyword and/or brand
    getSearchedPhones: async function (keyword, brand) {
        const query = {};

        // if keyword isn't blank, preprocess keyword, add to search condition
        if (keyword.trim() !== '') {
            query.title = { $regex: keyword, $options: 'i' }; // case insensitive
        }

        // if brand is not "All brands"，add to search condition
        if (brand !== 'All brands') {
            query.brand = brand;
        }

        // exclude disabled = 'true'
        query.disabled = { $ne: 'true' };

        return await Phone.find(query);
    }
};