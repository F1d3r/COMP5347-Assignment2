const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const PhoneListing = require('../models/PhoneListing');

// Create new order and update stock
router.post('/', async (req, res) => {
  try {
    const { userId, items, total } = req.body;
    console.log(userId, items, total);
    
    if (!userId) {
      console.log("Missing userId");
      return res.status(400).json({ message: 'Missing userId in request' });
    }
    
    // Check and update stock
    for (let entry of items) {
      const phoneListing = await PhoneListing.findById(entry.productId);
      if (!phoneListing) {
        console.log("Phone not found");
        return res.status(404).json({ message: `Phone not found: ${entry.productId}` });
      }
      
      if (phoneListing.stock < entry.quantity) {
        console.log("Stock not eonough");
        return res.status(400).json({ message: `Insufficient stock for: ${phoneListing.title}` });
      }
      
      phoneListing.stock -= entry.quantity;
      await phoneListing.save();
    }
    
    // Get phone title and other details if not provided
    const transformedItems = [];
    
    for (const item of items) {
      const phone = await PhoneListing.findById(item.productId);
      transformedItems.push({
        phoneId: item.productId,
        title: phone ? phone.title : "Unknown Phone",
        price: phone ? phone.price : 0,
        quantity: item.quantity
      });
    }
    
    // Save order with userId and status
    const order = new Order({ 
      userId, 
      items: transformedItems, 
      totalAmount: total,
      status: 'pending'
    });
    await order.save();
    
    // Create notification for admins about the new order
    try {
      const User = require('../models/User');
      const Notification = require('../models/Notification');
      
      const user = await User.findById(userId);
      const userFullName = `${user.firstname} ${user.lastname}`;
      
      // Find all admin users
      const admins = await User.find({ isAdmin: true });
      
      // Create notification for each admin
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          type: 'ORDER_PLACED',
          content: `New order placed by ${userFullName}. Total: $${total.toFixed(2)}`,
          relatedItem: order._id,
          itemModel: 'Order'
        });
      }
    } catch (notificationError) {
      console.error('Error creating admin notifications:', notificationError);
      // Continue with order processing even if notification fails
    }
    
    res.status(201).json(order);
   
  } catch (err) {
    console.error('❌ Order error:', err);
    res.status(500).json({ message: 'Server error during order processing' });
  }
});

module.exports = router;