const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRBAC() {
  try {
    console.log('🔍 Testing RBAC database...');
    
    // Check if tables exist and have data
    const roles = await prisma.company_roles.findMany();
    console.log('📋 Roles found:', roles.length);
    console.log('Roles:', roles);
    
    const permissions = await prisma.company_permissions.findMany();
    console.log('🔐 Permissions found:', permissions.length);
    console.log('Permissions:', permissions);
    
    const users = await prisma.company_users.findMany();
    console.log('👥 Users found:', users.length);
    console.log('Users:', users);
    
    if (users.length > 0) {
      const firstUser = await prisma.company_users.findFirst({
        include: {
          role: true,
          user_permissions: {
            include: {
              permission: true
            }
          }
        }
      });
      console.log('👤 First user with details:', JSON.stringify(firstUser, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error testing RBAC:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRBAC();
