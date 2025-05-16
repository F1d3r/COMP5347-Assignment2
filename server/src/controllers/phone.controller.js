const Phone = require('../models/phone');
const { ObjectId } = require('mongodb');

// get all phones
module.exports.getAllPhones = async function(req, res) {
    try {
        const phones = await Phone.getAllPhones();
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
        const phone = await Phone.getOnePhone(query); // find the phone with that id
        console.log(phone);

        if (phone) {
            res.status(200).send(phone);
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
        const sold_out_phones = await Phone.getLeastQuantityPhones();
        console.log(sold_out_phones);
        res.status(200).send(sold_out_phones);
    } catch (error) {
        res.status(500).send(error.message || 'Server error getting 5 least quantity phones.');
    }
}

// get five phones that have the highest average rating
module.exports.getBestSellers = async function(req, res) {
    try {
        const best_sellers_phones = await Phone.getBestSellers();
        console.log(best_sellers_phones);
        res.status(200).send(best_sellers_phones);
    } catch (error) {
        res.status(500).send(error.message || 'Server error getting 5 best sellers phones.');
    }
}

// get all phone brands
module.exports.getAllBrands = async function(req, res) {
    try {
        const all_brands = await Phone.getAllBrands();
        console.log(all_brands);
        res.status(200).send(all_brands);
    } catch (error) {
        res.status(500).send(error.message || 'Server error getting all brands.');
    }
}

// get searched phones with keyword and/or brand
module.exports.getSearchedPhones = async function (req, res) {
    try {
        const keyword = req.query.keyword || '';
        const brand = req.query.brand || 'All brands';
        
        var searched_phones = [];
        if (keyword == '' && brand == 'All brands') {
            searched_phones = await Phone.getAllPhones();
        }else {
            searched_phones = await Phone.getSearchedPhones(keyword, brand);
        }
        console.log(searched_phones);

        if (searched_phones) {
            res.status(200).send(searched_phones);
        } else {
            res.status(404).send(`Failed to search phone with keyword ${keyword} & brand ${brand}`);
        }
    } catch (error) {
        res.status(500).send(error.message || 'Server error searching phones with keyword/brand.');
    }
}