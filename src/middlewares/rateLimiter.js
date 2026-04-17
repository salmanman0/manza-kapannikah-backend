const rateLimit = require('express-rate-limit');

const createLimiter = (options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: options.message || 'Terlalu banyak permintaan. Coba lagi nanti.',
    },
    ...options,
  });

/**
 * Global limiter — applied to all /api routes
 * 100 requests per 15 minutes per IP
 */
const globalRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Terlalu banyak permintaan dari IP ini. Coba lagi dalam 15 menit.',
});

/**
 * Auth limiter — applied to login & register
 * 5 failed attempts per 15 minutes per IP
 */
const authRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.',
});

/**
 * OTP limiter — applied to send-otp & forgot-password
 * 3 requests per 10 minutes per IP
 */
const otpRateLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: 'Terlalu banyak permintaan OTP. Coba lagi dalam 10 menit.',
});

module.exports = { globalRateLimiter, authRateLimiter, otpRateLimiter };
