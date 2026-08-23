const { query } = require('../config/db');
const kendaraanService = require('./kendaraanService');
const activityLogModel = require('../models/activityLogModel');

const dashboardService = {
  async getDashboardSummary() {
    // 1. Total Barang & Stok
    const barangStats = await query(`
      SELECT 
        COUNT(*) as total_jenis_barang,
        COALESCE(SUM(total_jumlah), 0) as total_unit_barang,
        COALESCE(SUM(jumlah_tersedia), 0) as total_tersedia,
        COALESCE(SUM(jumlah_digunakan), 0) as total_digunakan,
        COUNT(CASE WHEN jumlah_tersedia = 0 THEN 1 END) as barang_habis
      FROM barang
    `);

    // 2. Total Kendaraan & Pinjam
    const kendaraanStats = await query(`
      SELECT 
        COUNT(*) as total_kendaraan,
        COUNT(CASE WHEN peminjam IS NOT NULL THEN 1 END) as kendaraan_dipinjam,
        COUNT(CASE WHEN peminjam IS NULL THEN 1 END) as kendaraan_tersedia
      FROM kendaraan
    `);

    // 3. Transaksi Aktif
    const transaksiStats = await query(`
      SELECT 
        COUNT(*) as total_transaksi,
        COUNT(CASE WHEN status = 'Dipinjam' THEN 1 END) as pinjaman_aktif
      FROM transaksi
    `);

    // 4. Pajak Kendaraan Alerts (PRD §4.7)
    const pajakAlerts = await kendaraanService.getPajakAlerts();

    // 5. Recent Activity Logs
    const recentActivities = await activityLogModel.findAll({ limit: 8, offset: 0 });

    return {
      barang: barangStats.rows[0],
      kendaraan: kendaraanStats.rows[0],
      transaksi: transaksiStats.rows[0],
      pajak_alerts: pajakAlerts,
      recent_activities: recentActivities
    };
  }
};

module.exports = dashboardService;
