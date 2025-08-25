# 🎯 Settlement Logic Flow Diagram

## 🔄 Complete Settlement Calculation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CHALLAN DATA INPUT                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Source: vcourt_notice | vcourt_traffic | traffic_notice | acko               │
│  Date: 2023-06-15 | 2024-01-20 | etc.                                        │
│  Amount: 800 | 1500 | 2000 | etc.                                            │
│  Region: HR | UP | DL (for MParivahan/CarInfo sources)                       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        STEP 1: SOURCE MAPPING                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  'vcourt_notice'     → 'vcourt'                                               │
│  'vcourt_traffic'    → 'vcourt'                                               │
│  'traffic_notice'    → 'delhi_police'                                         │
│  'acko'             → 'mparivahan' (CarInfo data)                             │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        STEP 2: RULE MATCHING                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │   SOURCE TYPE   │  │     REGION      │  │   YEAR CUTOFF   │                │
│  │     MATCH       │  │     MATCH       │  │     LOGIC       │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│         │                       │                       │                      │
│         ▼                       ▼                       ▼                      │
│  rule.source_type    rule.region === 'ALL'    rule.challan_year_cutoff        │
│  === dbSourceType    OR region match          AND rule.year_cutoff_logic      │
│         │                       │                       │                      │
│         │                       │                       ▼                      │
│         │                       │              ┌─────────────────┐            │
│         │                       │              │  ≤2023 or >2023 │            │
│         │                       │              └─────────────────┘            │
│         │                       │                       │                      │
│         │                       │                       ▼                      │
│         │                       │              ┌─────────────────┐            │
│         │                       │              │  AMOUNT CUTOFF  │            │
│         │                       │              │     LOGIC       │            │
│         │                       │              └─────────────────┘            │
│         │                       │                       │                      │
│         │                       │                       ▼                      │
│         │                       │              ┌─────────────────┐            │
│         │                       │              │  ≤1000 or >1000 │            │
│         │                       │              └─────────────────┘            │
│         │                       │                       │                      │
│         │                       │                       ▼                      │
│         │                       │              ┌─────────────────┐            │
│         │                       │              │   RULE MATCH    │            │
│         │                       │              │     FOUND!      │            │
│         │                       │              └─────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        STEP 3: SETTLEMENT CALCULATION                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Formula: (Original Amount × Settlement Percentage) ÷ 100                     │
│                                                                                 │
│  Example: ₹1500 × 70% ÷ 100 = ₹1050                                           │
│                                                                                 │
│  Savings: Original Amount - Settlement Amount                                  │
│  Example: ₹1500 - ₹1050 = ₹450 (30% discount)                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 📊 Settlement Rules Matrix

### 🏛️ VCourt Rules (Delhi-based, no region logic)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           VCourt Settlement Rules                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Year Cutoff │ Amount Cutoff │ Settlement % │ Discount/Bonus │ Rule Applied    │
├──────────────┼───────────────┼──────────────┼────────────────┼─────────────────┤
│     ≤2023    │     ≤1000     │    100%      │   No Discount  │ Old + Low       │
│     ≤2023    │     >1000     │     20%      │   80% Discount │ Old + High      │
│     >2023    │     ≤1000     │    100%      │   No Discount  │ New + Low       │
│     >2023    │     >1000     │     60%      │   40% Discount │ New + High      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 🚔 Delhi Police Rules (Delhi-based, no region logic)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        Delhi Police Settlement Rules                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Year Cutoff │ Amount Cutoff │ Settlement % │ Discount/Bonus │ Rule Applied    │
├──────────────┼───────────────┼──────────────┼────────────────┼─────────────────┤
│     ≤2023    │     ≤1000     │    100%      │   No Discount  │ Old + Low       │
│     ≤2023    │     >1000     │     20%      │   80% Discount │ Old + High      │
│     >2023    │     ≤1000     │    100%      │   No Discount  │ New + Low       │
│     >2023    │     >1000     │     60%      │   40% Discount │ New + High      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 🚗 MParivahan/CarInfo Rules (Region-based logic)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      MParivahan/CarInfo Settlement Rules                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│   Region  │ Amount Cutoff │ Settlement % │ Discount/Bonus │ Rule Applied      │
├───────────┼───────────────┼──────────────┼────────────────┼───────────────────┤
│     HR    │     ≤1000     │    160%      │   60% Bonus    │ Haryana + Low     │
│     HR    │     >1000     │     70%      │   30% Discount │ Haryana + High    │
│     UP    │     ≤1000     │    100%      │   No Discount  │ UP + Low          │
│     UP    │     >1000     │     60%      │   40% Discount │ UP + High         │
│     DL    │      ALL      │     60%      │   40% Discount │ Delhi + All       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔍 Rule Matching Examples

