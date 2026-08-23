const rateLimit = require('express-rate-limit');

/**
 * Login Rate Limiter (FR-1.4)
 * Mencegah brute-force login: max 10 requests per 15 menit
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.',
    code: 'TOO_MANY_REQUESTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter
};
