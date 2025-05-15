const express = require('express');
const phoneController = require('../controllers/phone.controller');
const userController = require('../controllers/user.controller');
const userRouter = express.Router();



// Get the bestSeller in the dataset.
userRouter.get('/bestSeller', phoneController.getBestSeller);
userRouter.get('/soldOutSoon', phoneController.getSoldOutSoon);
userRouter.get('/search', phoneController.searchResult);
userRouter.get('/allBrand', phoneController.getAllBrand);

userRouter.get('/verify/:token', userController.verifyUser);
userRouter.get('/test/:token', userController.test);
userRouter.get('/resetPassword/:_id/:token', userController.resetPassword);

// User login. Get user detail.
userRouter.post('/logout', userController.logOut);
userRouter.post('/user', userController.authenticateLogin);
userRouter.post('/user/create', userController.createUser);
userRouter.post('/user/update', userController.updateUser);
userRouter.post('/user/resetRequest', userController.handleResetRequest)
userRouter.post('/user/changePassword', userController.changeUserPassword)


// router.get('/', controller.showHomePage);
// User search for phone.
// Get user profile with 
// userRouter.get('/profile', controller.showProfile);
// userRouter.get('/isLoggedIn', controller.checkLogin);

// userRouter.post('/updateProfile', controller.updateProfile)


module.exports = userRouter;