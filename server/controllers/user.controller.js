var Phone = require('../models/phone')


// Render the home page for the request.
module.exports.showHomePage = function(req,res){
	console.log("Test1");
	console.log(req.session);
	const userFirstName = req.session.userFirstName;
	console.log("Test2");
	console.log(userFirstName);
	if(req.session.userFirstName != undefined){
		console.log('With user firstname');
		res.render('home', {userFirstName: userFirstName});
	}else{
		console.log('Without user firstname');
		res.render('home', {userFirstName: null});
	}
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
            res.status(200).json({
                message: "Success!",
                data: result,
                count: result.length
            });
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
			console.log(result);
			console.log(result.length);
			
            // Send the result to the client.
            res.status(200).json({
                message: "Success!",
                data: result,
                count: result.length
            });
		})
		.catch(err => {
			console.log("Cannot find phone brand");
			res.status(404).send("Cannot find phone brand");
		});
}