const { query } = require('../config/db');

const barangModel = {
  async findAll({ search, kondisi }) {
    let sql = 'SELECT * FROM barang WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND nama_barang ILIKE $${params.length}`;
    }

    if (kondisi && kondisi !== 'all') {
      params.push(kondisi);
      sql += ` AND kondisi = $${params.length}`;
    }

    sql += ' ORDER BY nama_barang ASC';
    const res = await query(sql, params);
    return res.rows;
  },

  async findById(id, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const res = await runner('SELECT * FROM barang WHERE id = $1', [id]);
    return res.rows[0];
  },

  async create({ nama_barang, kondisi, total_jumlah, jumlah_tersedia, jumlah_digunakan }, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const res = await runner(
      `INSERT INTO barang (nama_barang, kondisi, total_jumlah, jumlah_tersedia, jumlah_digunakan, tanggal_update)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [nama_barang, kondisi, total_jumlah, jumlah_tersedia, jumlah_digunakan]
    );
    return res.rows[0];
  },

  async update(id, { nama_barang, kondisi, total_jumlah, jumlah_tersedia, jumlah_digunakan }, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const res = await runner(
      `UPDATE barang
       SET nama_barang = $1, kondisi = $2, total_jumlah = $3, jumlah_tersedia = $4, jumlah_digunakan = $5, tanggal_update = NOW()
       WHERE id = $6
       RETURNING *`,
      [nama_barang, kondisi, total_jumlah, jumlah_tersedia, jumlah_digunakan, id]
    );
    return res.rows[0];
  },

  async updateStock(id, { jumlah_tersedia, jumlah_digunakan }, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const res = await runner(
      `UPDATE barang
       SET jumlah_tersedia = $1, jumlah_digunakan = $2, tanggal_update = NOW()
       WHERE id = $3
       RETURNING *`,
      [jumlah_tersedia, jumlah_digunakan, id]
    );
    return res.rows[0];
  },

  async delete(id, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const res = await runner('DELETE FROM barang WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
};

module.exports = barangModel;
