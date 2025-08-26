// Test script for Prisma connection
console.log('🧪 Testing Prisma Connection...\n');

try {
  const prisma = require('./db/prisma/prisma');
  console.log('✅ Prisma client loaded:', !!prisma);
  
  if (prisma) {
    console.log('✅ Prisma client is defined');
    console.log('✅ Prisma client type:', typeof prisma);
    
    // Test database connection
    console.log('\n📡 Testing database connection...');
    prisma.$connect()
      .then(() => {
        console.log('✅ Database connection successful');
        
        // Test a simple query
        return prisma.company_roles.findFirst();
      })
      .then((result) => {
        console.log('✅ Database query successful');
        console.log('Query result:', result);
        
        return prisma.$disconnect();
      })
      .then(() => {
        console.log('✅ Database disconnected successfully');
        console.log('\n🎉 All Prisma tests passed!');
      })
      .catch((error) => {
        console.error('❌ Database test failed:', error.message);
        prisma.$disconnect();
      });
      
  } else {
    console.log('❌ Prisma client is undefined');
  }
  
} catch (error) {
  console.error('❌ Error loading Prisma:', error.message);
  console.error('Stack trace:', error.stack);
}
