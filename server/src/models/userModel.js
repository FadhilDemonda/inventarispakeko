const { query } = require('../config/db');

const userModel = {
  async findByEmail(email) {
    const res = await query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  },

  async findById(id) {
    const res = await query('SELECT id, email, nama, created_at FROM users WHERE id = $1', [id]);
    return res.rows[0];
  }
};

module.exports = userModel;
