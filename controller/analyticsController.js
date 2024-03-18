const Order = require('../models/order');

exports.getDailyFoodOrders = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

    const foodOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: '$foodId',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(foodOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


//Frontend:
// Use Chart.js to create a bar chart.
// Fetch data from the /analytics/daily-food-orders route.
// Populate the chart with the fetched data.