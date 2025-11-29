const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');
const productsValidation = require('../middleware/products.validation');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/', productsController.getProducts);
router.get('/:id', productsController.getProductById);
router.post('/', authenticateToken, authorizeRoles('seller'), productsValidation.createProduct, productsController.createProduct);
router.put('/:id', authenticateToken, authorizeRoles('seller'), productsValidation.updateProduct, productsController.updateProduct);
router.delete('/:id', authenticateToken, authorizeRoles('seller', 'admin'), productsController.deleteProduct);

module.exports = router;
