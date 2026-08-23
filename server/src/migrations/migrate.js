const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function runMigration() {
  console.log('--- Memulai Migrasi Database ---');
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schemaSql);
    console.log('✅ Skema tabel berhasil dibuat / disinkronkan.');

    // Seed default admin jika belum ada
    const existingAdmin = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@kantor.com']);
    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (email, password, nama) VALUES ($1, $2, $3)',
        ['admin@kantor.com', hashedPassword, 'Admin Gudang']
      );
      console.log('✅ Admin default dibuat: admin@kantor.com (password: admin123)');
    }

    // Seed contoh barang jika kosong
    const existingBarang = await pool.query('SELECT COUNT(*) FROM barang');
    if (parseInt(existingBarang.rows[0].count, 10) === 0) {
      const sampleBarang = [
        { nama: 'Laptop Dell Latitude 5420', kondisi: 'Baik', total: 10, tersedia: 8, digunakan: 2 },
        { nama: 'Proyektor Epson EB-X500', kondisi: 'Baik', total: 4, tersedia: 3, digunakan: 1 },
        { nama: 'Kabel HDMI 5 Meter', kondisi: 'Baik', total: 15, tersedia: 15, digunakan: 0 },
        { nama: 'Printer HP LaserJet Pro M404n', kondisi: 'Baik', total: 3, tersedia: 2, digunakan: 1 },
        { nama: 'Kursi Rapat Ergonomis', kondisi: 'Baik', total: 25, tersedia: 25, digunakan: 0 }
      ];

      for (const b of sampleBarang) {
        await pool.query(
          `INSERT INTO barang (nama_barang, kondisi, total_jumlah, jumlah_tersedia, jumlah_digunakan)
           VALUES ($1, $2, $3, $4, $5)`,
          [b.nama, b.kondisi, b.total, b.tersedia, b.digunakan]
        );
      }
      console.log('✅ Sample data Barang berhasil ditambahkan.');
    }

    // Seed contoh kendaraan jika kosong
    const existingKendaraan = await pool.query('SELECT COUNT(*) FROM kendaraan');
    if (parseInt(existingKendaraan.rows[0].count, 10) === 0) {
      const today = new Date();
      // Pajak aktif (6 bulan lagi)
      const dateAktif = new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      // Pajak akan habis (15 hari lagi)
      const dateAkanHabis = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      // Pajak expired (10 hari lalu)
      const dateExpired = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const sampleKendaraan = [
        { nama: 'Toyota Avanza 1.3 G', plat: 'B 1234 KTR', satker: 'Sekretariat', tglPajak: dateAktif, peminjam: 'Budi Santoso' },
        { nama: 'Honda Vario 125 CBS', plat: 'B 5678 KTR', satker: 'Umum & Logistik', tglPajak: dateAkanHabis, peminjam: null },
        { nama: 'Toyota Innova Reborn 2.4 V', plat: 'B 9999 KTR', satker: 'Pimpinan', tglPajak: dateAktif, peminjam: null },
        { nama: 'Suzuki Carry Pickup', plat: 'B 4321 KTR', satker: 'Operasional Gudang', tglPajak: dateExpired, peminjam: null }
      ];

      for (const k of sampleKendaraan) {
        await pool.query(
          `INSERT INTO kendaraan (nama_kendaraan, nomor_plat, satker, tanggal_pajak, keterangan, peminjam)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [k.nama, k.plat, k.satker, k.tglPajak, 'Aset Operasional', k.peminjam]
        );
      }
      console.log('✅ Sample data Kendaraan berhasil ditambahkan.');
    }

    console.log('--- Migrasi Selesai Sukses ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat migrasi:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
