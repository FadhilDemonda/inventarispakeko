const authService = require('../services/authService');

const authController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { token, user } = await authService.login(email, password);

      // Simpan token di httpOnly cookie (Development Rules §3.4)
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 hari
      });

      res.json({
        success: true,
        message: 'Login berhasil.',
        data: { token, user }
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res) {
    res.clearCookie('token');
    res.json({
      success: true,
      message: 'Logout berhasil.'
    });
  },

  async getMe(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
