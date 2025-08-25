# 🚀 Complete Challan Pipeline: Scraping → Deduplication → Settlement → Aggregation

## 📋 Overview

The challan backend now provides a **complete end-to-end pipeline** that handles everything from scraping challan data to saving the final aggregated JSON with settlement calculations.

## 🔄 Complete Pipeline Flow

```
1. SCRAPING → 2. RAW JSON SAVE → 3. DEDUPLICATION → 4. SETTLEMENT → 5. AGGREGATION
     ↓              ↓                    ↓                ↓              ↓
  All Sources   Database Store    Priority-based    Rule-based    Final JSON
  (VCourt,      (Raw data)       Deduplication     Settlement    (Complete)
   Delhi,                        (Remove           Calculation   Data)
   CarInfo)                      Duplicates)       (Apply Rules)
```

## 🎯 API Endpoints

### 1. **Complete Pipeline (Main Endpoint)**
- **`POST /api/challan/fetch/single/v2`**
- **Purpose:** Triggers the complete pipeline for a single vehicle
- **Body:** `{ regNo, stakeholderMobile, engineNo, chassisNo }`
- **What it does:**
  - ✅ Scrapes from all sources (VCourt, Delhi Police, CarInfo)
  - ✅ Saves raw JSON to database
  - ✅ Performs deduplication with priority rules
  - ✅ Calculates settlements using database rules
  - ✅ Saves final aggregated JSON with settlements

### 2. **Settlement Calculation (Standalone)**
- **`POST /api/challan/calculate-settlement`**
- **Purpose:** Calculate settlements for existing challan records
- **Body:** `{ regNo }` OR `{ challanId }`
- **What it does:**
  - ✅ Finds existing challan record
  - ✅ Calculates settlements using unique challans
  - ✅ Saves aggregated data to database

### 3. **View Aggregated Data**
- **`GET /api/challan/view/aggregated-json?regNo=DL5SDJ0795`**
- **Purpose:** View final aggregated challans with settlement calculations
- **Query:** `regNo` (vehicle registration number)
- **Returns:** Complete aggregated data including settlements

### 4. **View Unique Challans (Deduplicated)**
- **`GET /api/challan/view/unique-json?regNo=DL5SDJ0795`**
- **Purpose:** View deduplicated challans (before settlement)
- **Query:** `regNo` (vehicle registration number)
- **Returns:** Deduplicated challans with source information

### 5. **Settlement Configuration**
- **`POST /api/challan/populate/settlement-config`**
- **Purpose:** Setup settlement rules in database
- **Body:** `{ force: true/false }`
- **What it does:**
  - ✅ Populates settlement rules table
  - ✅ Configures rules for different sources and regions
  - ✅ Sets settlement percentages based on challan type

## 🏗️ Database Schema

### Main Challan Table Fields:
```sql
-- Raw Data Storage
vcourt_notice_json      -- VCourt Notice challans (raw)
vcourt_traffic_json     -- VCourt Traffic challans (raw)
traffic_notice_json     -- Delhi Police challans (raw)
acko_json              -- CarInfo/Acko challans (raw)

-- Deduplication Results
unique_challans_json    -- Deduplicated challans
unique_challans_status  -- Deduplication status
unique_by_source_json   -- Unique challans by source

-- Final Aggregated Data
aggregated_challans_json    -- Final challans with settlements
settlement_summary_json     -- Settlement calculation summary
settlement_calculation_status -- Settlement calculation status
```

## 🔧 Priority-Based Deduplication

### Source Priority (Highest to Lowest):
1. **VCourt Notice** (Priority 1) - Most reliable
2. **VCourt Traffic** (Priority 2) - Good reliability
3. **Delhi Police** (Priority 3) - Official source
4. **CarInfo/Acko** (Priority 4) - Third-party data

### Deduplication Rules:
- **Single Source:** Marked as unique to that source
- **Multiple Sources:** Select based on priority rules
- **Metadata Added:** Source tracking, duplicate flags, selection reasons

## 💰 Settlement Calculation

### Rule-Based System:
- **M Parivahan Rules:** Region-based (UP, HR, DL) with amount cutoffs
- **Delhi Police Rules:** Year-based with Lok Adalat considerations
- **V Court Rules:** Year-based with Lok Adalat considerations

