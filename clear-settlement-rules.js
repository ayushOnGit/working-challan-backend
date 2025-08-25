const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearSettlementRules() {
  try {
    console.log('🗑️ Clearing settlement rules...');
    
    const result = await prisma.settlement_configs.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.count} settlement rules`);
    console.log('🎉 Settlement rules database cleared!');
    
  } catch (error) {
    console.error('❌ Error clearing settlement rules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
clearSettlementRules();
