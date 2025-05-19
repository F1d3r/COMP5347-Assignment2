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
    
    // Save order with userId
    const order = new Order({ userId, items, total });
    await order.save();
    res.status(201).json(order);
   
  } catch (err) {
    console.error('❌ Order error:', err);
    res.status(500).json({ message: 'Server error during order processing' });
  }
});

module.exports = router;