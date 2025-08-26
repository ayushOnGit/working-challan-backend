const AuthService = require('../services/auth.service');
const APIError = require('../utils/APIError');

/**
 * Authentication middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
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
    
    // Get fresh user data from database
    const user = await AuthService.authenticateCompanyUser(decoded.email);
    
    if (!user) {
      throw new APIError({ message: 'User not found or inactive', status: 401 });
    }
    
    // Store full user object for permission checks
    req.user = user;
    
    // Also store simplified user info for backward compatibility
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
 * Permission middleware to check if user has access to specific resource/action
 * @param {string} resource - Resource to check access for
 * @param {string} action - Action to check access for
 * @returns {Function} - Express middleware function
 */
const requirePermission = (resource, action) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        throw new APIError({ message: 'User not authenticated', status: 401 });
      }
      
      const hasPermission = AuthService.hasPermission(user, resource, action);
      
      if (!hasPermission) {
        throw new APIError({ message: `Insufficient permissions. Required: ${resource}:${action}`, status: 403 });
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
 * @param {Array} allowedRoles - Array of allowed role names
 * @returns {Function} - Express middleware function
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        throw new APIError({ message: 'User not authenticated', status: 401 });
      }
      
      if (!Array.isArray(allowedRoles)) {
        allowedRoles = [allowedRoles];
      }
      
      if (!allowedRoles.includes(user.role)) {
        throw new APIError({ message: `Access denied. Required roles: ${allowedRoles.join(', ')}`, status: 403 });
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
 * Optional authentication middleware (doesn't fail if no token)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
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
          // Store full user object for permission checks
          req.user = user;
          
          // Also store simplified user info for backward compatibility
          req.userInfo = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role?.name || 'employee',
            permissions: AuthService.extractPermissions(user)
          };
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Optional auth: Invalid token, continuing without user');
      }
    }
    
    next();
    
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  requirePermission,
  requireRole,
  optionalAuth
};
