const express = require('express');
const router = express.Router();
const sellController = require('../controllers/sellController');

router.post('/start', sellController.startSell);
router.get('/active', sellController.getActive);
router.get('/history', sellController.getHistory);

module.exports = router;
