const { default: mongoose } = require("mongoose");

module.exports.showAuth = function(req, res) {
    res.render('auth.ejs');
};

module.exports.verifyIdentity = async function(req, res) {
    // Import User model.
    const User = require('../models/user')

    // Get the input of the authentication page.
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;

    // Connect to the database and check identity of the user.
    const user = await User.findOne({firstname: firstname, 
        lastname: lastname});
    if(!user){
        // If user does not exist, redirect to the authentication.
        console.log("User does not exist. Authentication failed.");
        res.redirect('/');
    }else{
        console.log("User exists. Authentication success.");
        res.redirect('/?firstname=' + encodeURIComponent(firstname) + 
        '&lastname=' + encodeURIComponent(lastname));
    }

}