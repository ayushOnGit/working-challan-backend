const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const prisma = new PrismaClient();

class AuthService {
  
  constructor() {
    // Initialize Google OAuth client
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
  }
  
  /**
   * Validate Gmail domain for company users
   * @param {string} email - User email
   * @returns {boolean} - True if valid company email
   */
  validateCompanyEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }
    
    // Check if email ends with @vutto.in
    return email.toLowerCase().endsWith('@vutto.in');
  }

  /**
   * Verify Google ID token and extract user information
   * @param {string} idToken - Google ID token from frontend
   * @returns {Object} - Verified user data from Google
   */
  async verifyGoogleToken(idToken) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      
      // Verify the email domain
      if (!this.validateCompanyEmail(payload.email)) {
        throw new Error('Only @vutto.in email addresses are allowed');
      }
      
      // Verify email is verified by Google
      if (!payload.email_verified) {
        throw new Error('Email address not verified by Google');
      }
      
      return {
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture,
        googleId: payload.sub
      };
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new Error('Invalid Google authentication token');
    }
  }

  /**
   * Create or update company user with Google OAuth
   * @param {Object} googleUserData - Verified user data from Google
   * @returns {Object} - Created/updated user
   */
  async createOrUpdateCompanyUserWithGoogle(googleUserData) {
    try {
      const { email, name, picture, googleId } = googleUserData;
      
      // Validate company email
      if (!this.validateCompanyEmail(email)) {
        throw new Error('Only @vutto.in email addresses are allowed');
      }
      
      // Get or create default role
      let role = await prisma.company_roles.findFirst({
        where: { name: 'employee', is_active: true }
      });
      
      if (!role) {
        // Create default employee role if it doesn't exist
        role = await prisma.company_roles.create({
          data: {
            name: 'employee',
            description: 'Default employee role for company users'
          }
        });
      }
      
      // Create or update user
      const user = await prisma.company_users.upsert({
        where: { email: email.toLowerCase() },
        update: {
          name,
          last_login: new Date(),
          updated_at: new Date()
        },
        create: {
          email: email.toLowerCase(),
          name,
          role_id: role.id
        }
      });
      
      return user;
    } catch (error) {
      console.error('Error creating/updating company user with Google:', error);
      throw error;
    }
  }

  /**
   * Company user login with Google OAuth
   * @param {string} idToken - Google ID token
   * @returns {Object} - User with permissions
   */
  async authenticateCompanyUserWithGoogle(idToken) {
    try {
      // Verify Google token
      const googleUserData = await this.verifyGoogleToken(idToken);
      
      // Create or update user
      const user = await this.createOrUpdateCompanyUserWithGoogle(googleUserData);
      
      // Get user with role and permissions
      const userWithPermissions = await prisma.company_users.findFirst({
        where: { 
          id: user.id,
          is_active: true
        },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          },
          user_permissions: {
            include: {
              permission: true
            }
          }
        }
      });
      
      if (!userWithPermissions) {
        throw new Error('User not found or inactive');
      }
      
      // Update last login
      await prisma.company_users.update({
        where: { id: user.id },
        data: { last_login: new Date() }
      });
      
      return userWithPermissions;
    } catch (error) {
      console.error('Error authenticating company user with Google:', error);
      throw error;
    }
  }

  /**
   * Legacy method for backward compatibility
   * @param {string} email - User email
   * @returns {Object} - User with permissions
   */
  async authenticateCompanyUser(email) {
    try {
      // Validate company email
      if (!this.validateCompanyEmail(email)) {
        throw new Error('Only @vutto.in email addresses are allowed');
      }
      
      // Find user with role and permissions
      const user = await prisma.company_users.findFirst({
        where: { 
          email: email.toLowerCase(),
          is_active: true
        },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          },
          user_permissions: {
            include: {
              permission: true
            }
          }
        }
      });
      
      if (!user) {
        throw new Error('User not found or inactive');
      }
      
      // Update last login
      await prisma.company_users.update({
        where: { id: user.id },
        data: { last_login: new Date() }
      });
      
      return user;
    } catch (error) {
      console.error('Error authenticating company user:', error);
      throw error;
    }
  }

  /**
   * Create or update company user (legacy method)
   * @param {Object} userData - User data
   * @returns {Object} - Created/updated user
   */
  async createOrUpdateCompanyUser(userData) {
    try {
      const { email, name, roleName = 'employee' } = userData;
      
      // Validate company email
      if (!this.validateCompanyEmail(email)) {
        throw new Error('Only @vutto.in email addresses are allowed');
      }
      
      // Get or create default role
      let role = await prisma.company_roles.findFirst({
        where: { name: roleName, is_active: true }
      });
      
      if (!role) {
        // Create default employee role if it doesn't exist
        role = await prisma.company_roles.create({
          data: {
            name: roleName,
            description: `Default ${roleName} role for company users`
          }
        });
      }
      
      // Create or update user
      const user = await prisma.company_users.upsert({
        where: { email: email.toLowerCase() },
        update: {
          name,
          role_id: role.id,
          last_login: new Date(),
          updated_at: new Date()
        },
        create: {
          email: email.toLowerCase(),
          name,
          role_id: role.id
        }
      });
      
      return user;
    } catch (error) {
      console.error('Error creating/updating company user:', error);
      throw error;
    }
  }

  /**
   * Generate JWT token for user
   * @param {Object} user - User object
   * @returns {string} - JWT token
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      permissions: this.extractPermissions(user)
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET || 'vutto-secret-key', {
      expiresIn: '24h'
    });
  }

  /**
   * Extract user permissions from role and user-specific permissions
   * @param {Object} user - User object with role and permissions
   * @returns {Array} - Array of permission objects
   */
  extractPermissions(user) {
    const permissions = new Map();
    
    // Add role-based permissions
    if (user.role && user.role.permissions) {
      user.role.permissions.forEach(rp => {
        if (rp.permission && rp.permission.is_active) {
          const key = `${rp.permission.resource}:${rp.permission.action}`;
          permissions.set(key, {
            resource: rp.permission.resource,
            action: rp.permission.action,
            source: 'role',
            role: user.role.name
          });
        }
      });
    }
    
    // Add user-specific permissions (override role permissions)
    if (user.user_permissions) {
      user.user_permissions.forEach(up => {
        if (up.permission && up.permission.is_active && up.granted) {
          const key = `${up.permission.resource}:${up.permission.action}`;
          permissions.set(key, {
            resource: up.permission.resource,
            action: up.permission.action,
            source: 'user',
            granted: up.granted
          });
        }
      });
    }
    
    return Array.from(permissions.values());
  }

  /**
   * Check if user has specific permission
   * @param {Object} user - User object
   * @param {string} resource - Resource to check
   * @param {string} action - Action to check
   * @returns {boolean} - True if user has permission
   */
  hasPermission(user, resource, action) {
    if (!user || !user.role) {
      return false;
    }
    
    const permissions = this.extractPermissions(user);
    return permissions.some(p => 
      p.resource === resource && p.action === action
    );
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} - Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'vutto-secret-key');
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Initialize default roles and permissions
   * @returns {Object} - Initialization result
   */
  async initializeRBAC() {
    try {
      console.log('🚀 Initializing RBAC system...');
      
      // Create default roles
      const roles = [
        { name: 'admin', description: 'Full system access' },
        { name: 'manager', description: 'Management level access' },
        { name: 'employee', description: 'Basic employee access' }
      ];
      
      const createdRoles = {};
      for (const roleData of roles) {
        const role = await prisma.company_roles.upsert({
          where: { name: roleData.name },
          update: {},
          create: roleData
        });
        createdRoles[role.name] = role;
      }
      
      // Create default permissions
      const permissions = [
        // Settlement Config permissions
        { name: 'settlement_config_read', description: 'Read settlement configurations', resource: 'settlement_config', action: 'read' },
        { name: 'settlement_config_write', description: 'Write settlement configurations', resource: 'settlement_config', action: 'write' },
        { name: 'settlement_config_delete', description: 'Delete settlement configurations', resource: 'settlement_config', action: 'delete' },
        
        // Challan Dashboard permissions
        { name: 'challan_dashboard_read', description: 'Read challan dashboard', resource: 'challan_dashboard', action: 'read' },
        { name: 'challan_dashboard_write', description: 'Write challan data', resource: 'challan_dashboard', action: 'write' },
        { name: 'challan_dashboard_delete', description: 'Delete challan data', resource: 'challan_dashboard', action: 'delete' },
        
        // User Management permissions
        { name: 'user_management_read', description: 'Read user information', resource: 'user_management', action: 'read' },
        { name: 'user_management_write', description: 'Manage users', resource: 'user_management', action: 'write' },
        { name: 'user_management_delete', description: 'Delete users', resource: 'user_management', action: 'delete' }
      ];
      
      const createdPermissions = {};
      for (const permData of permissions) {
        const permission = await prisma.company_permissions.upsert({
          where: { name: permData.name },
          update: {},
          create: permData
        });
        createdPermissions[permission.name] = permission;
      }
      
      // Assign permissions to roles
      const rolePermissions = {
        admin: Object.values(createdPermissions).map(p => p.id), // All permissions
        manager: [
          'settlement_config_read', 'settlement_config_write',
          'challan_dashboard_read', 'challan_dashboard_write',
          'user_management_read'
        ].map(name => createdPermissions[name]?.id).filter(Boolean),
        employee: [
          'settlement_config_read',
          'challan_dashboard_read'
        ].map(name => createdPermissions[name]?.id).filter(Boolean)
      };
      
      // Clear existing role permissions
      await prisma.company_role_permissions.deleteMany({});
      
      // Create new role permissions
      for (const [roleName, permissionIds] of Object.entries(rolePermissions)) {
        const role = createdRoles[roleName];
        if (role) {
          for (const permissionId of permissionIds) {
            await prisma.company_role_permissions.create({
              data: {
                role_id: role.id,
                permission_id: permissionId
              }
            });
          }
        }
      }
      
      console.log('✅ RBAC system initialized successfully');
      return {
        roles: createdRoles,
        permissions: createdPermissions,
        rolePermissions
      };
      
    } catch (error) {
      console.error('❌ Error initializing RBAC:', error);
      throw error;
    }
  }

  /**
   * Make a specific user admin (for initial setup)
   * @param {string} email - User email
   * @returns {Object} - Updated user
   */
  async makeUserAdmin(email) {
    try {
      console.log(`🔧 Making user ${email} admin...`);
      
      // Get admin role
      const adminRole = await prisma.company_roles.findFirst({
        where: { name: 'admin' }
      });
      
      if (!adminRole) {
        throw new Error('Admin role not found. Please run initializeRBAC first.');
      }
      
      // Update user to admin
      const updatedUser = await prisma.company_users.update({
        where: { email: email.toLowerCase() },
        data: { role_id: adminRole.id }
      });
      
      console.log(`✅ User ${email} is now admin`);
      return updatedUser;
      
    } catch (error) {
      console.error(`❌ Error making user admin:`, error);
      throw error;
    }
  }

  /**
   * Get all users with their roles and permissions
   * @returns {Array} - List of users with role and permission details
   */
  async getAllUsers() {
    try {
      const users = await prisma.company_users.findMany({
        where: { is_active: true },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          },
          user_permissions: {
            include: {
              permission: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      // Format user data with permissions
      return users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        last_login: user.last_login,
        created_at: user.created_at,
        permissions: this.extractPermissions(user)
      }));
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get all available roles
   * @returns {Array} - List of roles
   */
  async getAllRoles() {
    try {
      return await prisma.company_roles.findMany({
        where: { is_active: true },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      console.error('❌ Error fetching roles:', error);
      throw error;
    }
  }

  /**
   * Get all available permissions
   * @returns {Array} - List of permissions
   */
  async getAllPermissions() {
    try {
      return await prisma.company_permissions.findMany({
        where: { is_active: true },
        orderBy: [{ resource: 'asc' }, { action: 'asc' }]
      });
    } catch (error) {
      console.error('❌ Error fetching permissions:', error);
      throw error;
    }
  }

  /**
   * Update user role
   * @param {number} userId - User ID
   * @param {number} roleId - New role ID
   * @returns {Object} - Updated user
   */
  async updateUserRole(userId, roleId) {
    try {
      const updatedUser = await prisma.company_users.update({
        where: { id: userId },
        data: { role_id: roleId },
        include: {
          role: true
        }
      });

      console.log(`✅ User ${updatedUser.email} role updated to ${updatedUser.role.name}`);
      return updatedUser;
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      throw error;
    }
  }

  /**
   * Grant permission to user
   * @param {number} userId - User ID
   * @param {number} permissionId - Permission ID
   * @returns {Object} - Created permission
   */
  async grantUserPermission(userId, permissionId) {
    try {
      const userPermission = await prisma.company_user_permissions.upsert({
        where: {
          user_id_permission_id: {
            user_id: userId,
            permission_id: permissionId
          }
        },
        update: {
          granted: true,
          granted_at: new Date()
        },
        create: {
          user_id: userId,
          permission_id: permissionId,
          granted: true
        }
      });

      console.log(`✅ Permission granted to user ${userId}`);
      return userPermission;
    } catch (error) {
      console.error('❌ Error granting permission:', error);
      throw error;
    }
  }

  /**
   * Revoke permission from user
   * @param {number} userId - User ID
   * @param {number} permissionId - Permission ID
   * @returns {Object} - Updated permission
   */
  async revokeUserPermission(userId, permissionId) {
    try {
      const userPermission = await prisma.company_user_permissions.update({
        where: {
          user_id_permission_id: {
            user_id: userId,
            permission_id: permissionId
          }
        },
        data: {
          granted: false,
          granted_at: new Date()
        }
      });

      console.log(`✅ Permission revoked from user ${userId}`);
      return userPermission;
    } catch (error) {
      console.error('❌ Error revoking permission:', error);
      throw error;
    }
  }

  /**
   * Ensure default admin user exists with full permissions
   * @returns {Object} - Admin user
   */
  async ensureDefaultAdmin() {
    try {
      const adminEmail = 'ayush.singh@vutto.in';
      
      // Check if admin user exists
      let adminUser = await prisma.company_users.findFirst({
        where: { email: adminEmail }
      });

      if (!adminUser) {
        // Create admin user if doesn't exist
        const adminRole = await prisma.company_roles.findFirst({
          where: { name: 'admin' }
        });

        if (!adminRole) {
          throw new Error('Admin role not found. Please run initializeRBAC first.');
        }

        adminUser = await prisma.company_users.create({
          data: {
            email: adminEmail,
            name: 'Ayush Singh',
            role_id: adminRole.id
          }
        });

        console.log(`✅ Created admin user: ${adminEmail}`);
      } else {
        // Ensure existing user has admin role
        const adminRole = await prisma.company_roles.findFirst({
          where: { name: 'admin' }
        });

        if (adminUser.role_id !== adminRole.id) {
          adminUser = await this.updateUserRole(adminUser.id, adminRole.id);
          console.log(`✅ Updated user ${adminEmail} to admin role`);
        }
      }

      return adminUser;
    } catch (error) {
      console.error('❌ Error ensuring default admin:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
