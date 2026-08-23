const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Membaca token dari httpOnly cookie 'token' atau Header Authorization 'Bearer <token>'
 * Sesuai Development Rules §3.4
 */
const authMiddleware = (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token otentikasi tidak ditemukan.',
        code: 'UNAUTHORIZED'
      });
    }

    const secret = process.env.JWT_SECRET || 'inven_auth_jwt_secure_token_secret_key';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Sesi login tidak valid atau telah kedaluwarsa.',
      code: 'INVALID_TOKEN'
    });
  }
};

module.exports = authMiddleware;
