const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createProperSettlementRules() {
  try {
    console.log('🚀 Creating Proper Settlement Rules Based on Source + Date + Amount Combination...');
    console.log('='.repeat(80));
    
    const rules = [
      // ========================================
      // VCOURT RULES (Delhi-based, no region logic)
      // ========================================
      
      // Old challans (≤2023) with low amounts (≤1000): 100% settlement (no discount)
      {
        rule_name: 'VCourt Old Low Amount',
        source_type: 'vcourt',
        region: 'ALL',
        challan_year_cutoff: 2023,
        year_cutoff_logic: '≤',
        amount_cutoff: 1000,
        amount_cutoff_logic: '≤',
        settlement_percentage: 100.00,  // 100% = no discount
        is_active: true
      },
      
      // Old challans (≤2023) with high amounts (>1000): 20% settlement (80% discount)
      {
        rule_name: 'VCourt Old High Amount',
        source_type: 'vcourt',
        region: 'ALL',
        challan_year_cutoff: 2023,
        year_cutoff_logic: '≤',
        amount_cutoff: 1000,
        amount_cutoff_logic: '>',
        settlement_percentage: 20.00,   // 20% = 80% discount
        is_active: true
      },
      
      // New challans (>2023) with low amounts (≤1000): 100% settlement (no discount)
      {
        rule_name: 'VCourt New Low Amount',
        source_type: 'vcourt',
        region: 'ALL',
        challan_year_cutoff: 2023,
        year_cutoff_logic: '>',
        amount_cutoff: 1000,
        amount_cutoff_logic: '≤',
        settlement_percentage: 100.00,  // 100% = no discount
        is_active: true
      },
      
      // New challans (>2023) with high amounts (>1000): 60% settlement (40% discount)
      {
        rule_name: 'VCourt New High Amount',
        source_type: 'vcourt',
        region: 'ALL',
        challan_year_cutoff: 2023,
        year_cutoff_logic: '>',
        amount_cutoff: 1000,
        amount_cutoff_logic: '>',
        settlement_percentage: 60.00,   // 60% = 40% discount
        is_active: true
      },
      
      // ========================================
      // DELHI POLICE RULES (Delhi-based, no region logic)
      // ========================================
      
      // Old challans (≤2023) with low amounts (≤1000): 100% settlement (no discount)
      {
        rule_name: 'Delhi Police Old Low Amount',
        source_type: 'delhi_police',
        region: 'ALL',
        challan_year_cutoff: 2023,
        year_cutoff_logic: '≤',
        amount_cutoff: 1000,
        amount_cutoff_logic: '≤',
        settlement_percentage: 100.00,  // 100% = no discount
        is_active: true
      },
      
      // Old challans (≤2023) with high amounts (>1000): 20% settlement (80% discount)
      {
        rule_name: 'Delhi Police Old High Amount',
        source_type: 'delhi_police',
        region: 'ALL',
        challan_year_cutoff: 2023,
        year_cutoff_logic: '≤',
        amount_cutoff: 1000,
        amount_cutoff_logic: '>',
        settlement_percentage: 20.00,   // 20% = 80% discount
        is_active: true
      },
      
      // New challans (>2023) with low amounts (≤1000): 100% settlement (no discount)
      {
        rule_name: 'Delhi Police New Low Amount',
        source_type: 'delhi_police',
        region: 'ALL',
        challan_year_cutoff: 2023,
        year_cutoff_logic: '>',
        amount_cutoff: 1000,
        amount_cutoff_logic: '≤',
        settlement_percentage: 100.00,  // 100% = no discount
        is_active: true
      },
      
      // New challans (>2023) with high amounts (>1000): 60% settlement (40% discount)
      {
        rule_name: 'Delhi Police New High Amount',
        source_type: 'delhi_police',
        region: 'ALL',
        challan_year_cutoff: 2023,
        year_cutoff_logic: '>',
        amount_cutoff: 1000,
        amount_cutoff_logic: '>',
        settlement_percentage: 60.00,   // 60% = 40% discount
        is_active: true
      },
      
      // ========================================
      // MPARIVAHAN/CARINFO RULES (Region-based logic)
      // ========================================
      
      // Haryana (HR) - Low amounts (≤1000): 160% settlement (60% bonus)
      {
        rule_name: 'Haryana Low Amount',
        source_type: 'mparivahan',
        region: 'HR',
        challan_year_cutoff: null,      // No year cutoff for MParivahan
        year_cutoff_logic: null,
        amount_cutoff: 1000,
        amount_cutoff_logic: '≤',
        settlement_percentage: 160.00,  // 160% = 60% bonus
        is_active: true
      },
      
      // Haryana (HR) - High amounts (>1000): 70% settlement (30% discount)
      {
        rule_name: 'Haryana High Amount',
        source_type: 'mparivahan',
        region: 'HR',
        challan_year_cutoff: null,
        year_cutoff_logic: null,
        amount_cutoff: 1000,
        amount_cutoff_logic: '>',
        settlement_percentage: 70.00,   // 70% = 30% discount
        is_active: true
      },
      
      // Uttar Pradesh (UP) - Low amounts (≤1000): 100% settlement (no discount)
      {
        rule_name: 'UP Low Amount',
        source_type: 'mparivahan',
        region: 'UP',
        challan_year_cutoff: null,
        year_cutoff_logic: null,
        amount_cutoff: 1000,
        amount_cutoff_logic: '≤',
        settlement_percentage: 100.00,  // 100% = no discount
        is_active: true
      },
      
      // Uttar Pradesh (UP) - High amounts (>1000): 60% settlement (40% discount)
      {
        rule_name: 'UP High Amount',
        source_type: 'mparivahan',
        region: 'UP',
        challan_year_cutoff: null,
        year_cutoff_logic: null,
        amount_cutoff: 1000,
        amount_cutoff_logic: '>',
        settlement_percentage: 60.00,   // 60% = 40% discount
        is_active: true
      },
      
      // Delhi (DL) - All amounts: 60% settlement (40% discount)
      {
        rule_name: 'Delhi All Amounts',
        source_type: 'mparivahan',
        region: 'DL',
        challan_year_cutoff: null,
        year_cutoff_logic: null,
        amount_cutoff: null,            // No amount cutoff = all amounts
        amount_cutoff_logic: null,
        settlement_percentage: 60.00,   // 60% = 40% discount
        is_active: true
      }
    ];

    console.log(`📋 Creating ${rules.length} settlement rules...`);
    console.log('');

    // Clear existing rules first
    console.log('🗑️ Clearing existing settlement rules...');
    await prisma.settlement_configs.deleteMany({});
    console.log('✅ Existing rules cleared');

    console.log('');
    console.log('🆕 Creating new settlement rules...');
    console.log('');

    for (const rule of rules) {
      const createdRule = await prisma.settlement_configs.create({
        data: rule
      });
      
      console.log(`✅ Created: ${rule.rule_name}`);
      console.log(`   Source: ${rule.source_type} | Region: ${rule.region}`);
      console.log(`   Year: ${rule.year_cutoff_logic || 'N/A'}${rule.challan_year_cutoff || 'N/A'}`);
      console.log(`   Amount: ${rule.amount_cutoff_logic || 'N/A'}₹${rule.amount_cutoff || 'N/A'}`);
      console.log(`   Settlement: ${rule.settlement_percentage}%`);
      console.log('');
    }

    console.log('🎉 All settlement rules created successfully!');
    console.log('='.repeat(80));
    
    // Verify creation
    const totalRules = await prisma.settlement_configs.count();
    console.log(`📊 Total settlement rules in database: ${totalRules}`);
    
    // Show summary by source type
    const rulesBySource = await prisma.settlement_configs.groupBy({
      by: ['source_type'],
      _count: { source_type: true }
    });
    
    console.log('\n📊 Rules by source type:');
    rulesBySource.forEach(group => {
      console.log(`   ${group.source_type}: ${group._count.source_type} rules`);
    });
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Error creating settlement rules:', error);
    process.exit(1);
  }
}

createProperSettlementRules();
