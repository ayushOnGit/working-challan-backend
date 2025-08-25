const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// GET /api/vcourt/notice/:regNo - Fetch VCourt Notice JSON for a vehicle
router.get('/notice/:regNo', async (req, res) => {
  try {
    const { regNo } = req.params;
    
    console.log(`🔍 Fetching VCourt Notice JSON for vehicle: ${regNo}`);
    
    const challan = await prisma.challan.findFirst({
      where: { reg_no: regNo.toUpperCase() },
      select: {
        id: true,
        reg_no: true,
        vcourt_notice_json: true,
        vcourt_notice_status: true,
        vcourt_notice: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: `No challan record found for vehicle ${regNo}`,
        data: null
      });
    }

    if (!challan.vcourt_notice_json || challan.vcourt_notice_json.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No VCourt Notice data found for vehicle ${regNo}`,
        data: {
          reg_no: challan.reg_no,
          status: challan.vcourt_notice_status,
          count: 0,
          challans: []
        }
      });
    }

    console.log(`✅ Found ${challan.vcourt_notice_json.length} VCourt Notice challans for ${regNo}`);

    res.json({
      success: true,
      message: `Successfully fetched VCourt Notice data for ${regNo}`,
      data: {
        reg_no: challan.reg_no,
        status: challan.vcourt_notice_status,
        count: challan.vcourt_notice_json.length,
        challans: challan.vcourt_notice_json,
        metadata: {
          created_at: challan.created_at,
          updated_at: challan.updated_at,
          has_raw_html: !!challan.vcourt_notice
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching VCourt Notice JSON:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching VCourt Notice data',
      error: error.message
    });
  }
});

// GET /api/vcourt/traffic/:regNo - Fetch VCourt Traffic JSON for a vehicle
router.get('/traffic/:regNo', async (req, res) => {
  try {
    const { regNo } = req.params;
    
    console.log(`🚔 Fetching VCourt Traffic JSON for vehicle: ${regNo}`);
    
    const challan = await prisma.challan.findFirst({
      where: { reg_no: regNo.toUpperCase() },
      select: {
        id: true,
        reg_no: true,
        vcourt_traffic_json: true,
        vcourt_traffic_status: true,
        vcourt_traffic: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: `No challan record found for vehicle ${regNo}`,
        data: null
      });
    }

    if (!challan.vcourt_traffic_json || challan.vcourt_traffic_json.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No VCourt Traffic data found for vehicle ${regNo}`,
        data: {
          reg_no: challan.reg_no,
          status: challan.vcourt_traffic_status,
          count: 0,
          challans: []
        }
      });
    }

    console.log(`✅ Found ${challan.vcourt_traffic_json.length} VCourt Traffic challans for ${regNo}`);

    res.json({
      success: true,
      message: `Successfully fetched VCourt Traffic data for ${regNo}`,
      data: {
        reg_no: challan.reg_no,
        status: challan.vcourt_traffic_status,
        count: challan.vcourt_traffic_json.length,
        challans: challan.vcourt_traffic_json,
        metadata: {
          created_at: challan.created_at,
          updated_at: challan.updated_at,
          has_raw_html: !!challan.vcourt_traffic
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching VCourt Traffic JSON:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching VCourt Traffic data',
      error: error.message
    });
  }
});

// GET /api/vcourt/all/:regNo - Fetch both VCourt Notice and Traffic JSON for a vehicle
router.get('/all/:regNo', async (req, res) => {
  try {
    const { regNo } = req.params;
    
    console.log(`🔍 Fetching all VCourt data for vehicle: ${regNo}`);
    
    const challan = await prisma.challan.findFirst({
      where: { reg_no: regNo.toUpperCase() },
      select: {
        id: true,
        reg_no: true,
        vcourt_notice_json: true,
        vcourt_notice_status: true,
        vcourt_notice: true,
        vcourt_traffic_json: true,
        vcourt_traffic_status: true,
        vcourt_traffic: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: `No challan record found for vehicle ${regNo}`,
        data: null
      });
    }

    const noticeCount = challan.vcourt_notice_json?.length || 0;
    const trafficCount = challan.vcourt_traffic_json?.length || 0;
    const totalCount = noticeCount + trafficCount;

    console.log(`✅ Found ${noticeCount} Notice + ${trafficCount} Traffic = ${totalCount} total VCourt challans for ${regNo}`);

    res.json({
      success: true,
      message: `Successfully fetched all VCourt data for ${regNo}`,
      data: {
        reg_no: challan.reg_no,
        summary: {
          total_challans: totalCount,
          notice_challans: noticeCount,
          traffic_challans: trafficCount
        },
        notice: {
          status: challan.vcourt_notice_status,
          count: noticeCount,
          challans: challan.vcourt_notice_json || [],
          has_raw_html: !!challan.vcourt_notice
        },
        traffic: {
          status: challan.vcourt_traffic_status,
          count: trafficCount,
          challans: challan.vcourt_traffic_json || [],
          has_raw_html: !!challan.vcourt_traffic
        },
        metadata: {
          created_at: challan.created_at,
          updated_at: challan.updated_at
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching all VCourt data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching VCourt data',
      error: error.message
    });
  }
});

// GET /api/vcourt/search - Search challans by various criteria
router.get('/search', async (req, res) => {
  try {
    const { 
      regNo, 
      challanNumber, 
      caseNumber, 
      status, 
      limit = 50, 
      offset = 0 
    } = req.query;

    console.log('🔍 Searching VCourt challans with criteria:', req.query);

    let whereClause = {};
    
    if (regNo) {
      whereClause.reg_no = { contains: regNo.toUpperCase() };
    }

    const challans = await prisma.challan.findMany({
      where: whereClause,
      select: {
        id: true,
        reg_no: true,
        vcourt_notice_json: true,
        vcourt_notice_status: true,
        vcourt_traffic_json: true,
        vcourt_traffic_status: true,
        created_at: true,
        updated_at: true
      },
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { updated_at: 'desc' }
    });

    // Filter and process results
    const results = [];
    challans.forEach(challan => {
      if (challan.vcourt_notice_json) {
        challan.vcourt_notice_json.forEach(notice => {
          if (this.matchesSearchCriteria(notice, challanNumber, caseNumber, status)) {
            results.push({
              source: 'notice',
              reg_no: challan.reg_no,
              challan_id: challan.id,
              data: notice,
              status: challan.vcourt_notice_status,
              created_at: challan.created_at,
              updated_at: challan.updated_at
            });
          }
        });
      }
      
      if (challan.vcourt_traffic_json) {
        challan.vcourt_traffic_json.forEach(traffic => {
          if (this.matchesSearchCriteria(traffic, challanNumber, caseNumber, status)) {
            results.push({
              source: 'traffic',
              reg_no: challan.reg_no,
              challan_id: challan.id,
              data: traffic,
              status: challan.vcourt_traffic_status,
              created_at: challan.created_at,
              updated_at: challan.updated_at
            });
          }
        });
      }
    });

    console.log(`✅ Search completed. Found ${results.length} matching challans`);

    res.json({
      success: true,
      message: `Search completed successfully`,
      data: {
        total_results: results.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        results: results
      }
    });

  } catch (error) {
    console.error('❌ Error searching VCourt challans:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while searching VCourt challans',
      error: error.message
    });
  }
});

// Helper function to check if a challan matches search criteria
function matchesSearchCriteria(challan, challanNumber, caseNumber, status) {
  if (challanNumber && challan.challanNumber !== challanNumber) return false;
  if (caseNumber && challan.caseNumber !== caseNumber) return false;
  if (status && challan.status !== status) return false;
  return true;
}

module.exports = router;


