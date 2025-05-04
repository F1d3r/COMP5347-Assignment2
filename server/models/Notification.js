const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: ['ORDER_PLACED', 'ORDER_DELIVERED', 'ADMIN_ALERT', 'COMMENT_ADDED'],
    required: true 
  },
  content: { type: String, required: true },
  relatedItem: { type: mongoose.Schema.Types.ObjectId, refPath: 'itemModel' },
  itemModel: { type: String, enum: ['PhoneListing', 'User', 'Order'] },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);