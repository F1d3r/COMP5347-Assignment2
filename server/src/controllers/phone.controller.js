const model = require('../models/phone');
const { ObjectId } = require('mongodb');

// get all phones
module.exports.getAllPhones = async function(req, res) {
    try {
        const phones = await model.getAllPhones();
        res.status(200).json(phones);
    } catch (error) {
        res.status(500).send(error.message || 'Server error getting all phones.');
    }
};

// get phone with id
module.exports.getOnePhone = async function(req, res) {
    try {
        const id = req.params.id;
        if (!id || !ObjectId.isValid(id)) {
            return res.status(400).send('Invalid MongoDB ID');
        }

        const query = { _id: new ObjectId(id) }; // look for "_id" that equals to "id" we passed
        const phone = await model.getOnePhone(query); // find the phone with that id

        if (phone) {
            res.status(200).json(phone);
        } else {
            res.status(404).send(`Failed to find the phone with ID ${id}`);
        }
    } catch (error) {
        res.status(500).send(error.message || 'Error finding phone with ID');
    }
}

// get five phones that have the least quantity available
module.exports.getLeastQuantityPhones = async function(req, res) {
    try {
        const sold_out_phones = await model.getLeastQuantityPhones();
        res.status(200).send(sold_out_phones);
    } catch (error) {
        res.status(500).send(error.message || 'Server error getting 5 least quantity phones.');
    }
}

// get five phones that have the highest average rating
module.exports.getBestSellers = async function(req, res) {
    try {
        const best_sellers_phones = await model.getBestSellers();
        res.status(200).json(best_sellers_phones);
    } catch (error) {
        res.status(500).send(error.message || 'Server error getting 5 best sellers phones.');
    }
}