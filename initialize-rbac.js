const { PrismaClient } = require('@prisma/client');
const AuthService = require('./api/services/auth.service');

const prisma = new PrismaClient();

async function initializeRBAC() {
  try {
    console.log('🚀 Starting RBAC initialization...');
    
    // Initialize RBAC system
    const result = await AuthService.initializeRBAC();
    
    console.log('✅ RBAC system initialized successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Roles created: ${Object.keys(result.roles).length}`);
    console.log(`   Permissions created: ${Object.keys(result.permissions).length}`);
    
    console.log('\n👥 Roles:');
    Object.entries(result.roles).forEach(([name, role]) => {
      console.log(`   - ${name}: ${role.description}`);
    });
    
    console.log('\n🔐 Permissions by Role:');
    Object.entries(result.rolePermissions).forEach(([roleName, permissionIds]) => {
      const permissionNames = permissionIds.map(id => {
        const perm = Object.values(result.permissions).find(p => p.id === id);
        return perm ? perm.name : 'Unknown';
      });
      console.log(`   ${roleName}: ${permissionNames.join(', ')}`);
    });
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Create your first admin user by logging in with @vutto.in email');
    console.log('   2. The system will automatically assign the "admin" role');
    console.log('   3. You can then manage other users and permissions');
    
  } catch (error) {
    console.error('❌ Error initializing RBAC:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  initializeRBAC();
}

module.exports = { initializeRBAC };
