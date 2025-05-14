const User = require('../models/user');


module.exports.authenticateUser = async function(req, res){
	email = req.body.email;
	password = req.body.password;
    console.log(email);
    console.log(password);

	User.findUser(email, password)
		.then(result => {
			console.log('test');
            console.log(result);
            // Send the result to the client.
			res.status(200).send(result);
            // res.status(200).json({
            //     message: "Success!",
            //     count: result.length,
            //     data: result
            // });
		})
		.catch(err => {
			console.log("Cannot find best seller");
			res.status(404).send("Cannot find best seller");
		});
};

module.exports.createUser = async function(req, res){
	email = req.body.email;
	firstname = req.body.firstname;
	lastname = req.body.lastname;
	password = req.body.password;

	// Check if the user exist.
	const user = await User.findUser(email);
	if(user != null){
		res.status(409).send('User exists');
	}else{
		User.createUser(email, firstname, lastname, password)
			.then(result => {
				res.status(200).send(result);
			})
			.catch(err =>{
				console.log('Cannot create a new user.');
				res.status(409).send('Can not create a new user.');
			});
	}

}