const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Settlement Calculation Service
 * Handles all settlement calculations based on database-driven rules
 */
class SettlementService {
  
  /**
   * Calculate settlement amounts for all unique challans
   * @param {Array} uniqueChallans - Array of unique challans from unique_challans_json
   * @returns {Array} - Array of challans with settlement calculations
   */
  async calculateSettlementForChallans(uniqueChallans) {
    try {
      console.log('🔄 Starting settlement calculation for challans...');
      console.log(`📊 Processing ${uniqueChallans.length} unique challans`);
      
      // Fetch all active settlement rules from database
      const settlementRules = await this.fetchSettlementRules();
      console.log(`📋 Loaded ${settlementRules.length} settlement rules from database`);
      
      // Filter out disposed challans before settlement calculation
      const activeChallans = uniqueChallans.filter(challan => {
        // Check if challan is disposed (already paid/completed)
        if (challan.status === 'disposed' || challan.status === 'closed' || challan.status === 'paid') {
          console.log(`⏭️ Skipping disposed challan: ${challan.challanNo || challan.noticeNo} (${challan.status})`);
          return false;
        }
        return true;
      });
      
      console.log(`📊 Filtered ${uniqueChallans.length - activeChallans.length} disposed challans, processing ${activeChallans.length} active challans`);
      
      // Calculate settlement for each active challan
      const challansWithSettlement = [];
      let totalOriginalAmount = 0;
      let totalSettlementAmount = 0;
      
      for (const challan of activeChallans) {
        const settlementResult = await this.calculateSettlementForChallan(challan, settlementRules);
        
        challansWithSettlement.push(settlementResult);
        
        totalOriginalAmount += settlementResult.settlementCalculation.originalAmount || 0;
        totalSettlementAmount += settlementResult.settlementAmount || 0;
        
        // Log each calculation
        console.log(`💰 ${challan.challanNo || challan.noticeNo}: ₹${challan.amount} → ₹${settlementResult.settlementAmount} (${settlementResult.settlementPercentage}%)`);
      }
      
      // Create summary
      const settlementSummary = {
        totalChallans: challansWithSettlement.length,
        totalActiveChallans: activeChallans.length,
        totalDisposedChallans: uniqueChallans.length - activeChallans.length,
        totalOriginalAmount: totalOriginalAmount,
        totalSettlementAmount: totalSettlementAmount,
        totalSavings: totalOriginalAmount - totalSettlementAmount,
        averageSettlementPercentage: totalSettlementAmount > 0 ? ((totalSettlementAmount / totalOriginalAmount) * 100).toFixed(2) : 0
      };
      
      console.log('\n📊 Settlement Calculation Summary:');
      console.log('='.repeat(60));
      console.log(`Total Active Challans: ${settlementSummary.totalActiveChallans}`);
      console.log(`Total Disposed Challans: ${settlementSummary.totalDisposedChallans}`);
      console.log(`Total Original Amount: ₹${settlementSummary.totalOriginalAmount}`);
      console.log(`Total Settlement Amount: ₹${settlementSummary.totalSettlementAmount}`);
      console.log(`Total Savings: ₹${settlementSummary.totalSavings}`);
      console.log(`Average Settlement: ${settlementSummary.averageSettlementPercentage}%`);
      console.log('='.repeat(60));
      
      return {
        challans: challansWithSettlement,
        summary: settlementSummary
      };
      
    } catch (error) {
      console.error('❌ Error calculating settlements:', error);
      throw error;
    }
  }
  
  /**
   * Fetch all active settlement rules from database
   * @returns {Array} - Array of settlement rules
   */
  async fetchSettlementRules() {
    try {
      const rules = await prisma.settlement_configs.findMany({
        where: { is_active: true },
        orderBy: [
          { source_type: 'asc' },
          { region: 'asc' },
          { amount_cutoff: 'asc' }
        ]
      });
      
      console.log(`📋 Fetched ${rules.length} active settlement rules`);
      return rules;
      
    } catch (error) {
      console.error('❌ Error fetching settlement rules:', error);
      throw error;
    }
  }
  
