const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');

router.get('/code', referralController.getCode);
router.get('/list', referralController.getList);
router.get('/stats', referralController.getStats);

module.exports = router;
