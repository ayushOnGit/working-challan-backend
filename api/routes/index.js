const express = require('express');
const router = express.Router();
const challanRoute = require('./challan');
const webhookRoute = require('./webhook');
const vcourtRoute = require('./vcourt');
const settlementConfigsRoute = require('./settlement-configs');

/**
 * GET /status
 */
router.get('/api/status', (req, res) => res.send('OK'));

router.use('/api/challan', challanRoute);
router.use('/api/webhook', webhookRoute);
router.use('/api/vcourt', vcourtRoute);
router.use('/api/settlement-configs', settlementConfigsRoute);


module.exports = router;
