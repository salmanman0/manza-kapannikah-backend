const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/refreshToken.model');
const config = require('../config');

/**
 * Signs a short-lived access token (default 15m).
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: 'kapannikah',
    audience: 'kapannikah-app',
  });
};

/**
 * Signs a long-lived refresh token (default 7d).
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'kapannikah',
    audience: 'kapannikah-app',
  });
};

/**
 * Generates both tokens and persists the refresh token in DB.
 */
const generateAuthTokens = async (userId, deviceInfo = {}) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  const payload = jwt.decode(refreshToken);
  const expiresAt = new Date(payload.exp * 1000);

  await RefreshToken.create({
    token: refreshToken,
    userId,
    deviceInfo,
    expiresAt,
  });

  return { accessToken, refreshToken };
};

/**
 * Verifies the access token signature and claims.
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.accessSecret, {
    issuer: 'kapannikah',
    audience: 'kapannikah-app',
  });
};

/**
 * Verifies the refresh token signature and claims.
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret, {
    issuer: 'kapannikah',
    audience: 'kapannikah-app',
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateAuthTokens,
  verifyAccessToken,
  verifyRefreshToken,
};
