const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // middleware JWT

router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/', userController.getAllUsers);
router.get('/stats/:id', userController.getSellerStats);
router.get('/me', protect, userController.getCurrentUser); // <-- ajouté

module.exports = router;
