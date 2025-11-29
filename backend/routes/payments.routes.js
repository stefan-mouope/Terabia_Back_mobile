const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const paymentsValidation = require('../middleware/payments.validation');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.post('/initiate', authenticateToken, authorizeRoles('buyer'), paymentsValidation.initiatePayment, paymentsController.initiatePayment);
router.post('/webhook', paymentsController.handleWebhook); // Webhook usually doesn't need app-level auth
router.get('/:id', authenticateToken, paymentsController.getTransactionById);

module.exports = router;
