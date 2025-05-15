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

    getAllPhones: async function() {  
        return await Phone.find();
    },

    getOnePhone: async function(query) {
        return await Phone.findOne(query);
    },

    getLeastQuantityPhones: async function() {
        return await Phone.aggregate([
            { $match: { disabled: false , stock: { $gt: 0 } } },
            { $sort: { stock: 1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    image: 1,
                    price: 1
                }
            }
        ]);
    },

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
                    image: { $first: "$image" },
                    avgRating: { $avg: "$reviews.rating" }
                }
            },
            { $sort: { avgRating: -1 } },
            { $limit: 5 },
            { 
                $project: { 
                    _id: 0, 
                    image: 1, 
                    avgRating: 1 
                } 
            }
        ]);
    }
    
};