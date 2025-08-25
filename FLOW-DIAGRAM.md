# 🔄 **Visual Flow Diagram - Complete System Architecture**

## 📊 **Step-by-Step Process Flow**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    START                                           │
│                              Vehicle Registration Number                           │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                PHASE 1: SCRAPING                                  │
│                           (Multiple Sources Simultaneously)                        │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ VCourt      │  │ VCourt      │  │ Delhi       │  │ M           │
│ Notice      │  │ Traffic     │  │ Police      │  │ Parivahan   │
│ API         │  │ API         │  │ Traffic     │  │ API         │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
       │               │               │               │
       ▼               ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Raw HTML    │  │ Raw HTML    │  │ Raw HTML    │  │ Raw HTML    │
│ + Parsed    │  │ + Parsed    │  │ + Parsed    │  │ + Parsed    │
│   JSON      │  │   JSON      │  │   JSON      │  │   JSON      │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
       │               │               │               │
       └───────────────┼───────────────┼───────────────┘
                       │               │
                       ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                PHASE 2: DATABASE STORAGE                           │
│                           (Raw Data Persistence)                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              challan TABLE - RAW DATA                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ • vcourt_notice_json     → Raw VCourt notice data                                 │
│ • vcourt_traffic_json    → Raw VCourt traffic data                                │
│ • traffic_notice_json    → Raw Delhi Police data                                  │
│ • mparivahan_json        → Raw M Parivahan data                                   │
│ • unique_challans_status → Processing status                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                PHASE 3: DEDUPLICATION                             │
│                           (Intelligent Data Consolidation)                         │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DEDUPLICATION ENGINE                                 │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Collect all challans from all sources                                          │
│ 2. Apply priority-based deduplication logic:                                      │
│    • VCourt Notice (Priority 1) - Highest Priority                               │
│    • VCourt Traffic (Priority 2)                                                  │
│    • Delhi Police (Priority 3)                                                    │
│    • M Parivahan (Priority 4)                                                     │
│ 3. Generate unique_challans_json                                                  │
│ 4. Generate unique_by_source_json                                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                PHASE 4: SETTLEMENT CONFIGURATION                  │
│                           (Dynamic Rule Management)                               │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              settlement_configs TABLE                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ • rule_name              → Rule identifier                                        │
│ • source_type            → Source (mparivahan, vcourt, delhi_police)              │
│ • region                 → Region (HR, UP, DL, ALL)                              │
│ • challan_year_cutoff    → Year-based rule cutoff                                │
│ • amount_cutoff          → Amount-based rule cutoff                               │
│ • settlement_percentage  → Settlement percentage                                  │
│ • is_active              → Rule activation status                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                PHASE 5: SETTLEMENT CALCULATION                    │
│                           (Dynamic Rule Application)                              │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              SETTLEMENT SERVICE                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ 1. fetchSettlementRules() → Query database for active rules                       │
│ 2. For each unique challan:                                                       │
│    • findMatchingRule() → Match challan to settlement rule                        │
│    • determineMparivahanRegion() → Detect region from challan number              │
│    • calculateSettlementAmount() → Apply percentage calculation                   │
│ 3. Generate settlement summary                                                    │
│ 4. Return aggregated challans with settlement data                               │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                PHASE 6: FINAL STORAGE                             │
│                           (Aggregated Data Persistence)                           │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              challan TABLE - FINAL DATA                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ • unique_challans_json      → Deduplicated challans                               │
│ • unique_by_source_json     → Challans grouped by source                         │
│ • aggregated_challans_json  → Challans with settlement calculations               │
│ • settlement_summary_json   → Settlement summary statistics                       │
│ • settlement_calculation_status → Calculation completion status                   │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                PHASE 7: ACCESS & REPORTING                        │
│                           (Data Retrieval & Analysis)                             │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              ACCESS METHODS                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ • API Endpoints:                                                                   │
│   - GET /api/challan/view/unique-json?regNo=DL5SDJ0795                           │
│   - POST /api/challan/populate/settlement-config                                  │
│ • Database Queries:                                                                │
│   - Direct SQL queries to challan table                                           │
│   - Prisma ORM queries                                                            │
│ • Scripts:                                                                         │
│   - show-unique-json.js                                                           │
│   - show-aggregated-structure.js                                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    END RESULT                                     │
│                              Complete Settlement Report                            │
│                              With Aggregated Amounts                               │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 **Detailed Process Breakdown**

### **📥 Phase 1: Data Collection**
- **Input:** Vehicle registration number (e.g., DL5SDJ0795)
- **Process:** Scrape from 4 different sources simultaneously
- **Output:** Raw HTML + parsed JSON for each source

### **💾 Phase 2: Raw Storage**
- **Input:** Parsed JSON from each source
- **Process:** Save to respective JSON fields in `challan` table
- **Output:** Raw data persisted with status tracking

### **🔄 Phase 3: Deduplication**
- **Input:** All challans from all sources
- **Process:** Priority-based deduplication (VCourt Notice > VCourt Traffic > Delhi Police > M Parivahan)
- **Output:** Unique challans with no duplicates

### **⚙️ Phase 4: Rule Configuration**
- **Input:** Settlement rules from database
- **Process:** Dynamic rule management (can be changed via API/frontend)
- **Output:** Active settlement rules ready for application

### **🧮 Phase 5: Settlement Calculation**
- **Input:** Unique challans + settlement rules
- **Process:** Rule matching, region detection, percentage calculation
- **Output:** Each challan with settlement amount and rule details

### **💾 Phase 6: Final Storage**
- **Input:** Aggregated challans with settlement data
- **Process:** Save to final JSON fields in database
- **Output:** Complete settlement report stored

### **📊 Phase 7: Access & Reporting**
- **Input:** Stored aggregated data
- **Process:** API access, database queries, script execution
- **Output:** Settlement reports, analysis, configuration management

## 🎯 **Key Benefits of This Architecture**

1. **🔄 Linear Flow:** Clear progression from scraping to final settlement
2. **⚙️ Configurable:** Rules can be changed without code modification
3. **📊 Comprehensive:** Complete data lifecycle tracked and stored
4. **🔧 Modular:** Each phase can be tested and modified independently
5. **📈 Scalable:** Easy to add new sources or modify logic
6. **🛡️ Reliable:** Fallback mechanisms and error handling at each phase

This architecture ensures a robust, maintainable, and scalable system for challan processing with dynamic settlement calculation capabilities.

