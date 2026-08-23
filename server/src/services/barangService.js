const barangModel = require('../models/barangModel');
const activityLogModel = require('../models/activityLogModel');

const barangService = {
  async getAllBarang(filters) {
    const items = await barangModel.findAll(filters);
    // Tambahkan computed status ketersediaan untuk frontend UX
    return items.map(item => ({
      ...item,
      status_ketersediaan: item.jumlah_tersedia === 0 
        ? 'Habis' 
        : item.jumlah_digunakan > 0 
          ? 'Sebagian Dipinjam' 
          : 'Tersedia Lengkap'
    }));
  },

  async getBarangById(id) {
    const item = await barangModel.findById(id);
    if (!item) {
      const err = new Error('Barang tidak ditemukan.');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return {
      ...item,
      status_ketersediaan: item.jumlah_tersedia === 0 
        ? 'Habis' 
        : item.jumlah_digunakan > 0 
          ? 'Sebagian Dipinjam' 
          : 'Tersedia Lengkap'
    };
  },

  async createBarang(data) {
    const { nama_barang, kondisi, total_jumlah } = data;

    if (!nama_barang || total_jumlah === undefined || total_jumlah === null) {
      const err = new Error('Nama barang dan total jumlah wajib diisi.');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const total = parseInt(total_jumlah, 10);
    if (isNaN(total) || total < 0) {
      const err = new Error('Total jumlah harus berupa angka non-negatif.');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    // Computed: saat create awal, jumlah_digunakan = 0, jumlah_tersedia = total_jumlah
    const newItem = await barangModel.create({
      nama_barang: nama_barang.trim(),
      kondisi: kondisi || 'Baik',
      total_jumlah: total,
      jumlah_tersedia: total,
      jumlah_digunakan: 0
    });

    await activityLogModel.log({
      action: 'create',
      entity_type: 'barang',
      entity_id: newItem.id,
      detail: `Menambahkan barang baru "${newItem.nama_barang}" dengan total stok ${newItem.total_jumlah} unit (Kondisi: ${newItem.kondisi}).`
    });

    return newItem;
  },

  async updateBarang(id, data) {
    const existing = await barangModel.findById(id);
    if (!existing) {
      const err = new Error('Barang tidak ditemukan.');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    const { nama_barang, kondisi, total_jumlah } = data;
    const newTotal = total_jumlah !== undefined ? parseInt(total_jumlah, 10) : existing.total_jumlah;

    if (isNaN(newTotal) || newTotal < 0) {
      const err = new Error('Total jumlah harus berupa angka non-negatif.');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    // Validasi: Total stok baru tidak boleh lebih kecil dari barang yang saat ini sedang dipinjam
    if (newTotal < existing.jumlah_digunakan) {
      const err = new Error(
        `Total stok (${newTotal}) tidak boleh lebih kecil dari jumlah yang sedang dipinjam (${existing.jumlah_digunakan}).`
      );
      err.statusCode = 400;
      err.code = 'INVALID_TOTAL_STOCK';
      throw err;
    }

    // Computed: jumlah_tersedia = newTotal - existing.jumlah_digunakan
    const newJumlahTersedia = newTotal - existing.jumlah_digunakan;

    const updated = await barangModel.update(id, {
      nama_barang: (nama_barang || existing.nama_barang).trim(),
      kondisi: kondisi || existing.kondisi,
      total_jumlah: newTotal,
      jumlah_tersedia: newJumlahTersedia,
      jumlah_digunakan: existing.jumlah_digunakan
    });

    await activityLogModel.log({
      action: 'update',
      entity_type: 'barang',
      entity_id: updated.id,
      detail: `Mengubah data barang "${updated.nama_barang}" (Total: ${updated.total_jumlah}, Kondisi: ${updated.kondisi}).`
    });

    return updated;
  },

  async deleteBarang(id) {
    const existing = await barangModel.findById(id);
    if (!existing) {
      const err = new Error('Barang tidak ditemukan.');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    if (existing.jumlah_digunakan > 0) {
      const err = new Error('Barang tidak dapat dihapus karena masih ada unit yang sedang dipinjam.');
      err.statusCode = 400;
      err.code = 'ITEM_IN_USE';
      throw err;
    }

    const deleted = await barangModel.delete(id);

    await activityLogModel.log({
      action: 'delete',
      entity_type: 'barang',
      entity_id: id,
      detail: `Menghapus data barang "${existing.nama_barang}".`
    });

    return deleted;
  }
};

module.exports = barangService;
