const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/stok/excel', reportController.exportStokExcel);
router.get('/stok/pdf', reportController.exportStokPDF);
router.get('/transaksi/excel', reportController.exportTransaksiExcel);
router.get('/transaksi/pdf', reportController.exportTransaksiPDF);

module.exports = router;
