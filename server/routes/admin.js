const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const adminAuth = require('../middleware/adminAuth');
const admin = require('../controllers/adminController');

// Rate limiter for admin login
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

// Public admin route
router.post('/login', adminLoginLimiter, admin.login);

// All routes below require admin auth
router.use(adminAuth);

router.get('/stats', admin.getStats);
router.get('/users', admin.getUsers);
router.get('/users/:id', admin.getUserDetail);
router.post('/users/:id/add-money', admin.addMoney);
router.post('/users/:id/deduct-money', admin.deductMoney);
router.post('/users/:id/ban', admin.banUser);
router.delete('/users/:id', admin.deleteUser);
router.get('/withdrawals', admin.getWithdrawals);
router.put('/withdrawals/:id/status', admin.updateWithdrawalStatus);
router.post('/withdrawals/bulk-update', admin.bulkUpdateWithdrawals);
router.get('/sell-orders', admin.getSellOrders);
router.put('/sell-orders/:id/force-complete', admin.forceComplete);
router.get('/transactions', admin.getTransactions);
router.post('/announcements', admin.createAnnouncement);
router.get('/announcements', admin.getAnnouncements);
router.put('/announcements/:id', admin.toggleAnnouncement);
router.get('/settings', admin.getSettings);
router.put('/settings', admin.updateSettings);

module.exports = router;
