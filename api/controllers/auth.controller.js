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

  /**
   * Make a specific user admin (for initial setup)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async makeAdmin(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        throw new APIError({ message: 'Email is required', status: 400 });
      }
      
      // Make the user admin
      const result = await AuthService.makeUserAdmin(email);
      
      res.status(200).json({
        success: true,
        message: `User ${email} is now admin`,
        data: result
      });
      
    } catch (error) {
      console.error('Make admin error:', error);
      
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
   * Get all users with roles and permissions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllUsers(req, res) {
    try {
      const users = await AuthService.getAllUsers();
      
      res.status(200).json({
        success: true,
        data: users
      });
      
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get all available roles
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllRoles(req, res) {
    try {
      const roles = await AuthService.getAllRoles();
      
      res.status(200).json({
        success: true,
        data: roles
      });
      
    } catch (error) {
      console.error('Get all roles error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get all available permissions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllPermissions(req, res) {
    try {
      const permissions = await AuthService.getAllPermissions();
      
      res.status(200).json({
        success: true,
        data: permissions
      });
      
    } catch (error) {
      console.error('Get all permissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Update user role
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateUserRole(req, res) {
    try {
      const { userId, roleId } = req.body;
      
      if (!userId || !roleId) {
        throw new APIError({ message: 'User ID and Role ID are required', status: 400 });
      }
      
      const updatedUser = await AuthService.updateUserRole(parseInt(userId), parseInt(roleId));
      
      res.status(200).json({
        success: true,
        message: `User role updated successfully`,
        data: updatedUser
      });
      
    } catch (error) {
      console.error('Update user role error:', error);
      
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
   * Grant permission to user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async grantUserPermission(req, res) {
    try {
      const { userId, permissionId } = req.body;
      
      if (!userId || !permissionId) {
        throw new APIError({ message: 'User ID and Permission ID are required', status: 400 });
      }
      
      const result = await AuthService.grantUserPermission(parseInt(userId), parseInt(permissionId));
      
      res.status(200).json({
        success: true,
        message: `Permission granted successfully`,
        data: result
      });
      
    } catch (error) {
      console.error('Grant permission error:', error);
      
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
   * Revoke permission from user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async revokeUserPermission(req, res) {
    try {
      const { userId, permissionId } = req.body;
      
      if (!userId || !permissionId) {
        throw new APIError({ message: 'User ID and Permission ID are required', status: 400 });
      }
      
      const result = await AuthService.revokeUserPermission(parseInt(userId), parseInt(permissionId));
      
      res.status(200).json({
        success: true,
        message: `Permission revoked successfully`,
        data: result
      });
      
    } catch (error) {
      console.error('Revoke permission error:', error);
      
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
   * Ensure default admin user exists
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async ensureDefaultAdmin(req, res) {
    try {
      const adminUser = await AuthService.ensureDefaultAdmin();
      
      res.status(200).json({
        success: true,
        message: `Default admin user ensured`,
        data: adminUser
      });
      
    } catch (error) {
      console.error('Ensure default admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new AuthController();
