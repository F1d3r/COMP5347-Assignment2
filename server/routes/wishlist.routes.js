
const express = require('express');
const router = express.Router();
const Wishlist = require('../models/wishlist');

// Add to Wishlist
router.post('/', async (req, res) => {
  const { userId, productId } = req.body;
  console.log("User id:", userId);
  console.log("Phone id:", productId);
  
  const existing = await Wishlist.findOne({ userId, productId });
  if (existing) {
    console.log('Already in wishlist');
    return res.status(409).send('Already in wishlist');
  }

  const entry = new Wishlist({ userId, productId });
  await entry.save();
  res.status(201).json(entry);
});

// Get users' Wishlist
router.get('/:userId', async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: req.params.userId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Wishlist item
router.delete('/:userId/:productId', async (req, res) => {
  try {
    await Wishlist.deleteOne({ userId: req.params.userId, productId: req.params.productId });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