### Example Rules:
```
M Parivahan - UP Challan ≤1000: 160% (penalty)
M Parivahan - UP Challan >1000: 70% (settlement)
Delhi Police - Challan ≤2023: 100% (Lok Adalat)
Delhi Police - Challan >2023: 20% (settlement)
```

## 🧪 Testing

### Complete Pipeline Test:
```bash
node test-complete-pipeline.js
```

### Fallback System Test:
```bash
node test-fallback-system.js
```

### Delhi Police Fallback Test:
```bash
node test-delhi-police-fallback.js
```

### Individual Settlement Test:
```bash
node test-settlement-calculation.js
```

### Dry Run Settlement:
```bash
node dry-run-settlement.js
```

## 📊 Sample API Usage

### 1. Trigger Complete Pipeline:
```bash
curl -X POST http://localhost:3000/api/challan/fetch/single/v2 \
  -H "Content-Type: application/json" \
  -d '{
    "regNo": "DL5SDJ0795",
    "stakeholderMobile": "8287041552",
    "engineNo": "123456789",
    "chassisNo": "ABCD123456789"
  }'
```

### 2. Calculate Settlements for Existing Record:
```bash
curl -X POST http://localhost:3000/api/challan/calculate-settlement \
  -H "Content-Type: application/json" \
  -d '{
    "regNo": "DL5SDJ0795"
  }'
```

### 3. View Final Aggregated Data:
```bash
curl "http://localhost:3000/api/challan/view/aggregated-json?regNo=DL5SDJ0795"
```

## 🚨 Error Handling & Fallback System

### Graceful Degradation with Fallbacks:
- **Scraping Failures:** Continue with available sources + add 0 challans for failed sources
- **Deduplication Errors:** Log and continue
- **Settlement Failures:** Log and continue, don't break pipeline
- **Database Errors:** Proper error responses with status codes

### Fallback Behavior:
- **Failed Sources:** Get empty arrays (`[]`) with `FAILED_FALLBACK` status
- **Successful Sources:** Get actual challan data with `SUCCESS` status
- **Pipeline Continuity:** Always continues to completion regardless of source failures

### Status Tracking:
- Each stage has its own status field
- Failed stages don't prevent subsequent stages
- Comprehensive error logging for debugging
- Clear fallback status indicators (`FAILED_FALLBACK`)

### Fallback Sources:
1. **VCourt Notice** → 0 challans if fails
2. **VCourt Traffic** → 0 challans if fails  
3. **Delhi Police** → 0 challans if fails (with OTP retry logic)
4. **MParivahan** → 0 challans if fails
5. **CarInfo/Acko** → 0 challans if fails

### Delhi Police OTP Fallback:
- **OTP Verification Failures:** Automatically retry up to 3 times
- **Max Attempts Reached:** Save empty array with `FAILED_FALLBACK` status
- **OTP Timeout:** Graceful fallback after 22 seconds
- **Network Errors:** Immediate fallback with error logging

## 🔄 Data Flow Summary

```
Input: Vehicle Number + Mobile
    ↓
1. Scrape All Sources (Parallel)
    ↓
2. Save Raw JSON to DB
    ↓
3. Deduplicate with Priority Rules
    ↓
4. Calculate Settlements using DB Rules
    ↓
5. Save Aggregated JSON to DB
    ↓
Output: Complete Challan Data with Settlements
```

## ✨ Benefits

1. **Single API Call:** Complete pipeline execution
2. **Automatic Processing:** No manual intervention needed
3. **Comprehensive Data:** Raw, deduplicated, and settled data
4. **Flexible Access:** View data at any stage
5. **Error Resilient:** Continues processing despite failures
6. **Audit Trail:** Complete data lineage tracking

## 🚀 Getting Started

1. **Setup Database:** Ensure Prisma schema is migrated
2. **Populate Rules:** Run settlement config population
3. **Test Pipeline:** Use test scripts to verify functionality
4. **API Integration:** Use endpoints in your applications

---

**🎯 The pipeline is now complete and ready for production use!**