### Example 1: VCourt Challan (Old + Low Amount)
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Example 1: VCourt Challan                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Input Data:                                                                    │
│  • Source: 'vcourt_notice'                                                      │
│  • Date: '2023-06-15'                                                          │
│  • Amount: ₹800                                                                 │
│                                                                                 │
│  Rule Matching Process:                                                         │
│  1. Source: 'vcourt_notice' → maps to 'vcourt' ✅                              │
│  2. Year: 2023 → ≤2023 ✅ (rule.year_cutoff_logic === '≤')                     │
│  3. Amount: 800 → ≤1000 ✅ (rule.amount_cutoff_logic === '≤')                  │
│  4. Rule Found: VCOURT_100_≤2023_≤1000                                        │
│                                                                                 │
│  Settlement Calculation:                                                        │
│  • Original Amount: ₹800                                                       │
│  • Settlement Percentage: 100%                                                 │
│  • Settlement Amount: (800 × 100) ÷ 100 = ₹800                                │
│  • Discount: ₹0 (no discount)                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Example 2: CarInfo (ACKO) Challan (Haryana + High Amount)
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      Example 2: CarInfo (ACKO) Challan                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Input Data:                                                                    │
│  • Source: 'acko'                                                              │
│  • Challan Number: 'HR123456'                                                  │
│  • Date: '2024-01-20'                                                          │
│  • Amount: ₹1500                                                                │
│                                                                                 │
│  Rule Matching Process:                                                         │
│  1. Source: 'acko' → maps to 'mparivahan' ✅                                   │
│  2. Region: 'HR123456' → HR (Haryana) ✅                                       │
│  3. Year: No year cutoff for MParivahan ✅                                     │
│  4. Amount: 1500 → >1000 ✅ (rule.amount_cutoff_logic === '>')                 │
│  5. Rule Found: HR_MPARIVAHAN_70_>1000                                        │
│                                                                                 │
│  Settlement Calculation:                                                        │
│  • Original Amount: ₹1500                                                      │
│  • Settlement Percentage: 70%                                                  │
│  • Settlement Amount: (1500 × 70) ÷ 100 = ₹1050                               │
│  • Discount: ₹450 (30% discount)                                              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Example 3: Delhi Police Challan (New + High Amount)
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        Example 3: Delhi Police Challan                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Input Data:                                                                    │
│  • Source: 'traffic_notice'                                                    │
│  • Date: '2024-03-10'                                                          │
│  • Amount: ₹2000                                                                │
│                                                                                 │
│  Rule Matching Process:                                                         │
│  1. Source: 'traffic_notice' → maps to 'delhi_police' ✅                        │
│  2. Year: 2024 → >2023 ✅ (rule.year_cutoff_logic === '>')                     │
│  3. Amount: 2000 → >1000 ✅ (rule.amount_cutoff_logic === '>')                 │
│  4. Rule Found: DELHI_POLICE_60_>2023_>1000                                   │
│                                                                                 │
│  Settlement Calculation:                                                        │
│  • Original Amount: ₹2000                                                      │
│  • Settlement Percentage: 60%                                                  │
│  • Settlement Amount: (2000 × 60) ÷ 100 = ₹1200                               │
│  • Discount: ₹800 (40% discount)                                              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🎯 Key Business Logic Rules

