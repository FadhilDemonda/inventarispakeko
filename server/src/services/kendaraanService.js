const kendaraanModel = require('../models/kendaraanModel');
const activityLogModel = require('../models/activityLogModel');

/**
 * Helper menghitung status pajak on-the-fly (PRD §5.3)
 */
function computeStatusPajak(tanggalPajakStr) {
  if (!tanggalPajakStr) return 'Aktif';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pajakDate = new Date(tanggalPajakStr);
  pajakDate.setHours(0, 0, 0, 0);

  const diffTime = pajakDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status_pajak: 'Expired', sisa_hari: diffDays };
  } else if (diffDays <= 30) {
    return { status_pajak: 'Akan Habis', sisa_hari: diffDays };
  } else {
    return { status_pajak: 'Aktif', sisa_hari: diffDays };
  }
}

const kendaraanService = {
  async getAllKendaraan(filters) {
    const items = await kendaraanModel.findAll(filters);
    
    // Compute status_pajak dan status ketersediaan
    let mapped = items.map(k => {
      const { status_pajak, sisa_hari } = computeStatusPajak(k.tanggal_pajak);
      return {
        ...k,
        status_pajak,
        sisa_hari_pajak: sisa_hari,
        status_ketersediaan: k.peminjam ? 'Sedang Dipinjam' : 'Tersedia'
      };
    });

    if (filters && filters.status_pajak && filters.status_pajak !== 'all') {
      mapped = mapped.filter(k => k.status_pajak === filters.status_pajak);
    }

    return mapped;
  },

  async getKendaraanById(id) {
    const item = await kendaraanModel.findById(id);
    if (!item) {
      const err = new Error('Kendaraan tidak ditemukan.');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    const { status_pajak, sisa_hari } = computeStatusPajak(item.tanggal_pajak);
    return {
      ...item,
      status_pajak,
      sisa_hari_pajak: sisa_hari,
      status_ketersediaan: item.peminjam ? 'Sedang Dipinjam' : 'Tersedia'
    };
  },

  async createKendaraan(data) {
    const { nama_kendaraan, nomor_plat, satker, tanggal_pajak, keterangan } = data;

    if (!nama_kendaraan || !nomor_plat || !satker || !tanggal_pajak) {
      const err = new Error('Nama kendaraan, nomor plat, satker, dan tanggal pajak wajib diisi.');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const formattedPlat = nomor_plat.trim().toUpperCase();

    // Cek keunikan nomor plat
    const existing = await kendaraanModel.findByPlat(formattedPlat);
    if (existing) {
      const err = new Error(`Nomor plat "${formattedPlat}" sudah terdaftar dalam sistem.`);
      err.statusCode = 400;
      err.code = 'DUPLICATE_PLAT';
      throw err;
    }

    const created = await kendaraanModel.create({
      nama_kendaraan: nama_kendaraan.trim(),
      nomor_plat: formattedPlat,
      satker: satker.trim(),
      tanggal_pajak,
      keterangan: keterangan ? keterangan.trim() : null,
      peminjam: null
    });

    await activityLogModel.log({
      action: 'create',
      entity_type: 'kendaraan',
      entity_id: created.id,
      detail: `Menambahkan kendaraan baru "${created.nama_kendaraan}" (${created.nomor_plat}) untuk Satker ${created.satker}.`
    });

    const { status_pajak, sisa_hari } = computeStatusPajak(created.tanggal_pajak);
    return {
      ...created,
      status_pajak,
      sisa_hari_pajak: sisa_hari,
      status_ketersediaan: 'Tersedia'
    };
  },

  async updateKendaraan(id, data) {
    const existing = await kendaraanModel.findById(id);
    if (!existing) {
      const err = new Error('Kendaraan tidak ditemukan.');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    const { nama_kendaraan, nomor_plat, satker, tanggal_pajak, keterangan } = data;
    const formattedPlat = nomor_plat ? nomor_plat.trim().toUpperCase() : existing.nomor_plat;

    if (nomor_plat && formattedPlat !== existing.nomor_plat) {
      const duplicate = await kendaraanModel.findByPlat(formattedPlat, id);
      if (duplicate) {
        const err = new Error(`Nomor plat "${formattedPlat}" sudah dipakai oleh kendaraan lain.`);
        err.statusCode = 400;
        err.code = 'DUPLICATE_PLAT';
        throw err;
      }
    }

    const updated = await kendaraanModel.update(id, {
      nama_kendaraan: (nama_kendaraan || existing.nama_kendaraan).trim(),
      nomor_plat: formattedPlat,
      satker: (satker || existing.satker).trim(),
      tanggal_pajak: tanggal_pajak || existing.tanggal_pajak,
      keterangan: keterangan !== undefined ? keterangan : existing.keterangan
    });

    await activityLogModel.log({
      action: 'update',
      entity_type: 'kendaraan',
      entity_id: updated.id,
      detail: `Mengubah data kendaraan "${updated.nama_kendaraan}" (${updated.nomor_plat}).`
    });

    const { status_pajak, sisa_hari } = computeStatusPajak(updated.tanggal_pajak);
    return {
      ...updated,
      status_pajak,
      sisa_hari_pajak: sisa_hari,
      status_ketersediaan: updated.peminjam ? 'Sedang Dipinjam' : 'Tersedia'
    };
  },

  async deleteKendaraan(id) {
    const existing = await kendaraanModel.findById(id);
    if (!existing) {
      const err = new Error('Kendaraan tidak ditemukan.');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    if (existing.peminjam) {
      const err = new Error('Kendaraan tidak dapat dihapus karena saat ini sedang dipinjam.');
      err.statusCode = 400;
      err.code = 'ITEM_IN_USE';
      throw err;
    }

    const deleted = await kendaraanModel.delete(id);

    await activityLogModel.log({
      action: 'delete',
      entity_type: 'kendaraan',
      entity_id: id,
      detail: `Menghapus data kendaraan "${existing.nama_kendaraan}" (${existing.nomor_plat}).`
    });

    return deleted;
  },

  async getPajakAlerts() {
    const all = await this.getAllKendaraan({});
    const expired = all.filter(k => k.status_pajak === 'Expired');
    const akanHabis = all.filter(k => k.status_pajak === 'Akan Habis');

    return {
      total_alert: expired.length + akanHabis.length,
      expired,
      akanHabis
    };
  }
};

module.exports = kendaraanService;
