// Admin activity log model

const mongoose = require("mongoose");
const AdminLogSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actionType: { 
        type: String, 
        enum: [
            // Authentication actions
            'admin_login', 
            'admin_logout',
            
            // User management actions
            'user_create',
            'user_update', 
            'user_toggle_admin', 
            'user_toggle_disable', 
            'user_delete',
            
            // Listing management actions
            'listing_update', 
            'listing_toggle_status',
            'listing_delete',
            
            // Review management actions
            'review_toggle_visibility',
            'review_delete',
            
            // Order management actions
            'order_update_status',
            
            // Export actions
            'export_orders'
        ],
        required: true
    },
    targetId: { type: String }, // ID of the affected resource (user, listing, review, order)
    details: { type: Object }, // Additional details about the action (before/after states)
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now }
});

// Export the model
const AdminLog = mongoose.model('AdminLog', AdminLogSchema, 'adminLogs');
module.exports = AdminLog;