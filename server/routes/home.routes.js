const express = require('express');
const controller = require('../controllers/home.controller');
const router = express.Router();



router.get('/', controller.showMainPage);


// router.post('/search', controller.showSearchResult);
// router.post('/item', controller.showItem);

module.exports = router;
