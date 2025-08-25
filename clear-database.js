const { PrismaClient } = require('@prisma/client');

async function clearDatabase() {
  try {
    console.log('🗑️ Clearing database...');
    
    const prisma = new PrismaClient();
    
    // Clear the challan table
    console.log('🧹 Clearing challan table...');
    const deleteResult = await prisma.challan.deleteMany({});
    
    console.log(`✅ Successfully deleted ${deleteResult.count} records from challan table`);
    
    // Verify the table is empty
    const remainingRecords = await prisma.challan.count();
    console.log(`📊 Remaining records in challan table: ${remainingRecords}`);
    
    await prisma.$disconnect();
    
    if (remainingRecords === 0) {
      console.log('🎉 Database cleared successfully!');
    } else {
      console.log('⚠️ Some records still remain in the database');
    }
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
}

// Run the clear operation
clearDatabase().catch(console.error);
