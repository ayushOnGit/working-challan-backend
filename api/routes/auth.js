const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticateToken, requirePermission } = require('../middlewares/auth.middleware');

// Public routes (no authentication required)
router.post('/login', AuthController.companyLogin);

// Protected routes (authentication required)
router.get('/profile', authenticateToken, AuthController.getProfile);
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/permission/:resource/:action', authenticateToken, AuthController.checkPermission);

// Admin only routes
router.post('/initialize-rbac', authenticateToken, requirePermission('user_management', 'write'), AuthController.initializeRBAC);

module.exports = router;
