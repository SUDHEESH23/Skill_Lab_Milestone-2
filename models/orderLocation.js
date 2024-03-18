// models/orderLocation.js
const mongoose = require('mongoose');

const orderLocationSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    // Add more fields for tracking location data if needed
}, { timestamps: true });

const OrderLocation = mongoose.model('OrderLocation', orderLocationSchema);

module.exports = OrderLocation;
