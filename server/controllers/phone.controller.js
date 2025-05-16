const Phone = require('../models/phone');
const { ObjectId } = require('mongodb');

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
	Phone.getPhone(phone_id)
		.then(result => {
			if(!result){
				console.log("Cannot find phone");
				res.status(404).send("The phone does not exist");
			}
            // console.log(result.length);
            // console.log(result);
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
module.exports.getAllBrand = function(req, res){
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
module.exports.searchResult = function(req,res){
    // Get the search keyword.
	keyword = req.query.keyword;
	brand = req.query.brand;
    console.log(keyword);
    console.log(brand);

	Phone.findPhones(keyword, brand)
		.then(result => {
			if (result.length < 1) {
				throw("Cannot find any phone with keyword", keyword);
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