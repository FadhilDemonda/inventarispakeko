const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const barangRoutes = require('./barangRoutes');
const kendaraanRoutes = require('./kendaraanRoutes');
const transaksiRoutes = require('./transaksiRoutes');
const activityLogRoutes = require('./activityLogRoutes');
const reportRoutes = require('./reportRoutes');
const dashboardRoutes = require('./dashboardRoutes');

router.use('/auth', authRoutes);
router.use('/barang', barangRoutes);
router.use('/kendaraan', kendaraanRoutes);
router.use('/transaksi', transaksiRoutes);
router.use('/activity-log', activityLogRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
