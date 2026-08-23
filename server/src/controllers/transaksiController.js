const transaksiService = require('../services/transaksiService');

const transaksiController = {
  async getAll(req, res, next) {
    try {
      const items = await transaksiService.getAllTransaksi({
        item_type: req.query.item_type,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        search: req.query.search
      });
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const item = await transaksiService.getTransaksiById(req.params.id);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },

  async pinjam(req, res, next) {
    try {
      const item = await transaksiService.pinjamItem(req.body);
      res.status(201).json({
        success: true,
        message: 'Transaksi peminjaman berhasil dicatat.',
        data: item
      });
    } catch (error) {
      next(error);
    }
  },

  async kembali(req, res, next) {
    try {
      const item = await transaksiService.returnItem(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Pengembalian barang/kendaraan berhasil dicatat.',
        data: item
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = transaksiController;
