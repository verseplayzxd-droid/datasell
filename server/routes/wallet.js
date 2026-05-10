const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

router.get('/balance', walletController.getBalance);
router.post('/request', walletController.requestWithdrawal);
router.get('/history', walletController.getWithdrawalHistory);

module.exports = router;
