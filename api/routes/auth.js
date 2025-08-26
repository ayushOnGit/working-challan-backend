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

// Debug route to check user permissions (temporary)
router.get('/debug-permissions', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Debug - Full user object:', JSON.stringify(req.user, null, 2));
    console.log('🔍 Debug - User permissions:', req.userInfo?.permissions);
    
    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role?.name,
        permissions: req.userInfo?.permissions
      },
      hasUserManagementRead: req.userInfo?.permissions?.some(p => 
        p.resource === 'user_management' && p.action === 'read'
      ),
      fullUserObject: req.user
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
