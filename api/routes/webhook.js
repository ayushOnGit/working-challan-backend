const express = require('express');

const router = express.Router();

const controller = require('../controllers/webhook');

router
  .route('/otp/receive')
  .post(
    controller.otpReceiveWebhook,
  );

module.exports = router;
