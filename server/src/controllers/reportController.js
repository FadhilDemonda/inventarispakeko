const reportService = require('../services/reportService');

const reportController = {
  async exportStokExcel(req, res, next) {
    try {
      const buffer = await reportService.exportStokExcel();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="laporan-stok-inventaris.xlsx"');
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  },

  async exportTransaksiExcel(req, res, next) {
    try {
      const buffer = await reportService.exportTransaksiExcel(req.query);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="laporan-histori-transaksi.xlsx"');
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  },

  async exportStokPDF(req, res, next) {
    try {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="laporan-stok-inventaris.pdf"');
      await reportService.exportStokPDF(res);
    } catch (error) {
      next(error);
    }
  },

  async exportTransaksiPDF(req, res, next) {
    try {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="laporan-histori-transaksi.pdf"');
      await reportService.exportTransaksiPDF(req.query, res);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = reportController;
