const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const activityLogModel = require('../models/activityLogModel');

const authService = {
  async login(email, password) {
    if (!email || !password) {
      const err = new Error('Email dan password wajib diisi.');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      const err = new Error('Kredensial tidak valid.');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error('Kredensial tidak valid.');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const secret = process.env.JWT_SECRET || 'inven_auth_jwt_secure_token_secret_key';
    const token = jwt.sign(
      { id: user.id, email: user.email, nama: user.nama },
      secret,
      { expiresIn: '1d' }
    );

    // Catat activity log login
    await activityLogModel.log({
      action: 'login',
      entity_type: 'auth',
      entity_id: user.id,
      detail: `Admin ${user.nama} (${user.email}) berhasil login.`
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama
      }
    };
  },

  async getProfile(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      const err = new Error('Pengguna tidak ditemukan.');
      err.statusCode = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }
    return user;
  }
};

module.exports = authService;
