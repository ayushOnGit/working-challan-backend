const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createV7SettlementRules() {
  try {
    console.log('🚀 Creating Challan Engine V7 Settlement Rules...');
    console.log('='.repeat(60));
    
    const rules = [
      // M Parivahan - HR Challan Rules
      {
        rule_name: 'HR_MPARIVAHAN_160_≤1000',
        source_type: 'mparivahan',
        region: 'HR',
        challan_year_cutoff: null,
        amount_cutoff: 1000,
        settlement_percentage: 160,
        is_active: true
      },
      {
        rule_name: 'HR_MPARIVAHAN_70_>1000',
        source_type: 'mparivahan',
        region: 'HR',
        challan_year_cutoff: null,
        amount_cutoff: 1000,
        settlement_percentage: 70,
        is_active: true
      },
      
      // M Parivahan - UP Challan Rules
      {
        rule_name: 'UP_MPARIVAHAN_100_≤1000',
        source_type: 'mparivahan',
        region: 'UP',
        challan_year_cutoff: null,
        amount_cutoff: 1000,
        settlement_percentage: 100,
        is_active: true
      },
      {
        rule_name: 'UP_MPARIVAHAN_60_>1000',
        source_type: 'mparivahan',
        region: 'UP',
        challan_year_cutoff: null,
        amount_cutoff: 1000,
        settlement_percentage: 60,
        is_active: true
      },
      
      // M Parivahan - DL Challan Rules (All amounts)
      {
        rule_name: 'DL_MPARIVAHAN_60_ALL',
        source_type: 'mparivahan',
        region: 'DL',
        challan_year_cutoff: null,
        amount_cutoff: null,
        settlement_percentage: 60,
        is_active: true
      },
      
      // V Court Rules
      {
        rule_name: 'VCOURT_100_≤2023_≤1000',
        source_type: 'vcourt',
        region: 'ALL',
        challan_year_cutoff: 2023,
        amount_cutoff: 1000,
        settlement_percentage: 100,
        is_active: true
      },
      {
        rule_name: 'VCOURT_20_≤2023_>1000',
        source_type: 'vcourt',
        region: 'ALL',
        challan_year_cutoff: 2023,
        amount_cutoff: 1000,
        settlement_percentage: 20,
        is_active: true
      },
      {
        rule_name: 'VCOURT_100_>2023_≤1000',
        source_type: 'vcourt',
        region: 'ALL',
        challan_year_cutoff: 2024,
        amount_cutoff: 1000,
        settlement_percentage: 100,
        is_active: true
      },
      {
        rule_name: 'VCOURT_60_>2023_>1000',
        source_type: 'vcourt',
        region: 'ALL',
        challan_year_cutoff: 2024,
        amount_cutoff: 1000,
        settlement_percentage: 60,
        is_active: true
      },
      
      // Delhi Police Rules
      {
        rule_name: 'DELHI_POLICE_100_≤2023_≤1000',
        source_type: 'delhi_police',
        region: 'ALL',
        challan_year_cutoff: 2023,
        amount_cutoff: 1000,
        settlement_percentage: 100,
        is_active: true
      },
      {
        rule_name: 'DELHI_POLICE_20_≤2023_>1000',
        source_type: 'delhi_police',
        region: 'ALL',
        challan_year_cutoff: 2023,
        amount_cutoff: 1000,
        settlement_percentage: 20,
        is_active: true
      },
      {
        rule_name: 'DELHI_POLICE_100_>2023_≤1000',
        source_type: 'delhi_police',
        region: 'ALL',
        challan_year_cutoff: 2024,
        amount_cutoff: 1000,
        settlement_percentage: 100,
        is_active: true
      },
      {
        rule_name: 'DELHI_POLICE_60_>2023_>1000',
        source_type: 'delhi_police',
        region: 'ALL',
        challan_year_cutoff: 2024,
        amount_cutoff: 1000,
        settlement_percentage: 60,
        is_active: true
      }
    ];

    console.log(`📋 Creating ${rules.length} settlement rules...`);
    console.log('');

    for (const rule of rules) {
      const createdRule = await prisma.settlement_configs.create({
        data: rule
      });
      
      console.log(`✅ Created: ${rule.rule_name}`);
      console.log(`   Source: ${rule.source_type} | Region: ${rule.region} | Year: ${rule.challan_year_cutoff || 'All'} | Amount: ${rule.amount_cutoff || 'All'} | Settlement: ${rule.settlement_percentage}%`);
    }

    console.log('');
    console.log('🎉 All V7 settlement rules created successfully!');
    console.log('='.repeat(60));
    
    // Verify creation
    const totalRules = await prisma.settlement_configs.count();
    console.log(`📊 Total settlement rules in database: ${totalRules}`);
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Error creating settlement rules:', error);
    process.exit(1);
  }
}

createV7SettlementRules();
