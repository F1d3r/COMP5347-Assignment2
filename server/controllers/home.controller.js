// Default user info variable

// Function for login check.
module.exports.search = function(req, res) {
    
};

module.exports.viewItem = function(req, res) {

};

module.exports.showMainPage = function(req, res) {
    // Get the arguments from the request.
    const {firstname, lastname} = req.query;
    if(firstname == undefined & lastname == undefined){
        user = {firstname : 'Unknown', lastname : 'Unknown'};
    }else{
        user = {firstname : firstname, lastname : lastname};
    }

    res.render('home.ejs', {user : user});
}

module.exports.goAuth = function(req, res) {
    // res.redirect('/auth');
    res.render('auth.ejs');
};