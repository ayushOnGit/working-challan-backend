const AuthService = require('./api/services/auth.service');

async function updateRBACPermissions() {
  try {
    console.log('🔄 Updating RBAC role permissions...');
    
    // Reinitialize RBAC with new permissions
    const result = await AuthService.initializeRBAC();
    
    console.log('✅ RBAC updated successfully!');
    console.log('📋 New role permissions:');
    
    Object.entries(result.rolePermissions).forEach(([roleName, permissionIds]) => {
      console.log(`\n👑 ${roleName.toUpperCase()}:`);
      permissionIds.forEach(permissionId => {
        const permission = Object.values(result.permissions).find(p => p.id === permissionId);
        if (permission) {
          console.log(`  - ${permission.resource}:${permission.action} (${permission.description})`);
        }
      });
    });
    
    console.log('\n🎯 Access Summary:');
    console.log('👑 Admin: Full system access (all permissions)');
    console.log('👔 Manager: Settlement config + Challan database (read/write)');
    console.log('👷 Employee: Challan database only (read/write)');
    
  } catch (error) {
    console.error('❌ Failed to update RBAC:', error);
  } finally {
    process.exit(0);
  }
}

updateRBACPermissions();
