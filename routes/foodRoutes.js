const express = require('express');
const router = express.Router();
const foodController = require('../controller/foodController');

// Route to get all foods
router.get('/foods', foodController.getFoods);

// Route to get foods by category
router.get('/foods/:category', foodController.getFoodsByCategory);

// Route to add a new foods
router.post('/addfoods', foodController.addFood);
router.get("/foods/search/:name", foodController.searchFoodByName);
router.get("/foods/suggest/:letters", foodController.searchFoodByLetters);
router.get('/recommendation', foodController.recommendFoodBasedOnWeather);

module.exports = router;