  /**
   * Extract amount from challan based on source structure
   * @param {Object} challan - Single challan object
   * @returns {Number|null} - Extracted amount or null if not found
   */
  extractAmountFromChallan(challan) {
    try {
      const { source, amount, detailedInfo } = challan;
      
      // Method 1: Direct amount field (for fallback, mparivahan, acko)
      if (amount && typeof amount === 'number') {
        console.log(`💰 Amount extracted from direct field: ₹${amount} (${source})`);
        return amount;
      }
      
      // Method 2: Acko/CarInfo specific extraction (check all possible amount fields)
      if (source === 'acko') {
        const ackoAmountFields = [
          'fineAmount',
          'penaltyAmount', 
          'totalAmount',
          'amount',
          'fine',
          'penalty',
          'challanAmount'
        ];
        
        for (const field of ackoAmountFields) {
          if (challan[field] && typeof challan[field] === 'number') {
            console.log(`💰 Amount extracted from acko ${field} field: ₹${challan[field]} (${source})`);
            return challan[field];
          }
        }
        
        // Also check if amount is stored as string
        for (const field of ackoAmountFields) {
          if (challan[field] && typeof challan[field] === 'string') {
            const extractedAmount = parseFloat(challan[field].replace(/[^\d.]/g, ''));
            if (!isNaN(extractedAmount) && extractedAmount > 0) {
              console.log(`💰 Amount extracted from acko ${field} string field: ₹${extractedAmount} (${source})`);
              return extractedAmount;
            }
          }
        }
      }
      
      // Method 3: VCourt specific extraction
      if (source === 'vcourt_notice' || source === 'vcourt_traffic') {
        console.log(`🔍 Extracting amount for VCourt challan: ${source}`);
        
        // Method 3a: Check detailedInfo.caseDetails for "Proposed Fine"
        if (detailedInfo && detailedInfo.caseDetails) {
          const proposedFine = detailedInfo.caseDetails["Proposed Fine"];
          if (proposedFine) {
            const extractedAmount = parseFloat(proposedFine);
            if (!isNaN(extractedAmount)) {
              console.log(`💰 Amount extracted from VCourt caseDetails.Proposed Fine: ₹${extractedAmount} (${source})`);
              return extractedAmount;
            }
          }
          
          // Method 3b: Check for other amount fields in caseDetails
          const amountFields = ['Fine', 'Amount', 'Total Amount', 'Challan Amount', 'Penalty'];
          for (const field of amountFields) {
            const value = detailedInfo.caseDetails[field];
            if (value) {
              const extractedAmount = parseFloat(value.toString().replace(/[^\d.]/g, ''));
              if (!isNaN(extractedAmount) && extractedAmount > 0 && extractedAmount < 100000) {
                console.log(`💰 Amount extracted from VCourt caseDetails.${field}: ₹${extractedAmount} (${source})`);
                return extractedAmount;
              }
            }
          }
          
          // Method 3c: Scan all caseDetails for amount-like values
          for (const [key, value] of Object.entries(detailedInfo.caseDetails)) {
            if (typeof value === 'string' && value.includes('₹')) {
              const extractedAmount = parseFloat(value.replace(/[^\d.]/g, ''));
              if (!isNaN(extractedAmount) && extractedAmount > 0 && extractedAmount < 100000) {
                console.log(`💰 Amount extracted from VCourt caseDetails.${key} (₹ symbol): ₹${extractedAmount} (${source})`);
                return extractedAmount;
              }
            }
          }
        }
        
        // Method 3d: Check direct challan fields for VCourt
        const vcourtAmountFields = ['amount', 'fine', 'penalty', 'challanAmount', 'totalAmount', 'proposedFine'];
        for (const field of vcourtAmountFields) {
          if (challan[field]) {
            const value = challan[field];
            if (typeof value === 'number') {
              console.log(`💰 Amount extracted from VCourt direct field ${field}: ₹${value} (${source})`);
              return value;
            } else if (typeof value === 'string') {
              const extractedAmount = parseFloat(value.replace(/[^\d.]/g, ''));
              if (!isNaN(extractedAmount) && extractedAmount > 0) {
                console.log(`💰 Amount extracted from VCourt direct field ${field} (string): ₹${extractedAmount} (${source})`);
                return extractedAmount;
              }
            }
          }
        }
        
        // Method 3e: Check challan object structure for nested amount data
        if (challan.challanData) {
          const challanData = challan.challanData;
          if (challanData.amount || challanData.fine || challanData.penalty) {
            const amount = challanData.amount || challanData.fine || challanData.penalty;
            const extractedAmount = parseFloat(amount.toString().replace(/[^\d.]/g, ''));
            if (!isNaN(extractedAmount) && extractedAmount > 0) {
              console.log(`💰 Amount extracted from VCourt challanData: ₹${extractedAmount} (${source})`);
              return extractedAmount;
            }
          }
        }
        
        console.log(`⚠️  No amount found in VCourt challan structure for: ${source}`);
      }
      
      // Method 4: Check for amount in various possible fields (generic fallback)
      const possibleAmountFields = [
        'fine',
        'penalty',
        'challanAmount',
        'totalAmount',
        'proposedFine',
        'caseAmount'
      ];
      
      for (const field of possibleAmountFields) {
        if (challan[field] && typeof challan[field] === 'number') {
          console.log(`💰 Amount extracted from ${field} field: ₹${challan[field]} (${source})`);
          return challan[field];
        }
      }
      
      // Method 5: Check detailedInfo for any amount-like fields
      if (detailedInfo && detailedInfo.caseDetails) {
        for (const [key, value] of Object.entries(detailedInfo.caseDetails)) {
          if (typeof value === 'string' && value.includes('.') && !isNaN(parseFloat(value))) {
            const extractedAmount = parseFloat(value);
            if (extractedAmount > 0 && extractedAmount < 100000) { // Reasonable amount range
              console.log(`💰 Amount extracted from caseDetails.${key}: ₹${extractedAmount} (${source})`);
              return extractedAmount;
            }
          }
        }
      }
      
      console.log(`⚠️  No amount found for challan: ${challan.challanNumber || challan.noticeNo || challan.challanNo} (${source})`);
      return null;
      
    } catch (error) {
      console.error(`❌ Error extracting amount from challan:`, error);
      return null;
    }
  }

