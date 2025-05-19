// server/models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [
    {
      phoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'PhoneListing' },
      title: String,
      price: Number,
      quantity: Number
    }
  ],
  totalAmount: Number,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;