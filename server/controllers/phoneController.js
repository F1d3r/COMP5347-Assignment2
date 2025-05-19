// server/controllers/phoneController.js
const PhoneListing = require('../models/PhoneListing');

exports.getAllPhones = async (req, res) => {
  try {
    const phones = await PhoneListing.find();
    res.json(phones);
  } catch (error) {
    console.error('Failed to fetch phones:', error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};
