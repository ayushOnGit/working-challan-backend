const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRolePermissions() {
  try {
    console.log('🔍 Checking role permissions...');
    
    // Check role_permissions table
    const rolePermissions = await prisma.company_role_permissions.findMany({
      include: {
        role: true,
        permission: true
      }
    });
    
    console.log('📋 Role permissions found:', rolePermissions.length);
    console.log('Role permissions:', JSON.stringify(rolePermissions, null, 2));
    
    // Check if admin role has permissions
    const adminRole = await prisma.company_roles.findFirst({
      where: { name: 'admin' },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
    
    console.log('👑 Admin role with permissions:', JSON.stringify(adminRole, null, 2));
    
  } catch (error) {
    console.error('❌ Error checking role permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRolePermissions();
