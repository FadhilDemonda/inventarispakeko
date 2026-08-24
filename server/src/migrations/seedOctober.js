require('dotenv').config();
const { pool } = require('../config/db');

async function seedOctoberData() {
  console.log('🌱 Menyiapkan Seed Data Realistis Bulan Oktober 2025...');

  try {
    // 1. Bersihkan tabel transaksi, activity_log, barang, kendaraan (kecuali users)
    await pool.query('TRUNCATE TABLE transaksi, activity_log, barang, kendaraan RESTART IDENTITY CASCADE;');

    console.log('🧹 Tabel lama dibersihkan.');

    // 2. Insert Data Barang Kantor (Oktober 2025)
    const barangData = [
      {
        nama: 'Laptop Lenovo ThinkPad T14 Gen 3',
        kondisi: 'Baik',
        total: 12,
        tersedia: 9,
        digunakan: 3,
        updated: '2025-10-18 14:30:00'
      },
      {
        nama: 'Laptop Dell Latitude 5420',
        kondisi: 'Baik',
        total: 8,
        tersedia: 6,
        digunakan: 2,
        updated: '2025-10-21 09:15:00'
      },
      {
        nama: 'Proyektor Epson EB-X500 HD',
        kondisi: 'Baik',
        total: 5,
        tersedia: 4,
        digunakan: 1,
        updated: '2025-10-23 11:20:00'
      },
      {
        nama: 'Kamera Sony Alpha A7 III (Dokumentasi)',
        kondisi: 'Baik',
        total: 3,
        tersedia: 2,
        digunakan: 1,
        updated: '2025-10-24 16:45:00'
      },
      {
        nama: 'Printer HP LaserJet Pro MFP M428fdn',
        kondisi: 'Baik',
        total: 4,
        tersedia: 3,
        digunakan: 1,
        updated: '2025-10-12 10:00:00'
      },
      {
        nama: 'Kabel Roll Terminal 15 Meter',
        kondisi: 'Baik',
        total: 10,
        tersedia: 8,
        digunakan: 2,
        updated: '2025-10-22 13:10:00'
      },
      {
        nama: 'Sound Portable Wireless Speaker (Mic Set)',
        kondisi: 'Baik',
        total: 2,
        tersedia: 1,
        digunakan: 1,
        updated: '2025-10-25 08:30:00'
      },
      {
        nama: 'Pointer Presenter Logitech R400',
        kondisi: 'Baik',
        total: 6,
        tersedia: 6,
        digunakan: 0,
        updated: '2025-10-05 09:00:00'
      },
      {
        nama: 'Kabel HDMI to VGA Adapter 3M',
        kondisi: 'Rusak Ringan',
        total: 8,
        tersedia: 8,
        digunakan: 0,
        updated: '2025-10-15 15:00:00'
      }
    ];

    const insertedBarang = [];
    for (const b of barangData) {
      const res = await pool.query(
        `INSERT INTO barang (nama_barang, kondisi, total_jumlah, jumlah_tersedia, jumlah_digunakan, tanggal_update)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, nama_barang`,
        [b.nama, b.kondisi, b.total, b.tersedia, b.digunakan, b.updated]
      );
      insertedBarang.push(res.rows[0]);
    }
    console.log(`✅ ${insertedBarang.length} data Barang berhasil diinput.`);

    // 3. Insert Data Kendaraan Dinas (Oktober 2025)
    const kendaraanData = [
      {
        nama: 'Toyota Kijang Innova Reborn 2.4 V',
        plat: 'B 1024 KTR',
        satker: 'Bagian Umum & Rumah Tangga',
        pajak: '2025-11-15', // Akan Habis (~23 hari dari akhir Oktober 2025)
        peminjam: 'Dr. Hendra Gunawan, S.E., M.M. (Kabag Umum)',
        ket: 'Mobil dinas operasional pimpinan'
      },
      {
        nama: 'Toyota Avanza 1.3 G M/T',
        plat: 'B 1455 KTR',
        satker: 'Subbag Protokol & Kepegawaian',
        pajak: '2026-04-10', // Aktif
        peminjam: 'Rian Kurniawan (Tim Protokol)',
        ket: 'Kendaraan dinas luar kota'
      },
      {
        nama: 'Mitsubishi Pajero Sport 2.4 Dakar',
        plat: 'B 1988 KTR',
        satker: 'Sekretariat Utama',
        pajak: '2025-10-05', // Expired (lewat awal Oktober 2025)
        peminjam: null,
        ket: 'Perlu perpanjangan STNK tahunan segera'
      },
      {
        nama: 'Suzuki Carry Pickup Wide Deck',
        plat: 'B 9210 KTR',
        satker: 'Pengelolaan Aset & Gudang',
        pajak: '2026-01-20', // Aktif
        peminjam: 'Wahyu Hidayat (Staf Logistik Gudang)',
        ket: 'Angkutan distribusi logistik berkala'
      },
      {
        nama: 'Honda Vario 160 CBS',
        plat: 'B 6128 KTR',
        satker: 'Bagian Keuangan & Verifikasi',
        pajak: '2025-11-02', // Akan Habis
        peminjam: null,
        ket: 'Motor operasional kurir dokumen'
      },
      {
        nama: 'Yamaha NMAX 155 Connected',
        plat: 'B 6344 KTR',
        satker: 'Subbag Tata Usaha',
        pajak: '2026-08-14', // Aktif
        peminjam: null,
        ket: 'Kendaraan dinas dalam kota'
      }
    ];

    const insertedKendaraan = [];
    for (const k of kendaraanData) {
      const res = await pool.query(
        `INSERT INTO kendaraan (nama_kendaraan, nomor_plat, satker, tanggal_pajak, keterangan, peminjam, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, '2025-10-01 08:00:00')
         RETURNING id, nama_kendaraan, nomor_plat`,
        [k.nama, k.plat, k.satker, k.pajak, k.ket, k.peminjam]
      );
      insertedKendaraan.push(res.rows[0]);
    }
    console.log(`✅ ${insertedKendaraan.length} data Kendaraan berhasil diinput.`);

    // 4. Insert Data Transaksi (Peminjaman Aktif & Selesai di Bulan Oktober 2025)
    const transaksiData = [
      // Transaksi Aktif (Dipinjam)
      {
        surat: '028/SPT/UMUM/X/2025',
        type: 'kendaraan',
        itemId: insertedKendaraan[0].id,
        namaItem: `${insertedKendaraan[0].nama_kendaraan} (${insertedKendaraan[0].nomor_plat})`,
        peminjam: 'Dr. Hendra Gunawan, S.E., M.M. (Kabag Umum)',
        jumlah: 1,
        pinjam: '2025-10-24 07:30:00',
        kembali: null,
        status: 'Dipinjam',
        ket: 'Kunjungan kerja monitoring aset regional Bandung'
      },
      {
        surat: '031/SPT/PROT/X/2025',
        type: 'kendaraan',
        itemId: insertedKendaraan[1].id,
        namaItem: `${insertedKendaraan[1].nama_kendaraan} (${insertedKendaraan[1].nomor_plat})`,
        peminjam: 'Rian Kurniawan (Tim Protokol)',
        jumlah: 1,
        pinjam: '2025-10-25 08:15:00',
        kembali: null,
        status: 'Dipinjam',
        ket: 'Penjemputan narasumber workshop nasional di Bandara'
      },
      {
        surat: '033/LOG/GUDANG/X/2025',
        type: 'kendaraan',
        itemId: insertedKendaraan[3].id,
        namaItem: `${insertedKendaraan[3].nama_kendaraan} (${insertedKendaraan[3].nomor_plat})`,
        peminjam: 'Wahyu Hidayat (Staf Logistik Gudang)',
        jumlah: 1,
        pinjam: '2025-10-26 09:00:00',
        kembali: null,
        status: 'Dipinjam',
        ket: 'Pengangkutan ATK dan konsumsi kegiatan rapat triwulan'
      },
      {
        surat: '019/PINJAM/IT/X/2025',
        type: 'barang',
        itemId: insertedBarang[0].id,
        namaItem: insertedBarang[0].nama_barang,
        peminjam: 'Fadlan Ramadhan (Tim IT Support)',
        jumlah: 3,
        pinjam: '2025-10-20 10:00:00',
        kembali: null,
        status: 'Dipinjam',
        ket: 'Uji coba instalasi software perpajakan baru'
      },
      {
        surat: '022/PINJAM/DIK/X/2025',
        type: 'barang',
        itemId: insertedBarang[1].id,
        namaItem: insertedBarang[1].nama_barang,
        peminjam: 'Siti Nurhaliza (Pusdiklat)',
        jumlah: 2,
        pinjam: '2025-10-22 08:45:00',
        kembali: null,
        status: 'Dipinjam',
        ket: 'Pelatihan administrasi perkantoran angkatan IV'
      },
      {
        surat: '025/PINJAM/RAPAT/X/2025',
        type: 'barang',
        itemId: insertedBarang[2].id,
        namaItem: insertedBarang[2].nama_barang,
        peminjam: 'Bambang Sudiro (Bagian Keuangan)',
        jumlah: 1,
        pinjam: '2025-10-24 13:00:00',
        kembali: null,
        status: 'Dipinjam',
        ket: 'Paparan evaluasi serapan anggaran semester II di Ruang Rapat 1'
      },
      {
        surat: '027/PINJAM/HUMAS/X/2025',
        type: 'barang',
        itemId: insertedBarang[3].id,
        namaItem: insertedBarang[3].nama_barang,
        peminjam: 'Dimas Prasetyo (Humas & Dokumentasi)',
        jumlah: 1,
        pinjam: '2025-10-25 09:30:00',
        kembali: null,
        status: 'Dipinjam',
        ket: 'Liputan dokumentasi serah terima jabatan eselon III'
      },
      {
        surat: '029/PINJAM/ACARA/X/2025',
        type: 'barang',
        itemId: insertedBarang[6].id,
        namaItem: insertedBarang[6].nama_barang,
        peminjam: 'Anisa Rahmawati (Panitia HUT Kantor)',
        jumlah: 1,
        pinjam: '2025-10-25 14:00:00',
        kembali: null,
        status: 'Dipinjam',
        ket: 'Gladi resik upacara peringatan'
      },
      {
        surat: '030/PINJAM/OPER/X/2025',
        type: 'barang',
        itemId: insertedBarang[5].id,
        namaItem: insertedBarang[5].nama_barang,
        peminjam: 'Eko Prasetyo (Teknisi Gedung)',
        jumlah: 2,
        pinjam: '2025-10-23 11:00:00',
        kembali: null,
        status: 'Dipinjam',
        ket: 'Pemasangan jalur kabel darurat aula barat'
      },
      {
        surat: '032/PINJAM/SEK/X/2025',
        type: 'barang',
        itemId: insertedBarang[4].id,
        namaItem: insertedBarang[4].nama_barang,
        peminjam: 'Mega Utami (Sekretariat Pimpinan)',
        jumlah: 1,
        pinjam: '2025-10-18 09:00:00',
        kembali: null,
        status: 'Dipinjam',
        ket: 'Pencetakan berkas audit eksternal BPK'
      },

      // Transaksi Selesai (Dikembalikan) di Bulan Oktober 2025
      {
        surat: '003/PINJAM/RAPAT/X/2025',
        type: 'barang',
        itemId: insertedBarang[2].id,
        namaItem: insertedBarang[2].nama_barang,
        peminjam: 'Taufik Hidayat (Perencanaan)',
        jumlah: 1,
        pinjam: '2025-10-02 08:00:00',
        kembali: '2025-10-02 17:00:00',
        status: 'Dikembalikan',
        ket: 'Rapat koordinasi awal bulan Oktober. Dikembalikan lengkap dengan remote.'
      },
      {
        surat: '007/SPT/KTR/X/2025',
        type: 'kendaraan',
        itemId: insertedKendaraan[4].id,
        namaItem: `${insertedKendaraan[4].nama_kendaraan} (${insertedKendaraan[4].nomor_plat})`,
        peminjam: 'Agus Setiawan (Kurir)',
        jumlah: 1,
        pinjam: '2025-10-05 08:30:00',
        kembali: '2025-10-05 16:30:00',
        status: 'Dikembalikan',
        ket: 'Pengiriman berkas laporan ke Kantor Pajak Pratama. Bensin full.'
      },
      {
        surat: '011/PINJAM/IT/X/2025',
        type: 'barang',
        itemId: insertedBarang[0].id,
        namaItem: insertedBarang[0].nama_barang,
        peminjam: 'Danang Wicaksono (Auditor Internal)',
        jumlah: 1,
        pinjam: '2025-10-08 09:00:00',
        kembali: '2025-10-12 16:00:00',
        status: 'Dikembalikan',
        ket: 'Audit lapangan cabang Bogor. Dikembalikan mulus beserta charger original.'
      },
      {
        surat: '014/SPT/DINAS/X/2025',
        type: 'kendaraan',
        itemId: insertedKendaraan[2].id,
        namaItem: `${insertedKendaraan[2].nama_kendaraan} (${insertedKendaraan[2].nomor_plat})`,
        peminjam: 'Drs. Supriyadi (Inspektur)',
        jumlah: 1,
        pinjam: '2025-10-14 07:00:00',
        kembali: '2025-10-16 19:30:00',
        status: 'Dikembalikan',
        ket: 'Kunjungan dinas koordinasi eselon II ke Bandung. STNK & Kunci diserahkan ke pos security.'
      }
    ];

    const insertedTrx = [];
    for (const t of transaksiData) {
      const res = await pool.query(
        `INSERT INTO transaksi (nomor_surat, item_type, item_id, nama_item, peminjam, jumlah, tanggal_pinjam, tanggal_kembali, status, keterangan)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [t.surat, t.type, t.itemId, t.namaItem, t.peminjam, t.jumlah, t.pinjam, t.kembali, t.status, t.ket]
      );
      insertedTrx.push(res.rows[0]);
    }
    console.log(`✅ ${insertedTrx.length} data Transaksi Oktober berhasil diinput.`);

    // 5. Insert Activity Log Kronologis Bulan Oktober 2025
    const logData = [
      {
        action: 'login',
        entity: 'auth',
        detail: 'Admin Gudang (admin@kantor.com) berhasil login ke sistem.',
        time: '2025-10-01 07:45:12'
      },
      {
        action: 'create',
        entity: 'barang',
        detail: 'Menambahkan stok awal inventaris barang periode Triwulan IV 2025.',
        time: '2025-10-01 08:30:00'
      },
      {
        action: 'create',
        entity: 'kendaraan',
        detail: 'Mendaftarkan unit kendaraan dinas operasional kantor dan jadwal pajak tahunan.',
        time: '2025-10-01 09:15:00'
      },
      {
        action: 'pinjam',
        entity: 'transaksi',
        detail: 'Peminjaman barang "Proyektor Epson EB-X500 HD" sebanyak 1 unit oleh Taufik Hidayat (Perencanaan) (No. Surat: 003/PINJAM/RAPAT/X/2025).',
        time: '2025-10-02 08:00:00'
      },
      {
        action: 'kembali',
        entity: 'transaksi',
        detail: 'Pengembalian barang "Proyektor Epson EB-X500 HD" (1 unit) oleh Taufik Hidayat telah selesai dicatat.',
        time: '2025-10-02 17:00:00'
      },
      {
        action: 'pinjam',
        entity: 'transaksi',
        detail: 'Peminjaman kendaraan "Honda Vario 160 CBS" (B 6128 KTR) oleh Agus Setiawan (Kurir) (No. Surat: 007/SPT/KTR/X/2025).',
        time: '2025-10-05 08:30:00'
      },
      {
        action: 'kembali',
        entity: 'transaksi',
        detail: 'Pengembalian kendaraan "Honda Vario 160 CBS" (B 6128 KTR) oleh Agus Setiawan telah selesai dicatat.',
        time: '2025-10-05 16:30:00'
      },
      {
        action: 'pinjam',
        entity: 'transaksi',
        detail: 'Peminjaman barang "Laptop Lenovo ThinkPad T14 Gen 3" sebanyak 1 unit oleh Danang Wicaksono (Auditor Internal) (No. Surat: 011/PINJAM/IT/X/2025).',
        time: '2025-10-08 09:00:00'
      },
      {
        action: 'kembali',
        entity: 'transaksi',
        detail: 'Pengembalian barang "Laptop Lenovo ThinkPad T14 Gen 3" (1 unit) oleh Danang Wicaksono telah selesai dicatat.',
        time: '2025-10-12 16:00:00'
      },
      {
        action: 'update',
        entity: 'barang',
        detail: 'Pengecekan kondisi berkala: "Kabel HDMI to VGA Adapter 3M" diubah menjadi Rusak Ringan.',
        time: '2025-10-15 15:00:00'
      },
      {
        action: 'pinjam',
        entity: 'transaksi',
        detail: 'Peminjaman barang "Printer HP LaserJet Pro MFP M428fdn" sebanyak 1 unit oleh Mega Utami (Sekretariat Pimpinan) (No. Surat: 032/PINJAM/SEK/X/2025).',
        time: '2025-10-18 09:00:00'
      },
      {
        action: 'pinjam',
        entity: 'transaksi',
        detail: 'Peminjaman barang "Laptop Lenovo ThinkPad T14 Gen 3" sebanyak 3 unit oleh Fadlan Ramadhan (Tim IT Support) (No. Surat: 019/PINJAM/IT/X/2025). Sisa stok: 9.',
        time: '2025-10-20 10:00:00'
      },
      {
        action: 'pinjam',
        entity: 'transaksi',
        detail: 'Peminjaman barang "Laptop Dell Latitude 5420" sebanyak 2 unit oleh Siti Nurhaliza (Pusdiklat) (No. Surat: 022/PINJAM/DIK/X/2025). Sisa stok: 6.',
        time: '2025-10-22 08:45:00'
      },
      {
        action: 'pinjam',
        entity: 'transaksi',
        detail: 'Peminjaman barang "Kabel Roll Terminal 15 Meter" sebanyak 2 unit oleh Eko Prasetyo (Teknisi Gedung) (No. Surat: 030/PINJAM/OPER/X/2025). Sisa stok: 8.',
        time: '2025-10-23 11:00:00'
      },
      {
        action: 'pinjam',
        entity: 'transaksi',
        detail: 'Peminjaman kendaraan "Toyota Kijang Innova Reborn 2.4 V" (B 1024 KTR) oleh Dr. Hendra Gunawan, S.E., M.M. (Kabag Umum) (No. Surat: 028/SPT/UMUM/X/2025).',
        time: '2025-10-24 07:30:00'
      },
      {
        action: 'pinjam',
        entity: 'transaksi',
        detail: 'Peminjaman barang "Proyektor Epson EB-X500 HD" sebanyak 1 unit oleh Bambang Sudiro (Bagian Keuangan) (No. Surat: 025/PINJAM/RAPAT/X/2025). Sisa stok: 4.',
        time: '2025-10-24 13:00:00'
      },
      {
        action: 'pinjam',
        entity: 'transaksi',
        detail: 'Peminjaman kendaraan "Toyota Avanza 1.3 G M/T" (B 1455 KTR) oleh Rian Kurniawan (Tim Protokol) (No. Surat: 031/SPT/PROT/X/2025).',
        time: '2025-10-25 08:15:00'
      },
      {
        action: 'pinjam',
        entity: 'transaksi',
        detail: 'Peminjaman barang "Kamera Sony Alpha A7 III (Dokumentasi)" sebanyak 1 unit oleh Dimas Prasetyo (Humas & Dokumentasi) (No. Surat: 027/PINJAM/HUMAS/X/2025). Sisa stok: 2.',
        time: '2025-10-25 09:30:00'
      },
      {
        action: 'pinjam',
        entity: 'transaksi',
        detail: 'Peminjaman barang "Sound Portable Wireless Speaker (Mic Set)" sebanyak 1 unit oleh Anisa Rahmawati (Panitia HUT Kantor) (No. Surat: 029/PINJAM/ACARA/X/2025). Sisa stok: 1.',
        time: '2025-10-25 14:00:00'
      },
      {
        action: 'pinjam',
        entity: 'transaksi',
        detail: 'Peminjaman kendaraan "Suzuki Carry Pickup Wide Deck" (B 9210 KTR) oleh Wahyu Hidayat (Staf Logistik Gudang) (No. Surat: 033/LOG/GUDANG/X/2025).',
        time: '2025-10-26 09:00:00'
      }
    ];

    for (const log of logData) {
      await pool.query(
        `INSERT INTO activity_log (action, entity_type, detail, timestamp)
         VALUES ($1, $2, $3, $4)`,
        [log.action, log.entity, log.detail, log.time]
      );
    }
    console.log(`✅ ${logData.length} data Activity Log Oktober berhasil diinput.`);

    console.log('🎉 Data Bulan Oktober 2025 Berhasil Dikonfigurasi!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal seeding data Oktober:', error);
    process.exit(1);
  }
}

seedOctoberData();
