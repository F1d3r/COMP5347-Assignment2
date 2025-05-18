const mongoose = require('mongoose');

const PhoneSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    title: String,
    brand: String,
    imagePath: String,
    stock: Number,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    price: Number,
    reviews:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    disabled: {type: Boolean, default: false }
});

// Get the complete information for certain phone.
// Including the seller info, and the reviews info.
PhoneSchema.statics.getPhone = async function(_id){
	phone_id = new mongoose.Types.ObjectId(_id);
    const phone = await Phone.aggregate([
        { $match: { _id: phone_id }},

        // Get the seller complete info.
        {
            $lookup: {
                from:"user",
                localField: "seller",
                foreignField: "_id",
                as: "seller"
            }
        },
        {
            $unwind: "$seller"
        },

        // Get the complete information fo the review.
        {
            $unwind: { path: "$reviews", preserveNullAndEmptyArrays: true }
        },
        {
            $lookup: {
                from: "review",
                localField: "reviews",
                foreignField: "_id",
                as: "reviews"
            }
        },
        {
            $unwind: { path: "$reviews", preserveNullAndEmptyArrays: true }
        },

        // Get the complete information of the reviewers.
        {
            $lookup: {
                from: "user",
                localField: "reviews.reviewer",
                foreignField: "_id",
                as: "reviews.reviewer"
            }
        },
        {
            $unwind: { path: "$reviews.reviewer", preserveNullAndEmptyArrays: true }
        },
        
        // Group the review
        {
            $group: {
                _id: "$_id",
                title: { $first: "$title"},
                brand: { $first: "$brand" },
                imagePath: { $first: "$imagePath"},
                stock: { $first: "$stock" },
                seller: { $first: "$seller" },
                price: { $first: "$price" },
                reviews: { $push: "$reviews" },
                disabled: { $first: "$disabled"}
            }
        },

        // Calculate the average rating for each phone
        { 
            $addFields: {
                reviews: {
                    $cond: { if: { $eq: ["$reviews", [{}]] }, then: [], else: "$reviews" }
                },
                avgRating: { $round: [{ $avg: "$reviews.rating" }, 2] }
            }
        },
        
    ])

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
    // Got the complete info to review.
    {
            $lookup: {
                from: "review",
                localField: "reviews",
                foreignField: "_id",
                as: "reviews"
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
PhoneSchema.statics.findPhones = async function(keyword, brand){
    // Set to case insensitive.
    let results = [];
    if(brand == 'All'){
        results = await Phone.aggregate([
            { $match: { title: { $regex: keyword, $options: "i" } }},

            // Get the seller complete info.
            {
                $lookup: {
                    from:"user",
                    localField: "seller",
                    foreignField: "_id",
                    as: "seller"
                }
            },
            {
                $unwind: "$seller"
            },

            // Get the complete information fo the review.
            {
                $unwind: { path: "$reviews", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: "review",
                    localField: "reviews",
                    foreignField: "_id",
                    as: "reviews"
                }
            },
            {
                $unwind: { path: "$reviews", preserveNullAndEmptyArrays: true }
            },

            // Get the complete information of the reviewers.
            {
                $lookup: {
                    from: "user",
                    localField: "reviews.reviewer",
                    foreignField: "_id",
                    as: "reviews.reviewer"
                }
            },
            {
                $unwind: { path: "$reviews.reviewer", preserveNullAndEmptyArrays: true }
            },
            
            // Group the review
            {
                $group: {
                    _id: "$_id",
                    title: { $first: "$title"},
                    brand: { $first: "$brand" },
                    imagePath: { $first: "$imagePath"},
                    stock: { $first: "$stock" },
                    seller: { $first: "$seller" },
                    price: { $first: "$price" },
                    reviews: { $push: "$reviews" },
                    disabled: { $first: "$disabled"}
                }
            },

            // Calculate the average rating for each phone
            { 
                $addFields: {
                    reviews: {
                        $cond: { if: { $eq: ["$reviews", [{}]] }, then: [], else: "$reviews" }
                    },
                    avgRating: { $round: [{ $avg: "$reviews.rating" }, 2] }
                }
            },
        ]).sort({price: -1});

    }else{
        results = await Phone.aggregate([
            { $match: { brand: brand, title: { $regex: keyword, $options: "i" } }},

            // Get the seller complete info.
            {
                $lookup: {
                    from:"user",
                    localField: "seller",
                    foreignField: "_id",
                    as: "seller"
                }
            },
            {
                $unwind: "$seller"
            },

            // Get the complete information fo the review.
            {
                $unwind: { path: "$reviews", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: "review",
                    localField: "reviews",
                    foreignField: "_id",
                    as: "reviews"
                }
            },
            {
                $unwind: { path: "$reviews", preserveNullAndEmptyArrays: true }
            },

            // Get the complete information of the reviewers.
            {
                $lookup: {
                    from: "user",
                    localField: "reviews.reviewer",
                    foreignField: "_id",
                    as: "reviews.reviewer"
                }
            },
            {
                $unwind: { path: "$reviews.reviewer", preserveNullAndEmptyArrays: true }
            },
            // Group the review
            {
                $group: {
                    _id: "$_id",
                    title: { $first: "$title"},
                    brand: { $first: "$brand" },
                    imagePath: { $first: "$imagePath"},
                    stock: { $first: "$stock" },
                    seller: { $first: "$seller" },
                    price: { $first: "$price" },
                    reviews: { $push: "$reviews" },
                    disabled: { $first: "$disabled"}
                }
            },

            // Calculate the average rating for each phone
            { 
                $addFields: {
                    reviews: {
                        $cond: { if: { $eq: ["$reviews", [{}]] }, then: [], else: "$reviews" }
                    },
                    avgRating: { $round: [{ $avg: "$reviews.rating" }, 2] }
                }
            },
        ]).sort({price: -1});
    }
    console.log("Result:",results);
    return results;
}


// Static function used to get all brand in the database.
PhoneSchema.statics.getAllBrand = function(){
    return Phone.distinct('brand').sort({'brand':1});
}

// Exports the model.
const Phone = mongoose.model('Phone', PhoneSchema, 'phone');
module.exports = Phone;