  /**
   * Calculate settlement for a single challan
   * @param {Object} challan - Single challan object
   * @param {Array} rules - Array of settlement rules
   * @returns {Object} - Challan with settlement data
   */
  async calculateSettlementForChallan(challan, rules) {
    try {
      const { source, date, challanNumber, noticeNo } = challan;
      
      // Smart amount extraction based on source structure
      // NOTE: ACKO source contains CarInfo API data, will be treated as MParivahan for settlement
      const amount = this.extractAmountFromChallan(challan);
      
      if (amount === null) {
        console.log(`⚠️  No amount found for challan: ${challanNumber || noticeNo} (${source}) - skipping settlement`);
        return {
          ...challan,
          settlementAmount: 0,
          settlementPercentage: 0,
          ruleApplied: 'NO_AMOUNT_FOUND',
          ruleId: null,
          settlementCalculation: {
            originalAmount: 0,
            settlementPercentage: 0,
            settlementAmount: 0,
            savings: 0,
            ruleDetails: null,
            amountExtractionStatus: 'FAILED'
          }
        };
      }
      
      // Find matching settlement rule
      const matchingRule = this.findMatchingRule(challan, rules, amount);
      
      if (matchingRule) {
        // Calculate settlement amount
        const settlementAmount = this.calculateSettlementAmount(amount, matchingRule.settlement_percentage);
        
        // Add settlement data to challan
        return {
          ...challan,
          settlementAmount: settlementAmount,
          settlementPercentage: matchingRule.settlement_percentage,
          ruleApplied: matchingRule.rule_name,
          ruleId: matchingRule.id,
          settlementCalculation: {
            originalAmount: amount,
            settlementPercentage: matchingRule.settlement_percentage,
            settlementAmount: settlementAmount,
            savings: amount - settlementAmount,
            ruleDetails: {
              sourceType: matchingRule.source_type,
              region: matchingRule.region,
              yearCutoff: matchingRule.challan_year_cutoff,
              amountCutoff: matchingRule.amount_cutoff
            },
            amountExtractionStatus: 'SUCCESS'
          }
        };
      } else {
        // No matching rule found - use original amount
        console.log(`⚠️  No settlement rule found for challan: ${challanNumber || noticeNo} (${source})`);
        
        return {
          ...challan,
          settlementAmount: amount,
          settlementPercentage: 100,
          ruleApplied: 'NO_RULE_FOUND',
          ruleId: null,
          settlementCalculation: {
            originalAmount: amount,
            settlementPercentage: 100,
            settlementAmount: amount,
            savings: 0,
            ruleDetails: null,
            amountExtractionStatus: 'SUCCESS'
          }
        };
      }
      
    } catch (error) {
      console.error('❌ Error calculating settlement for challan:', error);
      throw error;
    }
  }
  
