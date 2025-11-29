const express = require('express');
const router = express.Router();
const deliveriesController = require('../controllers/deliveries.controller');
const deliveriesValidation = require('../middleware/deliveries.validation');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/available', authenticateToken, authorizeRoles('delivery', 'admin'), deliveriesController.getAvailableDeliveries);
router.post('/:id/accept', authenticateToken, authorizeRoles('delivery'), deliveriesController.acceptDelivery);
router.put('/:id/status', authenticateToken, authorizeRoles('delivery', 'admin'), deliveriesValidation.updateDeliveryStatus, deliveriesController.updateDeliveryStatus);

module.exports = router;
