const express = require('express');
const controller = require('../controllers/user.controller');
const userRouter = express.Router();



// Get the bestSeller in the dataset.
userRouter.get('/bestSeller', controller.getBestSeller);
userRouter.get('/soldOutSoon', controller.getSoldOutSoon);
userRouter.get('/search', controller.searchResult);
userRouter.get('/allBrand', controller.getAllBrand);




// router.get('/', controller.showHomePage);
// User search for phone.
// Get user profile with 
// userRouter.get('/profile', controller.showProfile);
// userRouter.get('/isLoggedIn', controller.checkLogin);

// userRouter.post('/updateProfile', controller.updateProfile)


module.exports = userRouter;