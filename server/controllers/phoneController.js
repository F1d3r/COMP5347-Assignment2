// server/controllers/phoneController.js
const Phone = require('../models/phone');

exports.getAllPhones = async (req, res) => {
  try {
    const phones = await Phone.find();
    res.json(phones);
  } catch (error) {
    console.error('Failed to fetch phones:', err);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};
