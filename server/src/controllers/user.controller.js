const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const SECRET_KEY = process.env.JWT_SECRET || 'top_secret';
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'Password123!'
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10;

const User = require('../models/user');
const Activity = require('../models/activity');

// Mail service
const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	service: 'Gmail',
	auth: {
	user: 'tut07g04.comp5347@gmail.com',
	pass: 'ahxsrummwfkabydg'
	}
})


module.exports.authenticateLogin = async function(req, res){
	email = req.body.email;
	password = req.body.password;

	const user = await User.findOne({email:email});
	if(!user){
		return res.status(404).send("User does note exist");
	}
	console.log(password);
	console.log(user.password);
	// Check the password
	const isMatch = await bcrypt.compare(password, user.password);
	console.log(isMatch);
	if(isMatch){
		// Log the login.
		await Activity.insertOne({
			_id: new mongoose.Types.ObjectId(),
			userId: user.id,
			activity: 'login'
		})
		return res.status(200).send(user);
	}else{
		return res.status(401).send("The password does not match.");
	}

};


module.exports.logOut = async function(req, res){
	userId = req.body.userId;
	const user = await User.findOne({_id:userId});
	if(!user){
		return res.status(404).send("User does note exist");
	}
	// Log the logout.
	await Activity.insertOne({
		_id: new mongoose.Types.ObjectId(),
		userId: user.id,
		activity: 'logout'
	})
	return res.status(200).send("Logout success");
}


module.exports.createUser = async function(req, res){
	const {email, firstname, lastname, password} = req.body;
	const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
		
	// Check if the user exist.
	const user = await User.findOne({email:email});
	if(user != null){
		res.status(409).send('User exists');
	}else{
		try{
			// Create a verify token.
			const verifyToken = crypto.randomBytes(32).toString('hex');
			const verificationLink = `http://localhost:3000/verify/${verifyToken}`;
			// Create user.
			const newUser = await User.createUser(email, firstname, lastname, hashedPassword, verifyToken);

			// Send verification email to the user. 
			transporter.sendMail({
				from: transporter.user,
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


module.exports.updateUser = async function(req, res){
	const {email, newEmail, firstname, lastname, password} = req.body;
	console.log("Old email:",email);
	console.log("New email:", newEmail);
	console.log("Firstname:", firstname)
	console.log("Lastname:", lastname);
	// Check if the updated email exist.
	if(email != newEmail){
		console.log("Changing email");
		const existUser = await User.findOne({email:newEmail});
		if(existUser != null){
			return res.status(409).send('The new email has exist');
		}
	}

	// Check if the user exist.
	user = await User.findOne({email:email});
	console.log("Got old user:",user);
	user_id = user.id;
	console.log("User id:", user_id);
	if(!user){
		console.log("User does not exist");
		res.status(404).send('User does not exist');
	}else{
		try{
			// Update user.
			user = await User.findOneAndUpdate(
				{_id: user_id}, 
				{$set:{email: email, firstname:firstname, lastname:lastname}},
				{new: true, runValidations: true})
			
			console.log(user);
			res.status(200).send(user);
		}catch(err) {
			console.error("Can not update user", err);
			res.status(500).send('Can not update user, please try again later.')
		}
		
		
	}
}

// When user request to reset password, send a email with link.
module.exports.handleResetRequest = async function(req, res){
	const _id = req.body._id;
	console.log("Get reset request from:",_id);

	try{
		// Find the user.
		user = await User.findOne({_id:_id});
		// Check user exist.
		if(!user){
			console.log("User does not exist");
			return res.status(404).send("User not find");
		}
		
		// Generate a token for the user.
		const verifyToken = crypto.randomBytes(32).toString('hex');
		const verificationLink = `http://localhost:3000/resetPassword/${_id}/${verifyToken}`;
		// Set the token of the user.
		user.verifyToken = verifyToken;
		await user.save();


		// Send verification email to the user. 
		transporter.sendMail({
			from: transporter.user,
			to: user.email,
			subject: 'Reset your password',
			text: `Please click the liink to reset your password to 'Password123!': ${verificationLink}`
		}).then(result => {
			console.log('Mail sent');
		})

	}catch(error){
		console.log(error);
		res.status(500).send("Server error");
	}
}

// The user clicked the link to reset password.
// Check the token and reset the password.
module.exports.resetPassword = async function(req, res){
	const { _id, token } = req.params;
	console.log("Got verify token:", token);
	
	try{
		user = await User.findOne({_id:_id});
		// Check user exist.
		if(!user){
			console.log("User does not exist");
			return res.status(404).send("User not find");
		}
		// Check the token.
		if(user.verifyToken !== token){
			console.log("The token is invalid or expired.");
			return res.status(400).send("Invalid or expired token");
		}

		// Generate hashed password for the user.
		const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
		console.log("New hashed password:",hashedPassword);
		// Update user password to default.
		user.password = hashedPassword;
		// Reset the token.
		user.verifyToken = null;
		await user.save();

		// Redirect the user to the home page.
		res.redirect('http://localhost:4200');
	}catch(error){
		console.log(error);
		res.status(500).send('Server error');
	}

}

// Change user's password by input.
module.exports.changeUserPassword = async function(req, res){
	const _id = req.body._id;
	const newPassword = req.body.newPassword;
	console.log("User:", _id, "chaning password");
	
	try{
		user = await User.findOne({_id:_id});
		// Check user exist.
		if(!user){
			console.log("User does not exist");
			return res.status(404).send("User not find");
		}

		// Generate hashed password for the user.
		const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
		console.log("New hashed password:",hashedPassword);
		// Update user password to default.
		user.password = hashedPassword;
		await user.save();

		// Redirect the user to the home page.
		res.status(200).send(user);
	}catch(error){
		console.log(error);
		res.status(500).send('Server error');
	}
}



module.exports.test = function(req, res){

}