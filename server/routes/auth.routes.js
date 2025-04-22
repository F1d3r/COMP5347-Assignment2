const express = require('express');
const controller = require('../controllers/auth.controller');
const router = express.Router();


router.get('/', controller.showAuth);
router.post('/verify', controller.verifyIdentity);

// Verify the user's identity with their input.
// router.post('/auth', controller.verifyIdentity);


// router.post('/search', controller.showSearchResult);
// router.post('/item', controller.showItem);

module.exports = router;
