const { query } = require('../config/db');

const kendaraanModel = {
  async findAll({ search, satker }) {
    let sql = 'SELECT * FROM kendaraan WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (nama_kendaraan ILIKE $${params.length} OR nomor_plat ILIKE $${params.length})`;
    }

    if (satker && satker !== 'all') {
      params.push(satker);
      sql += ` AND satker = $${params.length}`;
    }

    sql += ' ORDER BY nama_kendaraan ASC';
    const res = await query(sql, params);
    return res.rows;
  },

  async findById(id, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const res = await runner('SELECT * FROM kendaraan WHERE id = $1', [id]);
    return res.rows[0];
  },

  async findByPlat(nomor_plat, excludeId = null) {
    let sql = 'SELECT * FROM kendaraan WHERE nomor_plat = $1';
    const params = [nomor_plat];
    if (excludeId) {
      params.push(excludeId);
      sql += ' AND id != $2';
    }
    const res = await query(sql, params);
    return res.rows[0];
  },

  async create({ nama_kendaraan, nomor_plat, satker, tanggal_pajak, keterangan, peminjam }, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const res = await runner(
      `INSERT INTO kendaraan (nama_kendaraan, nomor_plat, satker, tanggal_pajak, keterangan, peminjam, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [nama_kendaraan, nomor_plat, satker, tanggal_pajak, keterangan || null, peminjam || null]
    );
    return res.rows[0];
  },

  async update(id, { nama_kendaraan, nomor_plat, satker, tanggal_pajak, keterangan }, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const res = await runner(
      `UPDATE kendaraan
       SET nama_kendaraan = $1, nomor_plat = $2, satker = $3, tanggal_pajak = $4, keterangan = $5
       WHERE id = $6
       RETURNING *`,
      [nama_kendaraan, nomor_plat, satker, tanggal_pajak, keterangan || null, id]
    );
    return res.rows[0];
  },

  async updatePeminjam(id, peminjam, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const res = await runner(
      `UPDATE kendaraan
       SET peminjam = $1
       WHERE id = $2
       RETURNING *`,
      [peminjam, id]
    );
    return res.rows[0];
  },

  async delete(id, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const res = await runner('DELETE FROM kendaraan WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
};

module.exports = kendaraanModel;
