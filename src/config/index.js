'use strict';

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/kapannikah',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  },

  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
  },

  otp: {
    expiresInMinutes: parseInt(process.env.OTP_EXPIRES_IN_MINUTES, 10) || 5,
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 3,
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },

  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM || '"KapanNikah" <no-reply@manzastudio.id>',
  },

  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate critical env vars in production
if (config.env === 'production') {
  const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'MONGO_URI'];
  required.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });
}

module.exports = config;
