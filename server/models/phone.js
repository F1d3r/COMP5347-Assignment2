const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  brand: { type: String, required: true },
  image: { type: String, required: true },
  stock: { type: Number, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  price: { type: Number, required: true },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number },
      comment: { type: String },
      date: { type: Date }
    }
  ],
  disabled: { type: Boolean, default: false }
}, { collection: 'phonelistings' });

module.exports = mongoose.model('Phone', phoneSchema);
