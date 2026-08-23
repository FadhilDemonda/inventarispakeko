const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const barangModel = require('../models/barangModel');
const kendaraanService = require('./kendaraanService');
const transaksiModel = require('../models/transaksiModel');

const reportService = {
  /**
   * Export Stok Inventaris ke Excel
   */
  async exportStokExcel() {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistem Inventaris Kantor';
    workbook.created = new Date();

    // Sheet 1: Barang
    const sheetBarang = workbook.addWorksheet('Inventaris Barang');
    sheetBarang.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Nama Barang', key: 'nama_barang', width: 35 },
      { header: 'Kondisi Fisik', key: 'kondisi', width: 18 },
      { header: 'Total Stok', key: 'total_jumlah', width: 14 },
      { header: 'Tersedia', key: 'jumlah_tersedia', width: 14 },
      { header: 'Dipinjam', key: 'jumlah_digunakan', width: 14 },
      { header: 'Terakhir Update', key: 'tanggal_update', width: 22 }
    ];

    const barangList = await barangModel.findAll({});
    barangList.forEach((b, idx) => {
      sheetBarang.addRow({
        no: idx + 1,
        nama_barang: b.nama_barang,
        kondisi: b.kondisi,
        total_jumlah: b.total_jumlah,
        jumlah_tersedia: b.jumlah_tersedia,
        jumlah_digunakan: b.jumlah_digunakan,
        tanggal_update: b.tanggal_update ? new Date(b.tanggal_update).toLocaleString('id-ID') : '-'
      });
    });

    // Sheet 2: Kendaraan
    const sheetKendaraan = workbook.addWorksheet('Inventaris Kendaraan');
    sheetKendaraan.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Nama Kendaraan', key: 'nama_kendaraan', width: 30 },
      { header: 'Nomor Plat', key: 'nomor_plat', width: 16 },
      { header: 'Satuan Kerja (Satker)', key: 'satker', width: 25 },
      { header: 'Jatuh Tempo Pajak', key: 'tanggal_pajak', width: 18 },
      { header: 'Status Pajak', key: 'status_pajak', width: 16 },
      { header: 'Peminjam Saat Ini', key: 'peminjam', width: 22 }
    ];

    const kendaraanList = await kendaraanService.getAllKendaraan({});
    kendaraanList.forEach((k, idx) => {
      sheetKendaraan.addRow({
        no: idx + 1,
        nama_kendaraan: k.nama_kendaraan,
        nomor_plat: k.nomor_plat,
        satker: k.satker,
        tanggal_pajak: k.tanggal_pajak ? new Date(k.tanggal_pajak).toLocaleDateString('id-ID') : '-',
        status_pajak: k.status_pajak,
        peminjam: k.peminjam || 'Tersedia di Pool'
      });
    });

    // Style Header Row
    [sheetBarang, sheetKendaraan].forEach(sheet => {
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' } // Navy Blue
      };
    });

    return await workbook.xlsx.writeBuffer();
  },

  /**
   * Export Histori Transaksi ke Excel
   */
  async exportTransaksiExcel(filters = {}) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Histori Transaksi');

    sheet.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'No. Surat', key: 'nomor_surat', width: 22 },
      { header: 'Tipe', key: 'item_type', width: 12 },
      { header: 'Nama Item', key: 'nama_item', width: 35 },
      { header: 'Peminjam', key: 'peminjam', width: 22 },
      { header: 'Jumlah', key: 'jumlah', width: 10 },
      { header: 'Tanggal Pinjam', key: 'tanggal_pinjam', width: 20 },
      { header: 'Tanggal Kembali', key: 'tanggal_kembali', width: 20 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Keterangan', key: 'keterangan', width: 30 }
    ];

    const list = await transaksiModel.findAll(filters);
    list.forEach((t, idx) => {
      sheet.addRow({
        no: idx + 1,
        nomor_surat: t.nomor_surat || '-',
        item_type: t.item_type === 'barang' ? 'Barang' : 'Kendaraan',
        nama_item: t.nama_item,
        peminjam: t.peminjam,
        jumlah: t.jumlah,
        tanggal_pinjam: new Date(t.tanggal_pinjam).toLocaleString('id-ID'),
        tanggal_kembali: t.tanggal_kembali ? new Date(t.tanggal_kembali).toLocaleString('id-ID') : 'Belum Kembali',
        status: t.status,
        keterangan: t.keterangan || '-'
      });
    });

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0D530E' } // Deep Evergreen
    };

    return await workbook.xlsx.writeBuffer();
  },

  /**
   * Export Stok Inventaris ke PDF
   */
  async exportStokPDF(res) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(res);

    // Header
    doc.fontSize(18).fillColor('#1e3a8a').text('LAPORAN STOK INVENTARIS KANTOR', { align: 'center', bold: true });
    doc.fontSize(10).fillColor('#64748b').text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, { align: 'center' });
    doc.moveDown(1.5);

    // Section 1: Barang
    doc.fontSize(13).fillColor('#0f172a').text('1. DAFTAR INVENTARIS BARANG', { bold: true });
    doc.moveDown(0.5);

    const barangList = await barangModel.findAll({});
    doc.fontSize(9).fillColor('#334155');
    
    barangList.forEach((b, idx) => {
      doc.text(
        `${idx + 1}. ${b.nama_barang} | Kondisi: ${b.kondisi} | Total: ${b.total_jumlah} unit (Tersedia: ${b.jumlah_tersedia}, Dipinjam: ${b.jumlah_digunakan})`
      );
    });

    doc.moveDown(1.5);

    // Section 2: Kendaraan
    doc.fontSize(13).fillColor('#0f172a').text('2. DAFTAR INVENTARIS KENDARAAN', { bold: true });
    doc.moveDown(0.5);

    const kendaraanList = await kendaraanService.getAllKendaraan({});
    doc.fontSize(9).fillColor('#334155');

    kendaraanList.forEach((k, idx) => {
      const statusPeminjam = k.peminjam ? `Dipinjam oleh: ${k.peminjam}` : 'Tersedia';
      const tglPajak = new Date(k.tanggal_pajak).toLocaleDateString('id-ID');
      doc.text(
        `${idx + 1}. ${k.nama_kendaraan} (${k.nomor_plat}) | Satker: ${k.satker} | Pajak: ${tglPajak} [${k.status_pajak}] | Status: ${statusPeminjam}`
      );
    });

    doc.end();
  },

  /**
   * Export Histori Transaksi ke PDF
   */
  async exportTransaksiPDF(filters = {}, res) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(res);

    doc.fontSize(18).fillColor('#0f766e').text('LAPORAN HISTORI TRANSAKSI PEMINJAMAN', { align: 'center', bold: true });
    doc.fontSize(10).fillColor('#64748b').text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, { align: 'center' });
    doc.moveDown(1.5);

    const list = await transaksiModel.findAll(filters);
    doc.fontSize(9).fillColor('#334155');

    if (list.length === 0) {
      doc.text('Tidak ada data transaksi yang sesuai dengan filter.');
    } else {
      list.forEach((t, idx) => {
        const tglPinjam = new Date(t.tanggal_pinjam).toLocaleString('id-ID');
        const tglKembali = t.tanggal_kembali ? new Date(t.tanggal_kembali).toLocaleString('id-ID') : 'Belum Kembali';
        doc.text(
          `${idx + 1}. [${t.item_type.toUpperCase()}] ${t.nama_item} | Peminjam: ${t.peminjam} (${t.jumlah} unit) | Tgl: ${tglPinjam} - ${tglKembali} | Status: ${t.status}`
        );
        if (t.keterangan) {
          doc.fillColor('#64748b').text(`   Ket: ${t.keterangan}`).fillColor('#334155');
        }
        doc.moveDown(0.2);
      });
    }

    doc.end();
  }
};

module.exports = reportService;
