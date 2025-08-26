const AuthService = require('../services/auth.service');
const APIError = require('../utils/APIError');

class AuthController {
  
  /**
   * Company user login with Google OAuth
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async googleLogin(req, res) {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        throw new APIError({ message: 'Google ID token is required', status: 400 });
      }
      
      // Authenticate user with Google OAuth
      const user = await AuthService.authenticateCompanyUserWithGoogle(idToken);
      
      // Generate JWT token
      const token = AuthService.generateToken(user);
      
      // Return user info and token
      res.status(200).json({
        success: true,
        message: 'Google login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role?.name || 'employee',
            permissions: AuthService.extractPermissions(user)
          },
          token
        }
      });
      
    } catch (error) {
      console.error('Google login error:', error);
      
      if (error instanceof APIError) {
        res.status(error.status).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: error.message || 'Google authentication failed'
        });
      }
    }
  }
  
  /**
   * Company user login (legacy method)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async companyLogin(req, res) {
    try {
      const { email, name } = req.body;
      
      if (!email) {
        throw new APIError({ message: 'Email is required', status: 400 });
      }
      
      // Validate company email domain
      if (!AuthService.validateCompanyEmail(email)) {
        throw new APIError({ message: 'Only @vutto.in email addresses are allowed', status: 403 });
      }
      
      // Create or update user
      const user = await AuthService.createOrUpdateCompanyUser({
        email,
        name: name || email.split('@')[0] // Use email prefix as name if not provided
      });
      
      // Generate JWT token
      const token = AuthService.generateToken(user);
      
      // Return user info and token
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role?.name || 'employee',
            permissions: AuthService.extractPermissions(user)
          },
          token
        }
      });
      
    } catch (error) {
      console.error('Company login error:', error);
      
      if (error instanceof APIError) {
        res.status(error.status).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }
  
  /**
   * Get current user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProfile(req, res) {
    try {
      const user = req.user; // Set by auth middleware
      
      if (!user) {
        throw new APIError({ message: 'User not authenticated', status: 401 });
      }
      
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.permissions
          }
        }
      });
      
    } catch (error) {
      console.error('Get profile error:', error);
      
      if (error instanceof APIError) {
        res.status(error.status).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }
  
  /**
   * Logout user (invalidate token)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    try {
      // In a real implementation, you might want to blacklist the token
      // For now, we'll just return success (client should remove token)
      
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
      
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  /**
   * Initialize RBAC system (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async initializeRBAC(req, res) {
    try {
      const user = req.user;
      
      // Check if user has admin permission
      if (!AuthService.hasPermission(user, 'user_management', 'write')) {
        throw new APIError({ message: 'Insufficient permissions to initialize RBAC', status: 403 });
      }
      
      // Initialize RBAC system
      const result = await AuthService.initializeRBAC();
      
      res.status(200).json({
        success: true,
        message: 'RBAC system initialized successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Initialize RBAC error:', error);
      
      if (error instanceof APIError) {
        res.status(error.status).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }
  
  /**
   * Check user permissions for a specific resource and action
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async checkPermission(req, res) {
    try {
      const user = req.user;
      const { resource, action } = req.params;
      
      if (!user) {
        throw new APIError({ message: 'User not authenticated', status: 401 });
      }
      
      if (!resource || !action) {
        throw new APIError({ message: 'Resource and action are required', status: 400 });
      }
      
      const hasPermission = AuthService.hasPermission(user, resource, action);
      
      res.status(200).json({
        success: true,
        data: {
          hasPermission,
          resource,
          action,
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          }
        }
      });
      
    } catch (error) {
      console.error('Check permission error:', error);
      
      if (error instanceof APIError) {
        res.status(error.status).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }
}

module.exports = new AuthController();
