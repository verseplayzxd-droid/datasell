const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/profile', userController.getProfile);
router.get('/stats', userController.getStats);
router.put('/update', userController.updateProfile);

module.exports = router;
