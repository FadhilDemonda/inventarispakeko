const { query } = require('../config/db');

const activityLogModel = {
  async findAll({ limit = 50, offset = 0, entity_type, action }) {
    let sql = 'SELECT * FROM activity_log WHERE 1=1';
    const params = [];

    if (entity_type && entity_type !== 'all') {
      params.push(entity_type);
      sql += ` AND entity_type = $${params.length}`;
    }

    if (action && action !== 'all') {
      params.push(action);
      sql += ` AND action = $${params.length}`;
    }

    sql += ' ORDER BY timestamp DESC';

    params.push(limit);
    sql += ` LIMIT $${params.length}`;

    params.push(offset);
    sql += ` OFFSET $${params.length}`;

    const res = await query(sql, params);
    return res.rows;
  },

  async countAll({ entity_type, action }) {
    let sql = 'SELECT COUNT(*) FROM activity_log WHERE 1=1';
    const params = [];

    if (entity_type && entity_type !== 'all') {
      params.push(entity_type);
      sql += ` AND entity_type = $${params.length}`;
    }

    if (action && action !== 'all') {
      params.push(action);
      sql += ` AND action = $${params.length}`;
    }

    const res = await query(sql, params);
    return parseInt(res.rows[0].count, 10);
  },

  async log({ action, entity_type, entity_id, detail }, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const res = await runner(
      `INSERT INTO activity_log (action, entity_type, entity_id, detail, timestamp)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [action, entity_type, entity_id || null, detail]
    );
    return res.rows[0];
  }
};

module.exports = activityLogModel;