### 📅 Year-Based Logic
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Year-Based Discounts                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│  • OLD CHALLANS (≤2023): Better discounts (higher savings)                    │
│    - Low amounts (≤1000): 100% settlement (no discount)                       │
│    - High amounts (>1000): 20% settlement (80% discount)                       │
│                                                                                 │
│  • NEW CHALLANS (>2023): Standard discounts                                   │
│    - Low amounts (≤1000): 100% settlement (no discount)                        │
│    - High amounts (>1000): 60% settlement (40% discount)                       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 💰 Amount-Based Logic
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             Amount-Based Discounts                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│  • LOW AMOUNTS (≤1000): Usually no discount (100% settlement)                 │
│    - Small challans are easier to settle                                      │
│    - No incentive needed for low amounts                                      │
│                                                                                 │
│  • HIGH AMOUNTS (>1000): Significant discounts                                │
│    - Large challans need bigger incentives                                    │
│    - Higher savings for customers                                             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 🏷️ Region-Based Logic (MParivahan/CarInfo only)
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            Region-Based Settlement                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│  • HARYANA (HR): Best deals                                                   │
│    - Low amounts: 160% settlement (60% bonus)                                 │
│    - High amounts: 70% settlement (30% discount)                              │
│                                                                                 │
│  • UTTAR PRADESH (UP): Standard deals                                         │
│    - Low amounts: 100% settlement (no discount)                               │
│    - High amounts: 60% settlement (40% discount)                              │
│                                                                                 │
│  • DELHI (DL): Consistent discount                                            │
│    - All amounts: 60% settlement (40% discount)                               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔧 Technical Implementation

### Database Schema
```sql
CREATE TABLE settlement_configs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rule_name VARCHAR(100),
  source_type VARCHAR(50),           -- 'vcourt', 'delhi_police', 'mparivahan'
  region VARCHAR(20),                -- 'ALL', 'HR', 'UP', 'DL'
  challan_year_cutoff INT,           -- 2023, 2024, etc.
  year_cutoff_logic VARCHAR(10),     -- '≤', '>', NULL
  amount_cutoff INT,                 -- 1000, 2000, etc.
  amount_cutoff_logic VARCHAR(10),   -- '≤', '>', NULL
  settlement_percentage DECIMAL(5,2), -- 100.00, 60.00, etc.
  is_active BOOLEAN DEFAULT TRUE
);
```

### Rule Matching Algorithm
```javascript
findMatchingRule(challan, rules, amount) {
  const dbSourceType = sourceMapping[challan.source];
  const challanYear = new Date(challan.date).getFullYear();
  
  return rules.find(rule => {
    // 1. Source type match
    if (rule.source_type !== dbSourceType) return false;
    
    // 2. Region match (if not 'ALL')
    if (rule.region !== 'ALL' && rule.region !== getRegion(challan)) return false;
    
    // 3. Year cutoff logic
    if (rule.challan_year_cutoff && rule.year_cutoff_logic) {
      if (rule.year_cutoff_logic === '≤' && challanYear > rule.challan_year_cutoff) return false;
      if (rule.year_cutoff_logic === '>' && challanYear <= rule.challan_year_cutoff) return false;
    }
    
    // 4. Amount cutoff logic
    if (rule.amount_cutoff && rule.amount_cutoff_logic) {
      if (rule.amount_cutoff_logic === '≤' && amount > rule.amount_cutoff) return false;
      if (rule.amount_cutoff_logic === '>' && amount <= rule.amount_cutoff) return false;
    }
    
    return true; // Rule matches!
  });
}
```

## 🎉 Summary

The settlement logic now works based on the **combination of source, date cutoff, and amount cutoff** to determine the exact settlement percentage:

1. **✅ Source Type**: Maps frontend sources to database source types
2. **✅ Region Logic**: Applies only to MParivahan/CarInfo sources
3. **✅ Year Cutoff**: Old vs New challan logic (≤2023 vs >2023)
4. **✅ Amount Cutoff**: Low vs High amount logic (≤1000 vs >1000)
5. **✅ Settlement Calculation**: Accurate percentage-based calculations
6. **✅ Business Rules**: Clear discount structure based on data combination

This creates a flexible, database-driven settlement system that can handle complex business rules while maintaining accuracy and consistency! 🚀
