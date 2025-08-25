# Comprehensive Challan Scraping System

This system provides a comprehensive solution for scraping challan data from multiple sources, handling failures gracefully with fallback data, and performing intelligent deduplication.

## 🚀 Features

- **Multi-Source Scraping**: Scrapes from VCourt Notice, VCourt Traffic, Delhi Police Traffic Notice, Mparivahan, and Acko
- **Fallback Data**: Automatically uses dummy data when sources are unavailable (API down, OTP issues, etc.)
- **Intelligent Deduplication**: Removes duplicate challans across sources using priority-based selection
- **Database Integration**: Saves all data to PostgreSQL database with proper status tracking
- **Comprehensive Reporting**: Generates detailed reports and saves unique challans to JSON files
- **Error Handling**: Gracefully handles failures and continues with other sources

## 📋 Prerequisites

1. **Database Setup**: Ensure PostgreSQL is running and Prisma is configured
2. **Dependencies**: Install required npm packages
3. **OTP File**: For Delhi Police Traffic Notice, create an `otp.txt` file with the current OTP
4. **Environment Variables**: Ensure all required environment variables are set

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Sync database schema
npx prisma db pull
```

## 🚀 Usage

### Quick Start

```bash
# Run comprehensive scraping
node run-scraping.js

# Or run the main script directly
node comprehensive-scraping.js
```

### Configuration

Edit `scraping-config.js` to customize:

- Vehicle information (number, mobile, engine, chassis)
- Which sources to scrape
- Fallback data configuration
- Output options
- Priority settings for deduplication

### Example Configuration

```javascript
module.exports = {
  vehicle: {
    number: 'DL5SDJ0795',
    mobile: '8287041552',
    engineNo: 'AK3KR3406273',
    chassisNo: 'MD626AK38R3K13156'
  },
  options: {
    scrapeVCourtNotice: true,
    scrapeVCourtTraffic: true,
    scrapeTrafficNotice: true,
    scrapeMparivahan: true,
    scrapeAcko: true,
    checkStolenVehicle: true
  }
};
```

## 📊 Data Sources

### 1. VCourt Notice
- **Priority**: 1 (Highest)
- **Method**: `fetchVcourtNoticeChallan()`
- **Fallback**: Dummy challan data

### 2. VCourt Traffic
- **Priority**: 2
- **Method**: `fetchVcourtTrafficChallan()`
- **Fallback**: Dummy traffic challan data

### 3. Delhi Police Traffic Notice
- **Priority**: 3
- **Method**: `fetchChallansTrafficPolice()`
- **Requirements**: OTP from `otp.txt` file
- **Fallback**: Dummy traffic notice data

### 4. Mparivahan
- **Priority**: 4
- **Method**: `fetchMparivahanChallan()`
- **Fallback**: Dummy mparivahan data

### 5. Acko
- **Priority**: 5 (Lowest)
- **Method**: `fetchAckoChallan()`
- **Fallback**: Dummy acko data

### 6. Stolen Vehicle Check
- **Method**: `isVehicleStolen()`
- **Fallback**: Status set to 'UNKNOWN'

## 🔄 Deduplication Process

The system automatically deduplicates challans using the following logic:

1. **Group by Challan Number**: Groups challans with the same number across sources
2. **Priority Selection**: For duplicates, selects the challan from the highest priority source
3. **Source Tracking**: Marks which challans are unique to specific sources
4. **Metadata Addition**: Adds deduplication metadata to each challan

### Priority Order
1. VCourt Notice (Highest)
2. VCourt Traffic
3. Delhi Police Traffic Notice
4. Mparivahan
5. Acko (Lowest)

## 📁 Output Files

After successful execution, the system generates:

1. **`scraping-report.json`**: Comprehensive report with all scraping results
2. **`unique-challans.json`**: Deduplicated challans in JSON format
3. **Database Records**: All data saved to PostgreSQL with proper status tracking

## 🗄️ Database Schema

The system uses the existing `challan` table with these key fields:

- `vcourt_notice_json`: VCourt notice challans
- `vcourt_traffic_json`: VCourt traffic challans
- `traffic_notice_json`: Delhi Police traffic challans
- `mparivahan_json`: Mparivahan challans
- `acko_json`: Acko challans
- `unique_challans_json`: Deduplicated challans
- `unique_by_source_json`: Source-wise breakdown

## ⚠️ Error Handling

### Fallback Scenarios
- **API Down**: Uses dummy data with status 'FALLBACK_USED'
- **OTP Issues**: Skips traffic notice, uses fallback
- **Network Errors**: Retries with exponential backoff
- **Invalid Responses**: Logs error and continues with next source

### Status Tracking
- `SUCCESS`: Data successfully scraped
- `FALLBACK_USED`: Fallback data used due to source failure
- `RECORD_NOT_FOUND`: No challans found for vehicle
- `ERROR`: Scraping failed with error

## 🔧 Customization

### Adding New Sources
1. Add new scraping method to `challan.service.js`
2. Add source to `ComprehensiveScraper` class
3. Update configuration and fallback data
4. Add to deduplication priority list

### Modifying Fallback Data
Edit the `fallbackData` section in `scraping-config.js` to customize dummy data for each source.

### Changing Priorities
Modify the `priorities` section in `scraping-config.js` to change source priority for deduplication.

## 📝 Logging

The system provides comprehensive logging:

- 🚀 Initialization steps
- 🔍 Scraping progress for each source
- ✅ Success confirmations
- ⚠️ Warnings and fallback usage
- ❌ Error details
- 📊 Final summary and statistics

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in environment variables
   - Run `npx prisma generate` to regenerate client

2. **OTP Issues**
   - Ensure `otp.txt` file exists and contains valid OTP
   - Check OTP hasn't expired
   - Verify mobile number matches OTP

3. **Source Failures**
   - Check network connectivity
   - Verify source APIs are accessible
   - Review error logs for specific issues

4. **Memory Issues**
   - Reduce `requestDelay` in configuration
   - Set `saveRawResponses: false`
   - Monitor system resources during execution

### Debug Mode

Enable detailed logging by setting `enableLogging: true` in the configuration.

## 📞 Support

For issues or questions:
1. Check the logs for detailed error information
2. Verify configuration settings
3. Ensure all dependencies are properly installed
4. Check database connectivity and schema

## 🔄 Running Multiple Vehicles

To scrape multiple vehicles, create a batch script:

```javascript
const vehicles = [
  { number: 'DL5SDJ0795', mobile: '8287041552' },
  { number: 'DL1AB1234', mobile: '9876543210' }
];

for (const vehicle of vehicles) {
  // Update config and run scraper
  // Save results to separate files
}
```

## 📈 Performance Tips

1. **Parallel Processing**: Sources can be scraped in parallel for better performance
2. **Caching**: Implement Redis caching for frequently accessed data
3. **Rate Limiting**: Add delays between requests to avoid API rate limits
4. **Batch Processing**: Process multiple vehicles in batches

---

**Note**: This system is designed to be robust and handle failures gracefully. Even if some sources fail, it will continue with others and provide comprehensive results with fallback data where needed.

