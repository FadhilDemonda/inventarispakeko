const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', transaksiController.getAll);
router.get('/:id', transaksiController.getById);
router.post('/pinjam', transaksiController.pinjam);
router.post('/:id/kembali', transaksiController.kembali);

module.exports = router;
