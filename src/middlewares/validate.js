const ApiError = require('../utils/ApiError');

/**
 * Validates req.body against a Joi schema.
 * Strips unknown fields and returns structured field errors on failure.
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    return next(ApiError.unprocessable('Validasi gagal', errors));
  }

  // Replace body with sanitized & validated value
  req.body = value;
  next();
};

module.exports = validate;
