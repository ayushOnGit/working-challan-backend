const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticateToken, requirePermission } = require('../middlewares/auth.middleware');

// Public routes (no authentication required)
router.post('/google-login', AuthController.googleLogin); // New Google OAuth route
router.post('/login', AuthController.companyLogin); // Legacy email login
router.post('/make-admin', AuthController.makeAdmin); // Make user admin (for initial setup)
router.post('/ensure-default-admin', AuthController.ensureDefaultAdmin); // Ensure default admin exists

// Protected routes (authentication required)
router.get('/profile', authenticateToken, AuthController.getProfile);
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/permission/:resource/:action', authenticateToken, AuthController.checkPermission);

// RBAC Management routes (admin only)
router.get('/users', authenticateToken, requirePermission('user_management', 'read'), AuthController.getAllUsers);
router.get('/roles', authenticateToken, requirePermission('user_management', 'read'), AuthController.getAllRoles);
router.get('/permissions', authenticateToken, requirePermission('user_management', 'read'), AuthController.getAllPermissions);
router.put('/users/role', authenticateToken, requirePermission('user_management', 'write'), AuthController.updateUserRole);
router.post('/users/permissions/grant', authenticateToken, requirePermission('user_management', 'write'), AuthController.grantUserPermission);
router.post('/users/permissions/revoke', authenticateToken, requirePermission('user_management', 'write'), AuthController.revokeUserPermission);

// Admin only routes
router.post('/initialize-rbac', authenticateToken, requirePermission('user_management', 'write'), AuthController.initializeRBAC);

module.exports = router;
