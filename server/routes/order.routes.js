const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Phone = require('../models/phone');

// Create new order and update stock
router.post('/', async (req, res) => {
  try {
    const { userId, items, total } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'Missing userId in request' });
    }

    // Check and update stock
    for (let entry of items) {
      const phone = await Phone.findById(entry.productId);
      if (!phone) {
        return res.status(404).json({ message: `Phone not found: ${entry.productId}` });
      }

      if (phone.stock < entry.quantity) {
        return res.status(400).json({ message: `Insufficient stock for: ${phone.title}` });
      }

      phone.stock -= entry.quantity;
      await phone.save();
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
