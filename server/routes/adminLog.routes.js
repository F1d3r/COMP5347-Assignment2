// Admin Log Routes

const express = require('express');
const router = express.Router();
const adminLogController = require('../controllers/adminLog.controller');

// Authentication middleware to ensure only admins can access logs
const adminAuth = (req, res, next) => {
    if (!req.session || !req.session.user || !req.session.user.isAdmin) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
};

// Get all admin logs
router.get('/logs', adminAuth, adminLogController.getAllLogs);

// Get filtered admin logs
router.get('/logs/filter', adminAuth, adminLogController.getFilteredLogs);

// Export logs to CSV
router.get('/logs/export', adminAuth, adminLogController.exportLogs);

module.exports = router;