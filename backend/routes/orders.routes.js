const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders.controller');
const ordersValidation = require('../middleware/orders.validation');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.post('/', authenticateToken, authorizeRoles('buyer'), ordersValidation.createOrder, ordersController.createOrder);
router.get('/:id', authenticateToken, ordersController.getOrderById);
router.get('/', authenticateToken, ordersController.getOrders);
router.put('/:id/status', authenticateToken, authorizeRoles('seller', 'admin', 'delivery'), ordersValidation.updateOrderStatus, ordersController.updateOrderStatus);

module.exports = router;
