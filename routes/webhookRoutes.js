const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Webhook endpoint for most ordered food
router.post('/webhook/most-ordered-food', webhookController.mostOrderedFoodWebhook);

module.exports = router;