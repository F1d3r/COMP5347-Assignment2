// Admin Log Controller

const mongoose = require("mongoose");
const AdminLog = require("../models/adminLog");

// Create a new admin log entry
exports.logAdminAction = async (req, res, adminId, actionType, targetId = null, details = {}) => {
    try {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        
        const log = new AdminLog({
            _id: new mongoose.Types.ObjectId(),
            adminId,
            actionType,
            targetId,
            details,
            ipAddress,
            userAgent
        });
        
        await log.save();
        return true;
    } catch (error) {
        console.error("Error logging admin action:", error);
        return false;
    }
};

// Get all admin logs - for admin viewing
exports.getAllLogs = async (req, res) => {
    try {
        const logs = await AdminLog.find()
            .sort({ timestamp: -1 })
            .populate('adminId', 'firstname lastname email')
            .exec();
            
        return res.status(200).json(logs);
    } catch (error) {
        console.error("Error fetching admin logs:", error);
        return res.status(500).json({ message: "Error fetching admin logs" });
    }
};

// Get filtered admin logs
exports.getFilteredLogs = async (req, res) => {
    try {
        const { actionType, adminId, startDate, endDate } = req.query;
        
        const query = {};
        
        if (actionType) {
            query.actionType = actionType;
        }
        
        if (adminId) {
            query.adminId = adminId;
        }
        
        // Date range filtering
        if (startDate || endDate) {
            query.timestamp = {};
            
            if (startDate) {
                query.timestamp.$gte = new Date(startDate);
            }
            
            if (endDate) {
                query.timestamp.$lte = new Date(endDate);
            }
        }
        
        const logs = await AdminLog.find(query)
            .sort({ timestamp: -1 })
            .populate('adminId', 'firstname lastname email')
            .exec();
            
        return res.status(200).json(logs);
    } catch (error) {
        console.error("Error fetching filtered admin logs:", error);
        return res.status(500).json({ message: "Error fetching admin logs" });
    }
};

// Export logs to CSV
exports.exportLogs = async (req, res) => {
    try {
        const logs = await AdminLog.find()
            .sort({ timestamp: -1 })
            .populate('adminId', 'firstname lastname email')
            .exec();
            
        // Create CSV content
        let csv = 'Timestamp,Admin ID,Admin Email,Action Type,Target ID,IP Address,User Agent\n';
        
        logs.forEach(log => {
            const adminEmail = log.adminId ? log.adminId.email : 'Unknown';
            csv += `${log.timestamp},${log.adminId?._id || 'Unknown'},${adminEmail},${log.actionType},${log.targetId || 'N/A'},${log.ipAddress},${log.userAgent}\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=admin_logs.csv');
        return res.status(200).send(csv);
    } catch (error) {
        console.error("Error exporting admin logs:", error);
        return res.status(500).json({ message: "Error exporting admin logs" });
    }
};