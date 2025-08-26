const AuthService = require('../services/auth.service');
const APIError = require('../utils/APIError');

/**
 * Authentication middleware to verify JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      throw new APIError({ message: 'Access token required', status: 401 });
    }
    
    // Verify token
    const decoded = AuthService.verifyToken(token);
    
    // Get fresh user data from database with full relations
    const user = await AuthService.authenticateCompanyUser(decoded.email);
    
    if (!user) {
      throw new APIError({ message: 'User not found or inactive', status: 401 });
    }
    
    // Add FULL user info to request (needed for permission checks)
    req.user = user; // Full user object with relations
    req.userInfo = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role?.name || 'employee',
      permissions: AuthService.extractPermissions(user)
    };
    
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof APIError) {
      res.status(error.status).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  }
};

/**
 * Permission middleware - FIXED VERSION
 */
const requirePermission = (resource, action) => {
  return (req, res, next) => {
    try {
      const user = req.user; // Full user object
      
      if (!user) {
        throw new APIError({ message: 'User not authenticated', status: 401 });
      }
      
      // Use the AuthService method with full user object
      const hasPermission = AuthService.hasPermission(user, resource, action);
      
      if (!hasPermission) {
        // Log for debugging
        console.log(`Permission denied for user ${user.email}: ${resource}:${action}`);
        console.log('User permissions:', AuthService.extractPermissions(user));
        
        throw new APIError({ 
          message: `Insufficient permissions. Required: ${resource}:${action}`, 
          status: 403 
        });
      }
      
      next();
      
    } catch (error) {
      console.error('Permission check error:', error);
      
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
  };
};

/**
 * Alternative: Simple permission check using extracted permissions
 */
const requirePermissionSimple = (resource, action) => {
  return (req, res, next) => {
    try {
      const userInfo = req.userInfo; // Simplified user info
      
      if (!userInfo) {
        throw new APIError({ message: 'User not authenticated', status: 401 });
      }
      
      // Check permissions directly from extracted array
      const hasPermission = userInfo.permissions.some(p => 
        p.resource === resource && p.action === action
      );
      
      if (!hasPermission) {
        console.log(`Permission denied for user ${userInfo.email}: ${resource}:${action}`);
        console.log('User permissions:', userInfo.permissions);
        
        throw new APIError({ 
          message: `Insufficient permissions. Required: ${resource}:${action}`, 
          status: 403 
        });
      }
      
      next();
      
    } catch (error) {
      console.error('Permission check error:', error);
      
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
  };
};

/**
 * Role-based access control middleware
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const userInfo = req.userInfo;
      
      if (!userInfo) {
        throw new APIError({ message: 'User not authenticated', status: 401 });
      }
      
      if (!Array.isArray(allowedRoles)) {
        allowedRoles = [allowedRoles];
      }
      
      if (!allowedRoles.includes(userInfo.role)) {
        throw new APIError({ 
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`, 
          status: 403 
        });
      }
      
      next();
      
    } catch (error) {
      console.error('Role check error:', error);
      
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
  };
};

/**
 * Optional authentication middleware
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        const decoded = AuthService.verifyToken(token);
        const user = await AuthService.authenticateCompanyUser(decoded.email);
        
        if (user) {
          req.user = user;
          req.userInfo = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role?.name || 'employee',
            permissions: AuthService.extractPermissions(user)
          };
        }
      } catch (error) {
        console.log('Optional auth: Invalid token, continuing without user');
      }
    }
    
    next();
    
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticateToken,
  requirePermission,
  requirePermissionSimple, // Use this if the main one doesn't work
  requireRole,
  optionalAuth
};