  /**
   * Find the matching settlement rule for a challan
   * @param {Object} challan - Single challan object
   * @param {Array} rules - Array of settlement rules
   * @returns {Object|null} - Matching rule or null
   */
  findMatchingRule(challan, rules, extractedAmount) {
    const { source, date } = challan;
    const amount = extractedAmount || challan.amount; // Use extracted amount if provided, fallback to challan.amount
    
    // Extract year from date
    const challanYear = date ? new Date(date).getFullYear() : new Date().getFullYear();
    
    // Map source to database source_type
    // IMPORTANT: ACKO JSON contains CarInfo API data, so apply MParivahan logic
    const sourceMapping = {
      'vcourt_notice': 'vcourt',      // Delhi-based, no region logic
      'vcourt_traffic': 'vcourt',     // Delhi-based, no region logic  
      'traffic_notice': 'delhi_police', // Delhi-based, no region logic
      'mparivahan': 'mparivahan',     // Region-based logic needed
      'acko': 'mparivahan'            // ACKO = CarInfo data, apply MParivahan settlement logic
    };
    
    const dbSourceType = sourceMapping[source] || source;
    
    // Find matching rule
    console.log(`🔍 Looking for rule: source=${dbSourceType}, region=${challan.region || 'unknown'}, year=${challanYear}, amount=${amount}`);
    
    return rules.find(rule => {
      console.log(`  📋 Checking rule: ${rule.rule_name} (source=${rule.source_type}, region=${rule.region}, year_cutoff=${rule.challan_year_cutoff}, amount_cutoff=${rule.amount_cutoff})`);
      
      // Match source type
      if (rule.source_type !== dbSourceType) {
        console.log(`    ❌ Source type mismatch: ${rule.source_type} !== ${dbSourceType}`);
        return false;
      }
      
      // Match region (handle ALL vs specific regions)
      if (rule.region !== 'ALL') {
        console.log(`    🔍 Checking region: rule requires ${rule.region}`);
        
        // For M Parivahan and ACKO (CarInfo), determine region from challan data
        if (dbSourceType === 'mparivahan') {
          const challanRegion = this.determineMparivahanRegion(challan);
          console.log(`    🏷️ MParivahan region determined: ${challanRegion}`);
          if (rule.region !== challanRegion) {
            console.log(`    ❌ Region mismatch: ${rule.region} !== ${challanRegion}`);
            return false;
          }
        } else if (dbSourceType === 'vcourt' || dbSourceType === 'delhi_police') {
          // For VCourt and Delhi Police: Always Delhi, no region logic needed
          // Only check cutoff amount and cutoff year
          console.log(`    🏷️ ${dbSourceType} challan: Delhi-based, skipping region check`);
          // Region check passed - continue to year and amount checks
        } else {
          // For other sources, use ALL or specific region
          console.log(`    ❌ Unsupported source type for region matching: ${dbSourceType}`);
          return false;
        }
      }
      
      // Match year cutoff logic (applies to all sources: VCourt, Delhi Police, MParivahan)
      if (rule.challan_year_cutoff && rule.year_cutoff_logic) {
        console.log(`    📅 Checking year cutoff: ${rule.year_cutoff_logic}${rule.challan_year_cutoff}, challan year: ${challanYear}`);
        
        if (rule.year_cutoff_logic === '≤') {
          // Rule for challans ≤ year_cutoff (e.g., ≤2023, ≤2024, ≤2025, etc.)
          if (challanYear > rule.challan_year_cutoff) {
            console.log(`    ❌ Year cutoff failed: ${challanYear} > ${rule.challan_year_cutoff} (≤${rule.challan_year_cutoff} rule)`);
            return false;
          }
        } else if (rule.year_cutoff_logic === '>') {
          // Rule for challans > year_cutoff (e.g., >2023, >2024, >2025, etc.)
          if (challanYear <= rule.challan_year_cutoff) {
            console.log(`    ❌ Year cutoff failed: ${challanYear} <= ${rule.challan_year_cutoff} (>${rule.challan_year_cutoff} rule)`);
            return false;
          }
        }
      }
      
      // Match amount cutoff logic (applies to all sources: VCourt, Delhi Police, MParivahan)
      if (rule.amount_cutoff && rule.amount_cutoff_logic) {
        console.log(`    💰 Checking amount cutoff: ${rule.amount_cutoff_logic}₹${rule.amount_cutoff}, challan amount: ${amount}`);
        
        if (rule.amount_cutoff_logic === '≤') {
          // Rule for challans ≤ amount_cutoff (e.g., ≤1000, ≤500, ≤2000, etc.)
          if (amount > rule.amount_cutoff) {
            console.log(`    ❌ Amount cutoff failed: ${amount} > ${rule.amount_cutoff} (≤${rule.amount_cutoff} rule)`);
            return false;
          }
        } else if (rule.amount_cutoff_logic === '>') {
          // Rule for challans > amount_cutoff (e.g., >1000, >500, >2000, etc.)
          if (amount <= rule.amount_cutoff) {
            console.log(`    ❌ Amount cutoff failed: ${amount} <= ${rule.amount_cutoff} (>${rule.amount_cutoff} rule)`);
            return false;
          }
        }
      }
      
      // Match "All" rules (like DL Challan All) or rules without cutoff logic
      if ((!rule.challan_year_cutoff && !rule.amount_cutoff) || 
          (!rule.year_cutoff_logic && !rule.amount_cutoff_logic)) {
        console.log(`    ✅ Rule matched: ${rule.rule_name} (no year/amount cutoff or no cutoff logic specified)`);
        return true;
      }
      
      console.log(`    ✅ Rule matched: ${rule.rule_name}`);
      return true;
    });
  }
  
