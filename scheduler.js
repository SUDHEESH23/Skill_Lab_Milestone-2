// scheduler.js
require("dotenv").config();
const cron = require('node-cron');
const axios = require('axios');
const Order = require('./models/order');

cron.schedule('0 0 * * *', async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Previous day

    const foodOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: yesterday },
        },
      },
      {
        $group: {
          _id: '$foodId',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const mostOrderedFood = foodOrders[0]; // Most ordered food item

    // Send information to webhook URL
    const webhookURL = process.env.YOUR_WEBHOOK_URL;
    await axios.post(webhookURL, {
      mostOrderedFood,
    });

    console.log('Webhook sent successfully');
  } catch (error) {
    console.error('Error sending webhook:', error);
  }
});