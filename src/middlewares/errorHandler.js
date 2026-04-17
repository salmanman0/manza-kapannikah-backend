const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const config = require('../config');

// ── Mongoose-specific transformers ────────────────────────────────────────────
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
  }));
  return ApiError.unprocessable('Validasi data gagal', errors);
};

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return ApiError.conflict(`${field} '${value}' sudah digunakan`);
};

const handleCastError = (err) =>
  ApiError.badRequest(`Nilai tidak valid untuk field '${err.path}'`);

// ── JWT transformers ──────────────────────────────────────────────────────────
const handleJWTError = () => ApiError.unauthorized('Token tidak valid');
const handleJWTExpiredError = () =>
  ApiError.unauthorized('Token sudah kedaluwarsa');

// ── Global error handler ──────────────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Transform known error types into ApiError
  if (err.name === 'ValidationError') error = handleValidationError(err);
  else if (err.code === 11000) error = handleDuplicateKeyError(err);
  else if (err.name === 'CastError') error = handleCastError(err);
  else if (err.name === 'JsonWebTokenError') error = handleJWTError();
  else if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // For truly unexpected errors, log and wrap
  if (!(error instanceof ApiError)) {
    logger.error('Unexpected error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
    error = ApiError.internal();
  }

  // Log 5xx errors with full context
  if (error.statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} → ${error.statusCode}`, {
      userId: req.user?.id,
      stack: err.stack,
    });
  }

  const response = {
    success: false,
    message: error.message,
    ...(error.errors && { errors: error.errors }),
    // Only expose stack trace in development
    ...(config.env === 'development' &&
      error.statusCode >= 500 && { stack: err.stack }),
  };

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