  /**
   * Parse cutoff logic from rule name (≤ or >)
   * @param {String} ruleName - Rule name to parse
   * @param {String} type - Type of cutoff ('year' or 'amount')
   * @returns {String} - Cutoff logic ('≤', '>', or null for default)
   */
  parseCutoffLogic(ruleName, type) {
    try {
      const ruleNameUpper = ruleName.toUpperCase();
      
      if (type === 'year') {
        // Look for ANY year cutoff patterns using regex
        // Pattern: ≤ followed by 4 digits (any year)
        if (/\≤\d{4}/.test(ruleNameUpper)) {
          return '≤';
        } 
        // Pattern: > followed by 4 digits (any year)
        else if (/\>\d{4}/.test(ruleNameUpper)) {
          return '>';
        }
      } else if (type === 'amount') {
        // Look for ANY amount cutoff patterns using regex
        // Pattern: ≤ followed by digits (any amount)
        if (/\≤\d+/.test(ruleNameUpper)) {
          return '≤';
        } 
        // Pattern: > followed by digits (any amount)
        else if (/\>\d+/.test(ruleNameUpper)) {
          return '>';
        }
      }
      
      // Default: no specific cutoff logic found
      return null;
      
    } catch (error) {
      console.error(`❌ Error parsing cutoff logic from rule name: ${ruleName}`, error);
      return null;
    }
  }

