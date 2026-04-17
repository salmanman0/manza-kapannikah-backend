const crypto = require('crypto');
const AccessToken = require('../models/accessToken.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * DB-based token authentication.
 * Validates the Bearer token against the AccessToken collection.
 * Attaches req.user and req.plainToken for downstream use (e.g. logout).
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Autentikasi diperlukan');
  }

  const plainToken = authHeader.split(' ')[1];
  if (!plainToken) {
    throw ApiError.unauthorized('Token tidak ditemukan');
  }

  // Hash the incoming token to compare with DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(plainToken)
    .digest('hex');

  // Note: we use select('+token') because token field has select:false
  const tokenRecord = await AccessToken.findOne({ token: hashedToken }).select('+token');
  if (!tokenRecord) {
    throw ApiError.unauthorized('Token tidak valid atau sesi sudah berakhir. Silakan login kembali.');
  }

  const user = await User.findById(tokenRecord.userId);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Pengguna tidak ditemukan atau tidak aktif');
  }

  // Update last used timestamp (fire & forget — don't await)
  AccessToken.findByIdAndUpdate(tokenRecord._id, {
    lastUsedAt: new Date(),
  }).exec();

  req.user = user;
  req.plainToken = plainToken; // needed by logout handler
  next();
});

module.exports = authenticate;

module.exports = authenticate;
