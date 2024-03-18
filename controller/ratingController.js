const Food = require('../models/food'); // Import the Food model
const Order = require('../models/order'); // Import the Order model
const mongoose = require('mongoose');

exports.getFoodWithRating = async (req, res) => {
    try {
        const orders = await Order.find({}).select('foodId rating'); // Select foodId and rating
        const foodIds = orders.map(order => new mongoose.Types.ObjectId(order.foodId)); // Convert foodId strings to ObjectIds
        const foods = await Food.find({ _id: { $in: foodIds } }); // Find Foods based on converted ObjectIds

        // Create a map to store ratings and count for each food
        const foodRatingsMap = new Map();
        orders.forEach(order => {
            const foodIdString = order.foodId.toString();
            if (!foodRatingsMap.has(foodIdString)) {
                foodRatingsMap.set(foodIdString, { totalRating: 0, count: 0 });
            }
            const rating = order.rating;
            foodRatingsMap.get(foodIdString).totalRating += rating;
            foodRatingsMap.get(foodIdString).count++;
        });

        // Calculate average rating for each food
        const foodWithAverageRatings = [];
        foods.forEach(food => {
            const foodIdString = food._id.toString();
            const ratingInfo = foodRatingsMap.get(foodIdString);
            const averageRating = ratingInfo ? ratingInfo.totalRating / ratingInfo.count : null;
            foodWithAverageRatings.push({
                name: food.name,
                averageRating: averageRating
            });
        });

        res.json({ success: true, data: foodWithAverageRatings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getFoodOrdersChartData = async (req, res) => {
    try {
        // Aggregate daily food orders
        const orders = await Order.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    orders: { $push: "$$ROOT" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Map foodIds to ObjectIds
        const foodIds = orders.flatMap(order => order.orders.map(order =>new mongoose.Types.ObjectId(order.foodId)));

        // Find foods based on converted ObjectIds
        const foods = await Food.find({ _id: { $in: foodIds } });

        // Create a map to store daily order counts and most ordered food
        const chartData = orders.map(order => {
            // Calculate most ordered food for each day
            const mostOrderedFood = order.orders.reduce((acc, curr) => {
                acc[curr.foodId] = (acc[curr.foodId] || 0) + 1;
                return acc;
            }, {});
            const mostOrderedFoodId = Object.keys(mostOrderedFood).reduce((a, b) => mostOrderedFood[a] > mostOrderedFood[b] ? a : b);

            // Find the most ordered food object
            const mostOrderedFoodObject = foods.find(food => food._id.toString() === mostOrderedFoodId);

            return {
                date: order._id,
                totalOrders: order.count,
                mostOrderedFood: mostOrderedFoodObject ? mostOrderedFoodObject.name : 'No Orders'
            };
        });

        // Send the chart data to users
        res.json({ success: true, data: chartData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
