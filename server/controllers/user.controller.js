const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.JWT_SECRET || 'top_secret';

const User = require('../models/user');

// Mail service
const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	service: 'Gmail',
	auth: {
	user: 'guangningzh4ng@gmail.com',
	pass: 'tvmlzvlzptmkjqxw'
	}
})

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
	const {email, firstname, lastname, password} = req.body;

	// Check if the user exist.
	const user = await User.findUser(email);
	if(user != null){
		res.status(409).send('User exists');
	}else{
		try{
			// Create a verify token.
			const verifyToken = crypto.randomBytes(32).toString('hex');
			const verificationLink = `http://localhost:3000/verify/${verifyToken}`;
			// Create user.
			const newUser = await User.createUser(email, firstname, lastname, password, verifyToken);

			transporter.sendMail({
				from: 'guangningzh4ng@gmail.com',
				to: email,
				subject: 'Account Verification',
				text: `Please click the liink to verify your account: ${verificationLink}`
			}).then(result => {
				console.log('Mail sent');
			})
			
			console.log(newUser);
			res.status(200).send(newUser);
		}catch(err) {
			console.error("Can not create a new user", err);
			res.status(500).send('Can not create a new user, please try again later.')
		}
		
		
	}

}

module.exports.verifyUser = async function(req, res){
	const verifyToken = req.params.token;
	console.log("Got verify token:", verifyToken);

	try{
		// Validate the verify token.
		const user = await User.findOne({ verifyToken: verifyToken});
		if(!user){
			console.log("The user does not exists");
			return res.status(404).send("The link is invalid or expired.")
		}
		console.log(user);
		// If the token is valid, verify the user.
		user.isVerified = true;
		user.verifyToken = null;
		await user.save();

		// Generate a JWT and redirect to the front end.
		const authToken = jwt.sign({user: user}, SECRET_KEY, { expiresIn:'1d'});
		res.redirect(`http://localhost:4200/?token=${authToken}`);
	}catch(err){
		res.status(500).send("Server error");
	}
}

module.exports.test = function(req, res){
	
}