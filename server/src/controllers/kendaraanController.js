const kendaraanService = require('../services/kendaraanService');

const kendaraanController = {
  async getAll(req, res, next) {
    try {
      const items = await kendaraanService.getAllKendaraan({
        search: req.query.search,
        satker: req.query.satker,
        status_pajak: req.query.status_pajak
      });
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const item = await kendaraanService.getKendaraanById(req.params.id);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const item = await kendaraanService.createKendaraan(req.body);
      res.status(201).json({
        success: true,
        message: 'Data kendaraan berhasil ditambahkan.',
        data: item
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const item = await kendaraanService.updateKendaraan(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Data kendaraan berhasil diperbarui.',
        data: item
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const deleted = await kendaraanService.deleteKendaraan(req.params.id);
      res.json({
        success: true,
        message: 'Data kendaraan berhasil dihapus.',
        data: deleted
      });
    } catch (error) {
      next(error);
    }
  },

  async getAlerts(req, res, next) {
    try {
      const alerts = await kendaraanService.getPajakAlerts();
      res.json({ success: true, data: alerts });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = kendaraanController;
