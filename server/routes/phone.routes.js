const express = require('express')
const phoneController = require('../controllers/phone.controller');
const phoneRouter = express.Router();

// Get the bestSeller in the dataset.
phoneRouter.get('/bestSeller', phoneController.getBestSeller);
phoneRouter.get('/soldOutSoon', phoneController.getSoldOutSoon);
phoneRouter.get('/search', phoneController.searchResult);
phoneRouter.get('/allBrand', phoneController.getAllBrand);
phoneRouter.get('/:_id', phoneController.getPhone)

module.exports = phoneRouter;