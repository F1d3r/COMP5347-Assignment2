const User = require('../models/user');
const bcrypt = require('bcrypt');

module.exports.showAuthPage = function(req, res){
    res.render('auth');
}

module.exports.verifyUser = async function(req, res){
    email = req.body.emailInput;
    pwd = req.body.pwdInput;
    console.log(email);
    console.log(pwd);
    
    try{
        // Find user in the database.
        const user = await User.findOne({email: email});
        // Check user existence.
        if(!user){
            // return res.redirect('/auth');
            return res.status(401).send("The user does not exist.");
        }
        
        // Find if the user's password match with the database.
        const match = await bcrypt.compare(pwd, user.password);
        if(!match){
            // return res.redirect('/auth');
            return res.status(401).send("Incorrect Password.");
        }

        // Now the login detail is correct. Record the login and send response.
        // TODO RECORD LOGIN HISTORY.
        req.session.user = {
            role: 'user',
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email
        }
        return res.redirect('/');

    }catch(error){
        console.log(error);
        return res.status(500).send("Server error. Please try again later.");
    }
    
};


// Render the waiting page of the email verification to the client.
// Creat a session[unique link] with unique token for the email verification.
// Use another function to handle the link.
// Officially create the account and add to database for the client
// after the verification succed.
module.exports.verifyEmail = function(req, res){

}
