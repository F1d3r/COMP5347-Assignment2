// server/routes/phoneRoutes.js
const express = require('express');
const router = express.Router();
const phoneController = require('../controllers/phoneController');

// 使用 controller 里的函数处理 GET 请求
router.get('/', phoneController.getAllPhones);

module.exports = router;