  /**
   * Determine M Parivahan/CarInfo region from challan number
   * @param {Object} challan - Challan object
   * @returns {String} - Region (UP, HR, DL)
   */
  determineMparivahanRegion(challan) {
    try {
      // Get challan number from various possible fields
      const challanNo = challan.challanNo || challan.noticeNo || challan.challanNumber || '';
      
      if (!challanNo) {
        console.log(`⚠️ No challan number found for M Parivahan/CarInfo challan, defaulting to DL`);
        return 'DL'; // Default to DL if no challan number
      }
      
      const challanNoStr = challanNo.toString().toUpperCase();
      
      // Check for region prefixes in challan number
      if (challanNoStr.startsWith('HR')) {
        console.log(`🏷️ M Parivahan/CarInfo HR Challan detected: ${challanNo} → HR region`);
        return 'HR';
      } else if (challanNoStr.startsWith('UP')) {
        console.log(`🏷️ M Parivahan/CarInfo UP Challan detected: ${challanNo} → UP region`);
        return 'UP';
      } else if (challanNoStr.startsWith('DL')) {
        console.log(`🏷️ M Parivahan/CarInfo DL Challan detected: ${challanNo} → DL region`);
        return 'DL';
      }
      
      // Additional checks for other patterns
      if (challanNoStr.includes('HR') || challanNoStr.includes('HARYANA')) {
        console.log(`🏷️ M Parivahan/CarInfo HR Challan detected (pattern match): ${challanNo} → HR region`);
        return 'HR';
      } else if (challanNoStr.includes('UP') || challanNoStr.includes('UTTAR') || challanNoStr.includes('PRADESH')) {
        console.log(`🏷️ M Parivahan/CarInfo UP Challan detected (pattern match): ${challanNo} → UP region`);
        return 'UP';
      } else if (challanNoStr.includes('DL') || challanNoStr.includes('DELHI')) {
        console.log(`🏷️ M Parivahan/CarInfo DL Challan detected (pattern match): ${challanNo} → DL region`);
        return 'DL';
      }
      
      // Default to DL if no region can be determined
      console.log(`🏷️ M Parivahan/CarInfo region not determined for: ${challanNo}, defaulting to DL`);
      return 'DL';
      
    } catch (error) {
      console.error(`❌ Error determining M Parivahan/CarInfo region for challan:`, error);
      return 'DL'; // Default to DL on error
    }
  }


  
  /**
   * Calculate settlement amount based on percentage
   * @param {Number} originalAmount - Original challan amount
   * @param {Number} percentage - Settlement percentage
   * @returns {Number} - Calculated settlement amount
   */
  calculateSettlementAmount(originalAmount, percentage) {
    if (!originalAmount || !percentage) return originalAmount;
    
    const settlementAmount = (originalAmount * percentage) / 100;
    return Math.round(settlementAmount * 100) / 100; // Round to 2 decimal places
  }
  
  /**
   * Save aggregated challans with settlement calculations to database
   * @param {Number} challanId - Challan record ID
   * @param {Object} settlementData - Settlement calculation results
   */
  async saveAggregatedChallans(challanId, settlementData) {
    try {
      console.log('💾 Saving aggregated challans with settlement calculations...');
      
      await prisma.challan.update({
        where: { id: challanId },
        data: {
          aggregated_challans_json: settlementData.challans,
          settlement_summary_json: settlementData.summary,
          settlement_calculation_status: 'SUCCESS',
          updated_at: new Date()
        }
      });
      
      console.log('✅ Aggregated challans saved to database');
      
    } catch (error) {
      console.error('❌ Error saving aggregated challans:', error);
      throw error;
    }
  }
}

module.exports = new SettlementService();
