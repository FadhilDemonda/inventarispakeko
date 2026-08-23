const { query } = require('../config/db');

const transaksiModel = {
  async findAll({ item_type, status, startDate, endDate, search }) {
    let sql = 'SELECT * FROM transaksi WHERE 1=1';
    const params = [];

    if (item_type && item_type !== 'all') {
      params.push(item_type);
      sql += ` AND item_type = $${params.length}`;
    }

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (startDate) {
      params.push(startDate);
      sql += ` AND tanggal_pinjam >= $${params.length}`;
    }

    if (endDate) {
      params.push(`${endDate} 23:59:59`);
      sql += ` AND tanggal_pinjam <= $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (nama_item ILIKE $${params.length} OR peminjam ILIKE $${params.length} OR nomor_surat ILIKE $${params.length})`;
    }

    sql += ' ORDER BY tanggal_pinjam DESC';
    const res = await query(sql, params);
    return res.rows;
  },

  async findById(id, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const res = await runner('SELECT * FROM transaksi WHERE id = $1', [id]);
    return res.rows[0];
  },

  async findActiveByKendaraanId(kendaraanId, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const res = await runner(
      `SELECT * FROM transaksi
       WHERE item_type = 'kendaraan' AND item_id = $1 AND status = 'Dipinjam'`,
      [kendaraanId]
    );
    return res.rows[0];
  },

  async create({ nomor_surat, item_type, item_id, nama_item, peminjam, jumlah, tanggal_pinjam, keterangan }, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const res = await runner(
      `INSERT INTO transaksi (nomor_surat, item_type, item_id, nama_item, peminjam, jumlah, tanggal_pinjam, status, keterangan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Dipinjam', $8)
       RETURNING *`,
      [nomor_surat ? nomor_surat.trim() : null, item_type, item_id, nama_item, peminjam, jumlah || 1, tanggal_pinjam || new Date(), keterangan || null]
    );
    return res.rows[0];
  },

  async returnItem(id, { tanggal_kembali, keterangan }, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const res = await runner(
      `UPDATE transaksi
       SET tanggal_kembali = $1, status = 'Dikembalikan', keterangan = COALESCE($2, keterangan)
       WHERE id = $3
       RETURNING *`,
      [tanggal_kembali || new Date(), keterangan, id]
    );
    return res.rows[0];
  }
};

module.exports = transaksiModel;
