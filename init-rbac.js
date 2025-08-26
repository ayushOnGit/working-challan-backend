const AuthService = require('./api/services/auth.service');

async function initializeEverything() {
  try {
    console.log('🚀 Initializing RBAC system...');
    
    // Step 1: Initialize RBAC (create roles, permissions, role-permissions)
    const rbacResult = await AuthService.initializeRBAC();
    console.log('✅ RBAC initialized:', rbacResult);
    
    // Step 2: Ensure default admin user exists
    console.log('🔧 Creating default admin user...');
    const adminUser = await AuthService.ensureDefaultAdmin();
    console.log('✅ Default admin created:', adminUser);
    
    // Step 3: Verify everything is working
    console.log('🔍 Verifying setup...');
    const users = await AuthService.getAllUsers();
    const roles = await AuthService.getAllRoles();
    const permissions = await AuthService.getAllPermissions();
    
    console.log('📊 Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Roles: ${roles.length}`);
    console.log(`- Permissions: ${permissions.length}`);
    
    if (users.length > 0) {
      const admin = users.find(u => u.email === 'ayush.singh@vutto.in');
      if (admin) {
        console.log('👑 Admin user permissions:', admin.permissions);
      }
    }
    
    console.log('🎉 RBAC system is ready!');
    
  } catch (error) {
    console.error('❌ Failed to initialize RBAC:', error);
  } finally {
    process.exit(0);
  }
}

initializeEverything();
