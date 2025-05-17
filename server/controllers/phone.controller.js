const Phone = require('../models/phone');
const Review = require('../models/review');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

// get all phones
module.exports.getAllPhones = async function(req, res) {
    try {
        const phones = await Phone.getAllPhones();
        res.status(200).json(phones);
    } catch (error) {
        res.status(500).send(error.message || 'Server error getting all phones.');
    }
};

// Find one phone by its id.
module.exports.getPhone = async function(req, res){
	phone_id = req.params._id;
	console.log("Got id:",phone_id);
	Phone.getPhone(phone_id)
		.then(result => {
			if(!result){
				console.log("Cannot find phone");
				res.status(404).send("The phone does not exist");
			}
            console.log(result);
            // console.log(result.length);
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

	Phone.getSoldOutSoon()
		.then(result => {
            // console.log(result.length);
            // console.log(result);
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

	Phone.getBestSeller()
		.then(result => {
            // console.log(result.length);
            // console.log(result);
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
	Phone.getAllBrand()
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

	Phone.findPhones(keyword, brand)
		.then(result => {
			if (result.length < 1) {
				console.log("Cannot find any phone with keyword", keyword);
			}
            console.log(result);
            console.log(result.length);
            // Send the result to the client.
            res.status(200).send(result);
		})
		.catch(err => {
			console.log("Cannot find phone with keyword: " + keyword + "!");
			res.status(404).send("Cannot find phone with keyword: " + keyword + "!");
		});
}


module.exports.addReview = async function(req, res){
	phone_id = req.body.phone_id;
	reviewer = req.body.reviewer;
	comment = req.body.comment;
	rating = req.body.rating;
	// Convert id string to id object.
	phone_id = new mongoose.Types.ObjectId(phone_id),
	reviewer = new mongoose.Types.ObjectId(reviewer),


	console.log("Got review:", reviewer, phone_id, comment, rating);

	// First Add the review
	Review.create({
		reviewer: reviewer,
		rating: rating,
		comment: comment,
		hidden: false
	}).then(review =>{
		// Then insert the review id into the phone list.
		Phone.findByIdAndUpdate(
			phone_id,
			{ $push:{ reviews: review.id } },
			{ new: true, useFindAndModify:false }
		).then(phone =>{
			res.status(200).send(phone);
		}).catch(error =>{
			console.log("Failed insert review into phone",error);
			res.status(500).send("Server Error. Failed to add review to phone list.");
		})
	}).catch(error =>{
		console.log("Failed create review", error);
		// Delete the review just created.
		Review.findByIdAndDelete(review._id);
		res.status(500).send("Server error. Failed to add review.");
	})
	
	
}