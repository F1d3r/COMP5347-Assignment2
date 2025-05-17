const express = require('express');
const userController = require('../controllers/user.controller');
const userRouter = express.Router();


userRouter.get('/verify/:token', userController.verifyUser);
userRouter.get('/test/:token', userController.test);
userRouter.get('/resetPassword/:_id/:token', userController.resetPassword);

// User login. Get user detail.
userRouter.post('/', userController.authenticateLogin);
userRouter.post('/logout', userController.logOut);
userRouter.post('/create', userController.createUser);
userRouter.post('/update', userController.updateUser);
userRouter.post('/resetRequest', userController.handleResetRequest)
userRouter.post('/changePassword', userController.changeUserPassword)


module.exports = userRouter;