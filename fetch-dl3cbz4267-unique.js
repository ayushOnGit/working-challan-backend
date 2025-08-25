const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fetchDL3CBZ4267Unique() {
  try {
    console.log('🔍 Fetching unique JSON data for vehicle DL3CBZ4267...');
    console.log('='.repeat(60));
    
    // Find the challan record for DL3CBZ4267
    const challanRecord = await prisma.challan.findFirst({
      where: {
        reg_no: 'DL3CBZ4267'
      },
      select: {
        id: true,
        reg_no: true,
        unique_challans_json: true,
        unique_challans_status: true,
        unique_by_source_json: true,
        aggregated_challans_json: true,
        settlement_summary_json: true,
        created_at: true,
        updated_at: true
      }
    });
    
    if (!challanRecord) {
      console.log('❌ No challan record found for vehicle DL3CBZ4267');
      return;
    }
    
    console.log(`✅ Found challan record for ${challanRecord.reg_no}`);
    console.log(`📊 Record ID: ${challanRecord.id}`);
    console.log(`📅 Created: ${challanRecord.created_at}`);
    console.log(`🔄 Updated: ${challanRecord.updated_at}`);
    console.log(`📋 Status: ${challanRecord.unique_challans_status}`);
    console.log('');
    
    // Display unique challans count
    if (challanRecord.unique_challans_json && Array.isArray(challanRecord.unique_challans_json)) {
      console.log(`🚗 Unique Challans: ${challanRecord.unique_challans_json.length}`);
      
      // Group by source
      const bySource = {};
      challanRecord.unique_challans_json.forEach(challan => {
        const source = challan.source || 'unknown';
        if (!bySource[source]) bySource[source] = [];
        bySource[source].push(challan);
      });
      
      console.log('\n📊 Breakdown by Source:');
      Object.entries(bySource).forEach(([source, challans]) => {
        console.log(`  ${source}: ${challans.length} challans`);
      });
      
      // Display unique by source data
      if (challanRecord.unique_by_source_json) {
        console.log('\n🎯 Unique by Source (Truly Unique):');
        Object.entries(challanRecord.unique_by_source_json).forEach(([source, challans]) => {
          if (Array.isArray(challans) && challans.length > 0) {
            console.log(`  ${source}: ${challans.length} unique challans`);
          }
        });
      }
      
      // Display first few challans as examples
      console.log('\n📋 Sample Unique Challans:');
      challanRecord.unique_challans_json.slice(0, 5).forEach((challan, index) => {
        console.log(`\n  ${index + 1}. Source: ${challan.source}`);
        console.log(`     Priority: ${challan.priority}`);
        console.log(`     Is Duplicate: ${challan.isDuplicate || false}`);
        console.log(`     Is Unique to Source: ${challan.isUniqueToSource || false}`);
        
        // Display key fields based on source
        if (challan.source === 'traffic_notice') {
          console.log(`     Notice No: ${challan.noticeNo || 'N/A'}`);
          console.log(`     Amount: ₹${challan.penaltyAmount || 'N/A'}`);
          console.log(`     Date: ${challan.offenceDateTime || 'N/A'}`);
          console.log(`     Location: ${challan.offenceLocation || 'N/A'}`);
          console.log(`     Offence: ${challan.offenceDetail || 'N/A'}`);
        } else if (challan.source === 'vcourt_notice' || challan.source === 'vcourt_traffic') {
          console.log(`     Case Details: ${challan.detailedInfo?.caseDetails ? 'Available' : 'N/A'}`);
          if (challan.detailedInfo?.caseDetails) {
            const caseDetails = challan.detailedInfo.caseDetails;
            console.log(`     Proposed Fine: ₹${caseDetails['Proposed Fine'] || 'N/A'}`);
            console.log(`     Challan Date: ${caseDetails['Challan Date.'] || caseDetails['Challan Date'] || 'N/A'}`);
          }
        } else if (challan.source === 'acko') {
          console.log(`     Challan No: ${challan.challanNumber || challan.challanNo || 'N/A'}`);
          console.log(`     Amount: ₹${challan.amount || challan.fineAmount || 'N/A'}`);
          console.log(`     Date: ${challan.dateTime || challan.date || 'N/A'}`);
        }
      });
      
      if (challanRecord.unique_challans_json.length > 5) {
        console.log(`\n  ... and ${challanRecord.unique_challans_json.length - 5} more challans`);
      }
    } else {
      console.log('❌ No unique challans data found');
    }
    
    // Display aggregated challans if available
    if (challanRecord.aggregated_challans_json && Array.isArray(challanRecord.aggregated_challans_json)) {
      console.log(`\n📊 Aggregated Challans: ${challanRecord.aggregated_challans_json.length}`);
    }
    
    // Display settlement summary if available
    if (challanRecord.settlement_summary_json) {
      console.log('\n💰 Settlement Summary:');
      const summary = challanRecord.settlement_summary_json;
      console.log(`  Total Original Amount: ₹${summary.totalOriginalAmount || 'N/A'}`);
      console.log(`  Total Settlement Amount: ₹${summary.totalSettlementAmount || 'N/A'}`);
      console.log(`  Total Savings: ₹${summary.totalSavings || 'N/A'}`);
      console.log(`  Average Settlement: ${summary.averageSettlementPercentage || 'N/A'}%`);
      console.log(`  Total Active Challans: ${summary.totalActiveChallans || 'N/A'}`);
      console.log(`  Total Disposed Challans: ${summary.totalDisposedChallans || 'N/A'}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Data fetch completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fetching data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
fetchDL3CBZ4267Unique();
