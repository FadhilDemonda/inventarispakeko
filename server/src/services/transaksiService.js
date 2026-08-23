const { withTransaction } = require('../config/db');
const barangModel = require('../models/barangModel');
const kendaraanModel = require('../models/kendaraanModel');
const transaksiModel = require('../models/transaksiModel');
const activityLogModel = require('../models/activityLogModel');

const transaksiService = {
  async getAllTransaksi(filters) {
    return await transaksiModel.findAll(filters);
  },

  async getTransaksiById(id) {
    const trx = await transaksiModel.findById(id);
    if (!trx) {
      const err = new Error('Data transaksi tidak ditemukan.');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return trx;
  },

  /**
   * Peminjaman Barang / Kendaraan dengan Database Transaction (ACID)
   * Sesuai Development Rules §2.3 & PRD §4.4
   */
  async pinjamItem(data) {
    const { nomor_surat, item_type, item_id, peminjam, jumlah, tanggal_pinjam, keterangan } = data;

    if (!item_type || !item_id || !peminjam) {
      const err = new Error('Tipe item, ID item, dan nama peminjam wajib diisi.');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    if (!['barang', 'kendaraan'].includes(item_type)) {
      const err = new Error('Tipe item harus "barang" atau "kendaraan".');
      err.statusCode = 400;
      err.code = 'INVALID_ITEM_TYPE';
      throw err;
    }

    return await withTransaction(async (client) => {
      if (item_type === 'barang') {
        const qty = parseInt(jumlah, 10) || 1;
        if (qty <= 0) {
          const err = new Error('Jumlah peminjaman barang harus lebih dari 0.');
          err.statusCode = 400;
          err.code = 'INVALID_QUANTITY';
          throw err;
        }

        const barang = await barangModel.findById(item_id, client);
        if (!barang) {
          const err = new Error('Barang tidak ditemukan.');
          err.statusCode = 404;
          err.code = 'NOT_FOUND';
          throw err;
        }

        // FR-4.5: Validasi stok tersedia
        if (barang.jumlah_tersedia < qty) {
          const err = new Error(`Stok "${barang.nama_barang}" tidak mencukupi. Tersedia: ${barang.jumlah_tersedia}, Diminta: ${qty}.`);
          err.statusCode = 400;
          err.code = 'INSUFFICIENT_STOCK';
          throw err;
        }

        const newTersedia = barang.jumlah_tersedia - qty;
        const newDigunakan = barang.jumlah_digunakan + qty;

        // 1. Update stok barang
        await barangModel.updateStock(barang.id, {
          jumlah_tersedia: newTersedia,
          jumlah_digunakan: newDigunakan
        }, client);

        // 2. Insert transaksi
        const trx = await transaksiModel.create({
          nomor_surat: nomor_surat || null,
          item_type: 'barang',
          item_id: barang.id,
          nama_item: barang.nama_barang,
          peminjam: peminjam.trim(),
          jumlah: qty,
          tanggal_pinjam: tanggal_pinjam || new Date(),
          keterangan: keterangan || null
        }, client);

        // 3. Insert activity log
        const suratNote = nomor_surat ? ` (No. Surat: ${nomor_surat.trim()})` : '';
        await activityLogModel.log({
          action: 'pinjam',
          entity_type: 'transaksi',
          entity_id: trx.id,
          detail: `Peminjaman barang "${barang.nama_barang}" sebanyak ${qty} unit oleh ${peminjam.trim()}${suratNote}. Sisa stok: ${newTersedia}.`
        }, client);

        return trx;
      } else {
        // Peminjaman Kendaraan (FR-4.4: 1 plat = 1 waktu)
        const kendaraan = await kendaraanModel.findById(item_id, client);
        if (!kendaraan) {
          const err = new Error('Kendaraan tidak ditemukan.');
          err.statusCode = 404;
          err.code = 'NOT_FOUND';
          throw err;
        }

        if (kendaraan.peminjam) {
          const err = new Error(`Kendaraan "${kendaraan.nama_kendaraan}" (${kendaraan.nomor_plat}) sedang dipinjam oleh ${kendaraan.peminjam}.`);
          err.statusCode = 400;
          err.code = 'VEHICLE_ALREADY_BORROWED';
          throw err;
        }

        // 1. Update peminjam di kendaraan
        await kendaraanModel.updatePeminjam(kendaraan.id, peminjam.trim(), client);

        // 2. Insert transaksi
        const trx = await transaksiModel.create({
          nomor_surat: nomor_surat || null,
          item_type: 'kendaraan',
          item_id: kendaraan.id,
          nama_item: `${kendaraan.nama_kendaraan} (${kendaraan.nomor_plat})`,
          peminjam: peminjam.trim(),
          jumlah: 1,
          tanggal_pinjam: tanggal_pinjam || new Date(),
          keterangan: keterangan || null
        }, client);

        // 3. Insert activity log
        const suratNote = nomor_surat ? ` (No. Surat: ${nomor_surat.trim()})` : '';
        await activityLogModel.log({
          action: 'pinjam',
          entity_type: 'transaksi',
          entity_id: trx.id,
          detail: `Peminjaman kendaraan "${kendaraan.nama_kendaraan}" (${kendaraan.nomor_plat}) oleh ${peminjam.trim()}${suratNote}.`
        }, client);

        return trx;
      }
    });
  },

  /**
   * Pengembalian Item dengan Database Transaction (ACID)
   * Sesuai Development Rules §2.3 & PRD §4.4
   */
  async returnItem(transaksiId, data = {}) {
    const { tanggal_kembali, keterangan } = data;

    return await withTransaction(async (client) => {
      const trx = await transaksiModel.findById(transaksiId, client);
      if (!trx) {
        const err = new Error('Data transaksi tidak ditemukan.');
        err.statusCode = 404;
        err.code = 'NOT_FOUND';
        throw err;
      }

      if (trx.status === 'Dikembalikan') {
        const err = new Error('Item dalam transaksi ini sudah dikembalikan sebelumnya.');
        err.statusCode = 400;
        err.code = 'ALREADY_RETURNED';
        throw err;
      }

      if (trx.item_type === 'barang') {
        const barang = await barangModel.findById(trx.item_id, client);
        if (barang) {
          const newTersedia = barang.jumlah_tersedia + trx.jumlah;
          const newDigunakan = Math.max(0, barang.jumlah_digunakan - trx.jumlah);

          // 1. Kembalikan stok barang
          await barangModel.updateStock(barang.id, {
            jumlah_tersedia: newTersedia,
            jumlah_digunakan: newDigunakan
          }, client);
        }
      } else if (trx.item_type === 'kendaraan') {
        // 1. Kosongkan peminjam kendaraan
        await kendaraanModel.updatePeminjam(trx.item_id, null, client);
      }

      // 2. Update status transaksi
      const updatedTrx = await transaksiModel.returnItem(transaksiId, {
        tanggal_kembali: tanggal_kembali || new Date(),
        keterangan: keterangan || trx.keterangan
      }, client);

      // 3. Insert activity log
      await activityLogModel.log({
        action: 'kembali',
        entity_type: 'transaksi',
        entity_id: updatedTrx.id,
        detail: `Pengembalian ${trx.item_type} "${trx.nama_item}" (${trx.jumlah} unit) oleh ${trx.peminjam} telah selesai dicatat.`
      }, client);

      return updatedTrx;
    });
  }
};

module.exports = transaksiService;
