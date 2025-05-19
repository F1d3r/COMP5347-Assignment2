const express = require('express')
const phonelistingController = require('../controllers/phonelisting.controller');
const phonelistingRouter = express.Router();

// Get the bestSeller in the dataset.
phonelistingRouter.get('/bestSeller', phonelistingController.getBestSeller);
phonelistingRouter.get('/soldOutSoon', phonelistingController.getSoldOutSoon);
phonelistingRouter.get('/search', phonelistingController.searchResult);
phonelistingRouter.get('/allBrand', phonelistingController.getAllBrand);
phonelistingRouter.get('/:_id', phonelistingController.getPhone)

phonelistingRouter.post('/addReview', phonelistingController.addReview);
phonelistingRouter.post('/hideReview', phonelistingController.hideReview);

module.exports = phonelistingRouter;