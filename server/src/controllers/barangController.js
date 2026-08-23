const barangService = require('../services/barangService');

const barangController = {
  async getAll(req, res, next) {
    try {
      const items = await barangService.getAllBarang({
        search: req.query.search,
        kondisi: req.query.kondisi
      });
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const item = await barangService.getBarangById(req.params.id);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const item = await barangService.createBarang(req.body);
      res.status(201).json({
        success: true,
        message: 'Data barang berhasil ditambahkan.',
        data: item
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const item = await barangService.updateBarang(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Data barang berhasil diperbarui.',
        data: item
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const deleted = await barangService.deleteBarang(req.params.id);
      res.json({
        success: true,
        message: 'Data barang berhasil dihapus.',
        data: deleted
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = barangController;
