const express = require('express');
const controller = require('../controllers/auth.controller');
const router = express.Router();

router.get('/', controller.showAuthPage);

router.post('/login', controller.verifyUser);


module.exports = router;