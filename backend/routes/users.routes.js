const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const usersValidation = require('../middleware/users.validation');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/:id', authenticateToken, usersController.getUserById);
router.put('/:id', authenticateToken, usersValidation.updateUser, usersController.updateUser);

module.exports = router;
