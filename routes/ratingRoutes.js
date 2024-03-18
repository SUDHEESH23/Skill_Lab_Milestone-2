const express = require('express');
const router = express.Router();
const ratingController = require('../controller/ratingController');

// Route for fetching food with ratings
router.get('/ratings', ratingController.getFoodWithRating);
router.get('/chart', ratingController.getFoodOrdersChartData);
module.exports = router;
