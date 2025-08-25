
const { default: axios } = require("axios");
const prisma = require("../../db/prisma/prisma");
const { fetchVcourtNoticeChallan, isVehicleStolen, fetchVcourtTrafficChallan, resetOtp, fetchChallanForVehicle, sendOtpTrafficPoliceNotice, fetchMparivahanChallan, saveMparivahanChallans, saveAckoChallans, fetchAckoChallan, fetchChallanForVehicleV2 } = require("../services/challan.service");
const APIError = require("../utils/APIError");
const { CHALLAN_FETCH_STATUS } = require("../utils/enums");
const { parseCSVFile } = require("../utils/helper");
const moment = require('moment')

exports.fetchChallans = async (req, res, next) => {
  try {
    const { regNo, stakeholderMobile = "8890336585", engineNo, chassisNo } = req.body;
    if (!regNo) {
      throw new APIError({
        message: 'Reg no. is a required field',
        status: 400,
      })
    }
    const { updatedChallanRecord, otpResetStatus } = await fetchChallanForVehicle(regNo, stakeholderMobile, engineNo, chassisNo)
    return res.json({
      status: 200,
      message: 'Challans fetched successfully',
      vcourtNoticeChallan: {
        vcourt_notice: updatedChallanRecord?.vcourt_notice,
        vcourt_notice_status: updatedChallanRecord?.vcourt_notice_status,
        vcourt_notice_json: updatedChallanRecord?.vcourt_notice_json
      },
      vcourtTrafficChallan: {
        vcourt_traffic: updatedChallanRecord?.vcourt_traffic,
        vcourt_traffic_status: updatedChallanRecord?.vcourt_traffic_status,
        vcourt_traffic_json: updatedChallanRecord?.vcourt_traffic_json
      },
      isStolen: updatedChallanRecord?.fir_status == 'STOLEN',
      regNo
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchChallansV2 = async (req, res, next) => {
  try {
    const { regNo, stakeholderMobile = "8287041552", engineNo, chassisNo } = req.body;
    if (!regNo) {
      throw new APIError({
        message: 'Reg no. is a required field',
        status: 400,
      })
    }
    const { updatedChallanRecord } = await fetchChallanForVehicleV2(regNo, stakeholderMobile?.trim() || '8287041552', engineNo, chassisNo)
    return res.json({
      status: 200,
      message: 'Challans fetched successfully',
      isStolen: updatedChallanRecord?.fir_status == 'STOLEN',
      regNo
    });
  } catch (error) {
    return next(error);
  }
};


const fetchSingleRc = async (regNo)=>{

  let data = await prisma.carinfo_rc.findFirst({
    where: {
      reg_no: regNo,
      status: '200',
      created_at:{
        gt: moment().subtract(7, 'days')
      }
    },
    orderBy: {
      id: 'desc',
    },
  })

  if (!data) {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://api.cuvora.com/car/partner/v3/search?vehicle_num='+regNo,
      headers: { 
        'Authorization': 'Bearer 03a2d483035d4cad94a073ef2b45d7==', 
        'apiKey': '$vutto_rc@2025', 
        'clientId': 'vutto_rc'
      }
    };

    try {
      const ciRc = await axios.request(config);
      data = await prisma.carinfo_rc.create({
        data:{
          reg_no: regNo,
          response:ciRc.data,
          status:ciRc.data?.data?'200':'400',
          type:'live'
        }
      })

    } catch (e) {
      data = await prisma.carinfo_rc.create({
        data:{
          reg_no: regNo,
          response: e?.response?.data,
          status: e?.response?.status+"",
          type:'cache'
        }
      })
    }
  }
  return data
}

exports.fetchRc = async (req, res, next) => {
  try {
    const { regNo } = req.query;
    if (!regNo) {
      throw new APIError({
        message: 'Reg no. is a required field',
        status: 400,
      })
    }

    let data = await fetchSingleRc(regNo)
    return res.json({
      status: data?.status,
      message: 'RC fetched successfully',
      data: data?.response?.data,
    });

  } catch (error) {
    return next(error);
  }
};

exports.fetchBulkRc = async (req, res, next) => {
  try {
    const vehicles = await parseCSVFile(req.files[0].path);
    
    for (let vehicle of vehicles) {
      let data = await fetchSingleRc(vehicle['reg no'])
    }

    return res.json({
      status: 200,
      message: 'RCs fetched successfully',
    });

  } catch (error) {
    return next(error);
  }
};


exports.checkAddPreInward = async (req, res, next) => {
  try {
    const { procId, challanId, overwrite = false } = req.body;
    const procEntry = await prisma.procurement_details.findFirst({
      where: {
        proc_id: procId
      }
    })
    if(!procEntry){
      throw new APIError({
        message: 'Procurement id not found',
        status: 404,
      })
    }
    const challanEntry = await prisma.challan.findFirst({
      where: {
        id: challanId
      }
    })
    if(!challanEntry){
      throw new APIError({
        message: 'Challan id not found',
        status: 404,
      })
    }

    const preInwardEntry= await prisma.pre_inward_entries.findFirst({
      where: {
        proc_id: procId
      }
    })
    if(!preInwardEntry ||overwrite){
      await prisma.pre_inward_entries.create({
        data:{
          proc_id: procId,
          challan_id: challanId
        }
      })
    } else {
      throw new APIError({
        message: 'Pre inward entry already exists',
        status: 400,
      })
    }

    return res.json({
      status: 200,
      message: 'Created successfully',
    });

  } catch (error) {
    return next(error);
  }
};


exports.bulkFetchChallan = async (req, res, next) => {
  try {
    const vehicles = await parseCSVFile(req.files[0].path);
    const challanRecords = []
    for (let vehicle of vehicles) {
      try { await fetchChallanForVehicleV2(vehicle?.regNo, vehicle?.stakeholderMobile?.trim() || '8287041552', vehicle?.engineNo, vehicle?.chassisNo,) }
      catch (e) { console.error(e) }
    }
    return res.json({
      status: 200,
      message: 'Challans fetched successfully',
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchChallanList = async (req, res, next) => {
  try {
    const data = await prisma.challan.findMany({
      where: {
        created_at: {
          gt: moment().subtract(7, 'day')
        }
      },
      orderBy: {
        id: "desc"
      },
      select: {
        reg_no: true,
        id: true,
        chassis_no: true,
        engine_no: true,
        fir_status: true,
        vcourt_notice_status: true,
        vcourt_traffic_status: true,
        vcourt_notice_json: true,
        vcourt_traffic_json: true,
        created_at: true,
        traffic_notice_json: true,
        traffic_notice_status: true,
        mparivahan_json: true,
        mparivahan_status: true,
        acko_json: true,
        acko_status: true
      },
      distinct: ['reg_no']
    })
    const formattedData = []

    for (let challan of data) {
      const vcourtNoticeChallan = challan.vcourt_notice_json
      const vcourtTrafficChallan = challan.vcourt_traffic_json
      const trafficNoticeChallan = challan.traffic_notice_json
      const mparivahanChallan = challan.mparivahan_json
      const ackoChallan = challan.acko_json

      for (let challanData of ackoChallan || []) {
        formattedData.push({
          id: challan.id,
          createdAt: challan.created_at,
          regNo: challan.reg_no,
          firStatus: challan.fir_status,
          challanNumber: challanData?.challanNo,
          ackoAmount: challanData?.amount,
          offense: challanData?.offense
        })
      }

      for (let challanData of mparivahanChallan || []) {
        formattedData.push({
          id: challan.id,
          createdAt: challan.created_at,
          regNo: challan.reg_no,
          firStatus: challan.fir_status,
          challanNumber: challanData?.challanNumber,
          status: challanData?.status,
          fetchMparivahanStatus: challan?.mparivahan_status,
          offense: challanData?.offense
        })
      }

      for (let challanData of trafficNoticeChallan || []) {
        formattedData.push({
          id: challan.id,
          createdAt: challan.created_at,
          regNo: challan.reg_no,
          firStatus: challan.fir_status,
          challanNumber: challanData?.noticeNo,
          status: challanData?.status,
          trafficNoticeStatusAmount: challanData?.penaltyAmount,
          fetchTrafficNoticeStatus: challan?.traffic_notice_status,
          offense: challanData?.offenceDetail
        })
      }

      for (let challanData of vcourtNoticeChallan || []) {
        formattedData.push({
          id: challan.id,
          createdAt: challan.created_at,
          regNo: challan.reg_no,
          firStatus: challan.fir_status,
          caseNumber: challanData?.caseNumber,
          challanNumber: challanData?.challanNumber,
          status: challanData?.status,
          'V-Court (Traffic)': '-',
          'Act Amount': challanData?.totalActAmount,
          'ACTs': challanData?.punishableSections,
          'V-Court (Notice)': challanData?.fineAmount,
          fetchNoticeStatus: challan.vcourt_notice_status,
          fetchTrafficStatus: '-',
        })
      }
      for (let challanData of vcourtTrafficChallan || []) {
        formattedData.push({
          id: challan.id,
          createdAt: challan.created_at,
          regNo: challan.reg_no,
          firStatus: challan.fir_status,
          caseNumber: challanData?.caseNumber,
          challanNumber: challanData?.challanNumber,
          status: challanData?.status,
          'V-Court (Traffic)': challanData?.fineAmount,
          'Act Amount': challanData?.totalActAmount,
          'ACTs': challanData?.punishableSections,
          'V-Court (Notice)': '-',
          fetchNoticeStatus: '-',
          fetchTrafficStatus: challan.vcourt_traffic_status,
        })
      }
      if (
        challan.fir_status == 'STOLEN' || challan.fir_status == 'FAILED' ||
        challan.vcourt_notice_status == CHALLAN_FETCH_STATUS.FAILED ||
        challan.traffic_notice_status == CHALLAN_FETCH_STATUS.FAILED ||
        challan.vcourt_traffic_status == CHALLAN_FETCH_STATUS.FAILED ||
        challan.mparivahan_status == CHALLAN_FETCH_STATUS.FAILED ||
        challan.mparivahan_status == CHALLAN_FETCH_STATUS.RECORD_NOT_FOUND ||
        challan.vcourt_notice_status == CHALLAN_FETCH_STATUS.RECORD_NOT_FOUND ||
        challan.traffic_notice_status == CHALLAN_FETCH_STATUS.RECORD_NOT_FOUND ||
        challan.vcourt_traffic_status == CHALLAN_FETCH_STATUS.RECORD_NOT_FOUND
      ) {
        formattedData.push({
          id: challan.id,
          createdAt: challan.created_at,
          regNo: challan.reg_no,
          createdAt: challan.created_at,
          firStatus: challan.fir_status,
          'V-Court (Traffic)': vcourtTrafficChallan ? '' : '-',
          'V-Court (Notice)': vcourtNoticeChallan ? '' : '-',
          'Traffic Notice': trafficNoticeChallan ? '' : '-',
          'MParivahan': mparivahanChallan ? '' : '-',
          fetchNoticeStatus: challan.vcourt_notice_status,
          fetchTrafficStatus: challan.vcourt_traffic_status,
          fetchTrafficNoticeStatus: challan.traffic_notice_status,
          fetchMparivahanStatus: challan?.mparivahan_status,
        })
      }

    }

    return res.json({
      status: 200,
      message: 'Challans fetched successfully',
      formattedData

    });
  } catch (error) {
    return next(error);
  }
}



exports.fetchTrafficNotice = async (req, res, next) => {
  try {
    const { challanId, stakeholderMobile } = req.body;
    const challan = await prisma.challan.findFirst({
      where: {
        id: challanId
      }
    })
    if (!challan) {
      throw new APIError({
        message: 'Challan not found',
        status: 404,
      })
    }
    if (!challan.engine_no || !challan.chassis_no) {
      throw new APIError({
        message: 'Engine/chassis no. not found. Search again with these values',
        status: 404,
      })
    }

    await resetOtp(challan.reg_no, challan.engine_no, challan.chassis_no, stakeholderMobile)
    await sendOtpTrafficPoliceNotice(challan.reg_no, stakeholderMobile, challanId)

    return res.json({
      status: 200,
      message: 'Challan is being fetched',
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchMparivahan = async (req, res, next) => {
  try {
    const { regno } = req.body;
    const challans = await fetchMparivahanChallan(regno);
    return res.json({
      status: 200,
      message: 'Challan is being fetched',
      challans
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchAcko = async (req, res, next) => {
  try {
    const { regno } = req.body;
    const challans = await fetchAckoChallan(regno);
    return res.json({
      status: 200,
      message: 'Challan is being fetched',
      challans
    });
  } catch (error) {
    return next(error);
  }
};

exports.retryMparivahan = async (req, res, next) => {
  try {
    const { challanId } = req.body;
    const challan = await prisma.challan.findFirst({
      where: {
        id: challanId
      }
    })

    if (!challan) {
      throw new APIError({
        message: 'Challan not found',
        status: 404,
      })
    }

    await saveMparivahanChallans(challan.reg_no, challan.id)
    return res.json({
      status: 200,
      message: 'Challan is updated',
    });
  } catch (error) {
    return next(error);
  }
};

exports.retryAcko = async (req, res, next) => {
  try {
    const { challanId } = req.body;
    const challan = await prisma.challan.findFirst({
      where: {
        id: challanId
      }
    })

    if (!challan) {
      throw new APIError({
        message: 'Challan not found',
        status: 404,
      })
    }

    await saveAckoChallans(challan.reg_no, challan.id)
    return res.json({
      status: 200,
      message: 'Challan is updated',
    });
  } catch (error) {
    return next(error);
  }
};


exports.fetchStolenCheck = async (req, res, next) => {
  try {
    const { regNos } = req.body;
    const result = []
    for (let regNo of regNos) {
      const isStolen = await isVehicleStolen(regNo);
      result.push({
        regNo: regNo,
        isStolen: isStolen
      })
    }

    return res.json({
      status: 200,
      message: 'Fetched stolen check.',
      result
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * View unique challans JSON for a vehicle
 * GET /api/challan/view/unique-json?regNo=DL5SDJ0795
 */
exports.viewUniqueChallansJson = async (req, res, next) => {
  try {
    const { regNo } = req.query;
    
    if (!regNo) {
      throw new APIError({
        message: 'Reg no. is a required query parameter',
        status: 400,
      });
    }

    // Find the latest challan record for this vehicle
    const challanRecord = await prisma.challan.findFirst({
      where: {
        reg_no: regNo,
        unique_challans_json: { not: null },
        unique_challans_status: 'SUCCESS'
      },
      orderBy: { id: 'desc' }
    });

    if (!challanRecord) {
      throw new APIError({
        message: 'No challan record found with unique challans data',
        status: 404,
      });
    }

    // Return the unique challans data
    return res.json({
      status: 200,
      message: 'Unique challans data retrieved successfully',
      data: {
        challanRecordId: challanRecord.id,
        vehicleNumber: challanRecord.reg_no,
        totalChallans: Array.isArray(challanRecord.unique_challans_json) ? challanRecord.unique_challans_json.length : 0,
        uniqueChallans: challanRecord.unique_challans_json,
        uniqueBySource: challanRecord.unique_by_source_json,
        aggregatedChallans: challanRecord.aggregated_challans_json,
        settlementSummary: challanRecord.settlement_summary_json,
        settlementStatus: challanRecord.settlement_calculation_status,
        createdAt: challanRecord.created_at,
        updatedAt: challanRecord.updated_at
      }
    });

  } catch (error) {
    return next(error);
  }
};

/**
 * Populate settlement configuration table with default rules
 * POST /api/challan/populate/settlement-config
 */
exports.populateSettlementConfig = async (req, res, next) => {
  try {
    const { force = false } = req.body; // force=true will clear existing data first
    
    console.log('🌱 Populating settlement configuration table...');
    
    if (force) {
      // Clear existing data if force=true
      await prisma.settlement_configs.deleteMany({});
      console.log('🗑️  Cleared existing settlement configs');
    }
    
    // Check if data already exists
    const existingCount = await prisma.settlement_configs.count();
    if (existingCount > 0 && !force) {
      return res.json({
        status: 200,
        message: 'Settlement config table already populated',
        data: {
          existingRules: existingCount,
          message: 'Use force=true in request body to repopulate'
        }
      });
    }
    
    // M Parivahan Rules
    const mparivahanRules = [
      {
        rule_name: 'M Parivahan - UP Challan ≤1000',
        source_type: 'mparivahan',
        region: 'UP',
        challan_year_cutoff: null,
        amount_cutoff: 1000,
        settlement_percentage: 160.00
      },
      {
        rule_name: 'M Parivahan - UP Challan >1000',
        source_type: 'mparivahan',
        region: 'UP',
        challan_year_cutoff: null,
        amount_cutoff: 1000,
        settlement_percentage: 70.00
      },
      {
        rule_name: 'M Parivahan - HR Challan ≤1000',
        source_type: 'mparivahan',
        region: 'HR',
        challan_year_cutoff: null,
        amount_cutoff: 1000,
        settlement_percentage: 160.00
      },
      {
        rule_name: 'M Parivahan - HR Challan >1000',
        source_type: 'mparivahan',
        region: 'HR',
        challan_year_cutoff: null,
        amount_cutoff: 1000,
        settlement_percentage: 70.00
      },
      {
        rule_name: 'M Parivahan - DL Challan All',
        source_type: 'mparivahan',
        region: 'DL',
        challan_year_cutoff: null,
        amount_cutoff: null,
        settlement_percentage: 60.00
      }
    ];

    // Delhi Police Rules
    const delhiPoliceRules = [
      {
        rule_name: 'Delhi Police - Challan ≤2023 (Lok Adalat)',
        source_type: 'delhi_police',
        region: 'ALL',
        challan_year_cutoff: 2023,
        amount_cutoff: null,
        settlement_percentage: 100.00
      },
      {
        rule_name: 'Delhi Police - Challan >2023',
        source_type: 'delhi_police',
        region: 'ALL',
        challan_year_cutoff: 2023,
        amount_cutoff: null,
        settlement_percentage: 20.00
      }
    ];

    // V Court Rules
    const vcourtRules = [
      {
        rule_name: 'V Court - Challan ≤2023 (Lok Adalat)',
        source_type: 'vcourt',
        region: 'ALL',
        challan_year_cutoff: 2023,
        amount_cutoff: null,
        settlement_percentage: 100.00
      },
      {
        rule_name: 'V Court - Challan >2023',
        source_type: 'vcourt',
        region: 'ALL',
        challan_year_cutoff: 2023,
        amount_cutoff: null,
        settlement_percentage: 20.00
      }
    ];

    // Combine all rules
    const allRules = [...mparivahanRules, ...delhiPoliceRules, ...vcourtRules];
    
    // Insert all rules
    const createdConfigs = await prisma.settlement_configs.createMany({
      data: allRules
    });
    
    console.log(`✅ Created ${createdConfigs.count} settlement configuration rules`);
    
    // Fetch and return the created rules
    const configs = await prisma.settlement_configs.findMany({
      orderBy: [
        { source_type: 'asc' },
        { region: 'asc' },
        { amount_cutoff: 'asc' }
      ]
    });
    
    // Group rules by source type for better display
    const groupedRules = configs.reduce((acc, rule) => {
      if (!acc[rule.source_type]) {
        acc[rule.source_type] = [];
      }
      acc[rule.source_type].push(rule);
      return acc;
    }, {});
    
    return res.json({
      status: 200,
      message: 'Settlement configuration table populated successfully',
      data: {
        totalRules: configs.length,
        rulesBySource: groupedRules,
        summary: {
          mparivahan: groupedRules.mparivahan?.length || 0,
          delhi_police: groupedRules.delhi_police?.length || 0,
          vcourt: groupedRules.vcourt?.length || 0
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error populating settlement config:', error);
    return next(error);
  }
};

/**
 * Calculate settlements for existing challan record
 * POST /api/challan/calculate-settlement
 */
exports.calculateSettlement = async (req, res, next) => {
  try {
    const { regNo, challanId } = req.body;
    
    if (!regNo && !challanId) {
      throw new APIError({
        message: 'Either regNo or challanId is required',
        status: 400,
      });
    }
    
    console.log('💰 Calculating settlements for challan...');
    
    let challanRecord;
    
    if (challanId) {
      // Find by challan ID
      challanRecord = await prisma.challan.findUnique({
        where: { id: parseInt(challanId) }
      });
    } else {
      // Find by registration number
      challanRecord = await prisma.challan.findFirst({
        where: { reg_no: regNo },
        orderBy: { id: 'desc' }
      });
    }
    
    if (!challanRecord) {
      throw new APIError({
        message: 'Challan record not found',
        status: 404,
      });
    }
    
    // Check if unique challans exist
    if (!challanRecord.unique_challans_json || challanRecord.unique_challans_json.length === 0) {
      throw new APIError({
        message: 'No unique challans found. Please run deduplication first.',
        status: 400,
      });
    }
    
    // Calculate settlements
    const settlementService = require('../services/settlement.service');
    const settlementResult = await settlementService.calculateSettlementForChallans(
      challanRecord.unique_challans_json
    );
    
    // Save aggregated data
    await settlementService.saveAggregatedChallans(challanRecord.id, settlementResult);
    
    console.log('✅ Settlement calculation completed successfully');
    
    return res.json({
      status: 200,
      message: 'Settlement calculation completed successfully',
      data: {
        challanId: challanRecord.id,
        vehicleNumber: challanRecord.reg_no,
        totalChallans: settlementResult.challans.length,
        settlementSummary: settlementResult.summary,
        calculationStatus: 'SUCCESS'
      }
    });
    
  } catch (error) {
    console.error('❌ Error calculating settlements:', error);
    return next(error);
  }
};

/**
 * View aggregated challans with settlement calculations
 * GET /api/challan/view/aggregated-json?regNo=DL5SDJ0795
 */
exports.viewAggregatedChallansJson = async (req, res, next) => {
  try {
    const { regNo } = req.query;
    
    if (!regNo) {
      throw new APIError({
        message: 'Reg no. is a required query parameter',
        status: 400,
      });
    }

    // Find the latest challan record for this vehicle
    const challanRecord = await prisma.challan.findFirst({
      where: {
        reg_no: regNo,
        aggregated_challans_json: { not: null },
        settlement_calculation_status: 'SUCCESS'
      },
      orderBy: { id: 'desc' }
    });

    if (!challanRecord) {
      throw new APIError({
        message: 'No challan record found with aggregated settlement data',
        status: 404,
      });
    }

    // Return the aggregated data
    return res.json({
      status: 200,
      message: 'Aggregated challans data retrieved successfully',
      data: {
        challanRecordId: challanRecord.id,
        vehicleNumber: challanRecord.reg_no,
        totalChallans: Array.isArray(challanRecord.aggregated_challans_json) ? challanRecord.aggregated_challans_json.length : 0,
        aggregatedChallans: challanRecord.aggregated_challans_json,
        settlementSummary: challanRecord.settlement_summary_json,
        settlementStatus: challanRecord.settlement_calculation_status,
        createdAt: challanRecord.created_at,
        updatedAt: challanRecord.updated_at
      }
    });

  } catch (error) {
    return next(error);
  }
};

/**
 * Search challans and execute complete pipeline
 * POST /api/challan/search
 */
exports.searchChallans = async (req, res, next) => {
  try {
    const { regNumber, engineNumber, chassisNumber, mobileNumber } = req.body;
    
    if (!regNumber) {
      throw new APIError({
        message: 'Vehicle registration number is required',
        status: 400,
      });
    }

    if (!mobileNumber) {
      throw new APIError({
        message: 'Mobile number is required',
        status: 400,
      });
    }

    console.log(`🚀 Starting challan search for vehicle: ${regNumber}`);

    // Execute the complete pipeline using V2 function
    const { updatedChallanRecord } = await fetchChallanForVehicleV2(
      regNumber, 
      mobileNumber.trim(), 
      engineNumber, 
      chassisNumber
    );

    if (!updatedChallanRecord) {
      throw new APIError({
        message: 'Failed to fetch challan data',
        status: 500,
      });
    }

    console.log(`✅ Pipeline completed for vehicle: ${regNumber}`);

    // Return the complete challan record with all data
    return res.json(updatedChallanRecord);

  } catch (error) {
    console.error('❌ Error in challan search:', error);
    return next(error);
  }
};

/**
 * Get all challans from database
 * GET /api/challan/database
 */
exports.getAllChallans = async (req, res, next) => {
  try {
    console.log('📊 Fetching all challans from database');

    // Get all challan records with their data
    const challans = await prisma.challan.findMany({
      orderBy: [
        { updated_at: 'desc' }
      ],
      select: {
        id: true,
        reg_no: true,
        vcourt_notice_status: true,
        vcourt_traffic_status: true,
        unique_challans_json: true,
        aggregated_challans_json: true,
        settlement_summary_json: true,
        settlement_calculation_status: true,
        fir_status: true,
        created_at: true,
        updated_at: true,
      }
    });

    console.log(`✅ Found ${challans.length} challan records`);

    return res.json(challans);

  } catch (error) {
    console.error('❌ Error fetching challan database:', error);
    return next(error);
  }
};

/**
 * Get all individual challans for Lok Adalat view
 * GET /api/challan/all
 */
exports.getAllIndividualChallans = async (req, res, next) => {
  try {
    console.log('📋 Fetching all individual challans for Lok Adalat view');

    // Get all challan records
    const challanRecords = await prisma.challan.findMany({
      orderBy: [
        { updated_at: 'desc' }
      ],
      select: {
        id: true,
        reg_no: true,
        engine_no: true,
        chassis_no: true,
        unique_challans_json: true,
        created_at: true,
        updated_at: true,
      }
    });

    console.log(`✅ Found ${challanRecords.length} challan records`);

    // Extract individual challans from unique_challans_json
    const allIndividualChallans = [];
    
    for (const record of challanRecords) {
      if (record.unique_challans_json && Array.isArray(record.unique_challans_json)) {
        for (const challan of record.unique_challans_json) {
          allIndividualChallans.push({
            id: `${record.id}_${challan.challan_id || challan.id || Math.random().toString(36).substr(2, 9)}`,
            reg_no: record.reg_no,
            engine_no: record.engine_no,
            chassis_no: record.chassis_no,
            challan_number: challan.challan_id || challan.id || 'N/A',
            challan_amount: parseFloat(challan.challan_amount) || 0,
            source: challan.provider || challan.source || 'Unknown',
            status: challan.status || 'Pending',
            challan_date: challan.challan_date || challan.created_at || record.created_at,
            vehicle_type: challan.vehicle_type || 'Bike',
            violation_type: challan.violation_type || challan.violation || 'N/A',
            location: challan.location || challan.place || 'N/A',
            record_id: record.id
          });
        }
      }
    }

    console.log(`✅ Extracted ${allIndividualChallans.length} individual challans`);

    return res.json(allIndividualChallans);

  } catch (error) {
    console.error('❌ Error fetching individual challans:', error);
    return next(error);
  }
};
