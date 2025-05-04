const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get notifications for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      user: req.params.userId 
    }).sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark a notification as read
router.patch('/read/:notificationId', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order delivered notification
router.post('/order-delivered', async (req, res) => {
  try {
    const { userId, orderId, phoneTitle } = req.body;
    
    const notification = await Notification.create({
      user: userId,
      type: 'ORDER_DELIVERED',
      content: `Your order for ${phoneTitle} has been delivered!`,
      relatedItem: orderId,
      itemModel: 'Order'
    });
    
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create admin alert for new order
router.post('/admin-alert', async (req, res) => {
  try {
    const { orderId, userFullName, phoneTitle } = req.body;
    
    // Find admin users (assuming isAdmin field exists)
    const User = require('../models/User');
    const admins = await User.find({ isAdmin: true });
    
    // Create notifications for all admins
    const notifications = [];
    
    for (const admin of admins) {
      const notification = await Notification.create({
        user: admin._id,
        type: 'ADMIN_ALERT',
        content: `New order placed: ${userFullName} purchased ${phoneTitle}`,
        relatedItem: orderId,
        itemModel: 'Order'
      });
      
      notifications.push(notification);
    }
    
    res.status(201).json({ 
      message: `Alert sent to ${admins.length} administrators`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;