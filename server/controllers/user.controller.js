var Phone = require('../models/phone')


module.exports.showHomePage = function(req,res){
	res.render('home');
}


module.exports.searchResult = function(req,res){
    // Get the search keyword.
	keyword = req.query.keyword;
    console.log(keyword);

	Phone.findPhones(keyword)
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
                count: result.length,
            });
		})
		.catch(err => {
			console.log("Cannot find phone with keyword: " + keyword + "!");
			res.status(404).send("Cannot find phone with keyword: " + keyword + "!");
		});
}