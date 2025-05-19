const PhoneListing  = require('../models/PhoneListing');
const Review = require('../models/PhoneListing')
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

// get all phones
module.exports.getAllPhones = async function(req, res) {
    try {
        const phones = await PhoneListing.getAllPhones();
        res.status(200).json(phones);
    } catch (error) {
        res.status(500).send(error.message || 'Server error getting all phones.');
    }
};

// Find one phone by its id.
module.exports.getPhone = async function(req, res){
	phone_id = req.params._id;
	console.log("Got id:",phone_id);
	PhoneListing.getPhone(phone_id)
		.then(result => {
			if(!result){
				console.log("Cannot find phone");
				res.status(404).send("The phone does not exist");
			}
            console.log(result);
            // Send the result to the client.
			res.status(200).send(result);
		})
		.catch(err => {
			console.log("Database error", err);
			res.status(500).send("Server error");
		});
}


// Find the  five phone listings (image and price) that have 
// the least quantity available (more than 0 quantity and not disabled).
module.exports.getSoldOutSoon = async function(req, res){

	PhoneListing.getSoldOutSoon()
		.then(result => {
            // Send the result to the client.
            res.status(200).send(result);
		})
		.catch(err => {
			console.log("Cannot find low stock phones");
			res.status(404).send("Cannot find low stock phones");
		});
}


// Find the five phone listings (image and rating) that have the 
// highest average rating (not disabled and at least two ratings given)
module.exports.getBestSeller = async function(req, res){

	PhoneListing.getBestSeller()
		.then(result => {
            // Send the result to the client.
			res.status(200).send(result);
		})
		.catch(err => {
			console.log("Cannot find best seller");
			res.status(500).send("Cannot find best seller");
		});
}


// Send all brand to the request.
module.exports.getAllBrand = async function(req, res){
	PhoneListing.getAllBrand()
		.then(result =>{
			console.log(result);
			console.log(result.length);
			res.status(200).send(result);
		})
		.catch(err => {
			console.log("Cannot find phone brand");
			res.status(404).send("Cannot find phone brand");
		});
}

// Send the search result data to the request.
module.exports.searchResult = async function(req,res){
    // Get the search keyword.
	keyword = req.query.keyword;
	brand = req.query.brand;
    console.log(keyword);
    console.log(brand);

	PhoneListing.findPhones(keyword, brand)
		.then(result => {
			if (result.length < 1) {
				console.log("Cannot find any phone with keyword", keyword);
			}
            console.log("Got:", result);
            console.log(result.length);
            // Send the result to the client.
            res.status(200).send(result);
		})
		.catch(err => {
			console.log("Cannot find phone with keyword: " + keyword + "!");
			res.status(500).send("Cannot find phone with keyword: " + keyword + "!");
		});
}


module.exports.addReview = async function(req, res){
	phone_id = req.body.phonelisting_id;
	reviewer = req.body.reviewer;
	comment = req.body.comment;
	rating = req.body.rating;
	// Convert id string to id object.
	phone_id = new mongoose.Types.ObjectId(phone_id);
	reviewer = new mongoose.Types.ObjectId(reviewer);

	console.log("Got review:", reviewer, phone_id, comment, rating);

	// Create review directly in the PhoneListing document
	PhoneListing.findByIdAndUpdate(
		phone_id,
		{ 
			$push:{ 
				reviews: {
					reviewer: reviewer,
					rating: rating,
					comment: comment,
					hidden: false
				} 
			} 
		},
		{ new: true, useFindAndModify: false }
	).then(phone => {
		console.log(phone);
		res.status(200).send(phone);
	}).catch(error => {
		console.log("Failed to add review to phone", error);
		res.status(500).send("Server Error. Failed to add review to phone.");
	});
}


module.exports.hideReview = async function(req, res){
	const review_id = req.body.review_id;
	const phone_id = req.body.phone_id;
	
	console.log("Hiding review:", review_id, "in phone:", phone_id);

	try {
		// Find the phone and update the specific review's hidden status
		const updatedPhone = await PhoneListing.findOneAndUpdate(
			{ _id: phone_id, "reviews._id": review_id },
			{ $set: { "reviews.$.hidden": true } },
			{ new: true }
		).populate('seller', '-password')
		 .populate('reviews.reviewer', '-password');

		if (!updatedPhone) {
			console.log("Phone or review not found");
			return res.status(404).json({ 
				status: 404, 
				message: "Phone or review not found",
				data: null
			});
		}

		console.log("Review hidden successfully");
		res.status(200).json({ 
			status: 200, 
			message: "Review hidden successfully",
			data: updatedPhone
		});
	} catch (error) {
		console.error("Failed to hide review:", error);
		res.status(500).json({ 
			status: 500, 
			message: "Server Error. Failed to hide review.",
			data: null
		});
	}
}

module.exports.unhideReview = async function(req, res){
	const review_id = req.body.review_id;
	const phone_id = req.body.phone_id;
	
	console.log("Unhiding review:", review_id, "in phone:", phone_id);

	try {
		// Find the phone and update the specific review's hidden status to false
		const updatedPhone = await PhoneListing.findOneAndUpdate(
			{ _id: phone_id, "reviews._id": review_id },
			{ $set: { "reviews.$.hidden": false } },
			{ new: true }
		).populate('seller', '-password')
		 .populate('reviews.reviewer', '-password');

		if (!updatedPhone) {
			console.log("Phone or review not found");
			return res.status(404).json({ 
				status: 404, 
				message: "Phone or review not found",
				data: null
			});
		}

		console.log("Review unhidden successfully");
		res.status(200).json({ 
			status: 200, 
			message: "Review unhidden successfully",
			data: updatedPhone
		});
	} catch (error) {
		console.error("Failed to unhide review:", error);
		res.status(500).json({ 
			status: 500, 
			message: "Server Error. Failed to unhide review.",
			data: null
		});
	}
}