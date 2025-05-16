const express = require('express');
const controller = require('../controllers/phone.controller');
const router = express.Router();

router.get('/', controller.getAllPhones);
router.get('/soldOutSoon', controller.getLeastQuantityPhones);
router.get('/bestSellers', controller.getBestSellers);
router.get('/allBrands', controller.getAllBrands);
router.get('/search', controller.getSearchedPhones);
router.get('/:id', controller.getOnePhone);

module.exports = router;