const ApiError = require('../utils/ApiError');

/**
 * Role-based access control middleware.
 * Usage: authorize('admin') or authorize('admin', 'vendor')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Autentikasi diperlukan'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Akses ditolak. Role yang dibutuhkan: ${allowedRoles.join(' atau ')}`
        )
      );
    }

    next();
  };
};

module.exports = authorize;
