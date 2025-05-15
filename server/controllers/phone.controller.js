const Phone = require('../models/phone');


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
			res.status(404).send("Cannot find best seller");
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


// Send all brand to the request.
module.exports.getAllBrand = function(req, res){
	Phone.getAllBrand()
		.then(result =>{
			// console.log(result);
			// console.log(result.length);
			res.status(200).send(result);
		})
		.catch(err => {
			console.log("Cannot find phone brand");
			res.status(404).send("Cannot find phone brand");
		});
}



// // Render the home page for the request.
// module.exports.showHomePage = function(req,res){
// 	const user = req.session.user;
// 	if(user.firstname != null){
// 		console.log('Welcome back');
// 		res.render('home', {user: user});
// 	}else{
// 		console.log('Guest access.');
// 		res.render('home', {user: null});
// 	}
// }





// // Assumption: the profile request can only be sent if 
// // the user has logged in.
// module.exports.showProfile = function(req, res){
// 	// Render the profile page with the user's detail in session.
// 	console.log("Showing profile");
// 	res.render('profile', {user: req.session.user});
// }


// // Check if current session has logged in.
// module.exports.checkLogin = function(req, res){
// 	if(req.session.user.role != 'guest'){
// 		res.status(200).json({
// 			message: 'You have already logged in!',
// 			user: req.session.user
// 		})
// 	}else{
// 		res.status(200).json({
// 			message: 'You have not checked in!',
// 			user: req.session.user
// 		})
// 	}
// }


// // Update the user info with inputted value.
// module.exports.updateProfile = function(req, res){
// 	console.log("Profile updated.");
// 	res.redirect('/');
// }