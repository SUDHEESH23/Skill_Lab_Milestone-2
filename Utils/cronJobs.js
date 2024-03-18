// utils/cronJobs.js

const cron = require('node-cron');
const mongoose = require('mongoose');
const Order = require('../models/order');

// Function to check and update order status// Function to check and update order status
const checkAndUpdateOrderStatus = async () => {
    try {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000); // Two minutes ago
        const filter = {
            status: 'pending', // Filter by pending status
            createdAt: { $lte: twoMinutesAgo }, // Filter by createdAt date
            // Exclude orders that are already cancelled
            // Add any other status you want to exclude as well
            status: { $ne: 'cancelled' }
        };
        const update = { status: 'cancelled' }; // Update status to cancelled

        const cancelledOrders = await Order.updateMany(filter, update);

        if (cancelledOrders.nModified > 0) {
            console.log(`Cancelled ${cancelledOrders.nModified} orders.`);
        }
    } catch (error) {
        console.error('Error occurred while checking and updating orders:', error);
    }
};
