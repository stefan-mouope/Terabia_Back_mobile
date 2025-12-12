const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');

router.post(
  '/',
  upload.array('images', 5), // Max 5 images
  productController.createProduct
);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.get('/', productController.getAllProducts);
router.get('/seller/:seller_id', productController.getProductsBySellerId);

module.exports = router;
