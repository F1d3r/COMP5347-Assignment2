const express = require('express');
const controller = require('../controllers/user.controller');
const router = express.Router();

router.get('/', controller.showHomePage);

// User search for phone.
router.get('/search', controller.searchResult)


module.exports = router;