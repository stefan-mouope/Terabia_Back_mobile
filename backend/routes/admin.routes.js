const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const adminValidation = require('../middleware/admin.validation');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// All admin routes should be protected and only accessible by 'admin' role
router.use(authenticateToken, authorizeRoles('admin'));

router.get('/stats', adminController.getGlobalStats);
router.put('/users/:id/suspend', adminValidation.suspendUser, adminController.suspendUser);

module.exports = router;
