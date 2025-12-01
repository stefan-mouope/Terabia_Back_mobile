// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.createOrder);

// Routes spécifiques avant les routes génériques
router.get('/buyer/:buyer_id', orderController.getOrdersByBuyerId);

// Routes génériques
router.get('/:id', orderController.getOrderById);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);
router.get('/', orderController.getAllOrders);


module.exports = router;
