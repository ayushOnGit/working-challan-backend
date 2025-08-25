const express = require('express');

const router = express.Router();
const { celebrate: validate } = require('celebrate');

const controller = require('../controllers/challan');
const { authorize } = require('../middlewares/auth');
const validations = require('../validations/challan.validation');

router
  .route('/fetch/single')
  .post(
    controller.fetchChallans,
  );

  router
  .route('/fetch/single/v2')
  .post(
    controller.fetchChallansV2,
  );

  router
  .route('/fetch/rc')
  .get(
    controller.fetchRc,
  );

  router
  .route('/fetch/rc/bulk')
  .post(
    controller.fetchBulkRc,
  );

  router
  .route('/create/pre-inward')
  .post(
    controller.checkAddPreInward,
  );

  router
  .route('/fetch/list')
  .get(
    controller.fetchChallanList,
  );

  router
  .route('/process/bulk')
  .post(
    controller.bulkFetchChallan,
  );

  router
  .route('/fetch/traffic-notice')
  .post(
    controller.fetchTrafficNotice,
  );

  router
  .route('/fetch/mparivahan')
  .post(
    controller.fetchMparivahan,
  );

  router
  .route('/retry/mparivahan')
  .post(
    controller.retryMparivahan,
  );

  router
  .route('/fetch/acko')
  .post(
    controller.fetchAcko,
  );

  router
  .route('/retry/acko')
  .post(
    controller.retryAcko,
  );

  router
  .route('/fetch/stolen')
  .post(
    controller.fetchStolenCheck,
  );

  // New endpoint to view unique challans JSON
  router
    .route('/view/unique-json')
    .get(
      controller.viewUniqueChallansJson,
    );

  // New endpoint to populate settlement config table
  router
    .route('/populate/settlement-config')
    .post(
      controller.populateSettlementConfig,
    );

  // New endpoint for challan search and pipeline execution
  router
    .route('/search')
    .post(
      controller.searchChallans,
    );

  // New endpoint to fetch all challans from database
  router
    .route('/database')
    .get(
      controller.getAllChallans,
    );

  // New endpoint to calculate settlements for existing challan
  router
    .route('/calculate-settlement')
    .post(
      controller.calculateSettlement,
    );

  // New endpoint to view aggregated challans with settlements
  router
    .route('/view/aggregated-json')
    .get(
      controller.viewAggregatedChallansJson,
    );

  // New endpoint to fetch all individual challans for Lok Adalat view
  router
    .route('/all')
    .get(
      controller.getAllIndividualChallans,
    );

  module.exports = router;
