const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const validate = require('../../../middlewares/validate');
const authenticate = require('../../../middlewares/authenticate');
const { authRateLimiter } = require('../../../middlewares/rateLimiter');
const authValidation = require('./auth.validation');

// ── Public routes ─────────────────────────────────────────────────────────────
router.post(
    '/register',
    authRateLimiter,
    validate(authValidation.register),
    authController.register
);

// GET — browser opens this link from email
router.get('/verify-email', authController.verifyEmail);

router.post(
    '/login',
    authRateLimiter,
    validate(authValidation.login),
    authController.login
);

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.post(
    '/google',
    authRateLimiter,
    validate(authValidation.googleAuth),
    authController.googleAuth
);

// ── Password reset routes ─────────────────────────────────────────────────────
router.post(
    '/forgot-password',
    authRateLimiter,
    validate(authValidation.forgotPassword),
    authController.forgotPassword
);

router.post(
    '/reset-password',
    validate(authValidation.resetPassword),
    authController.resetPassword
);

// ── Protected routes (requires valid access token) ────────────────────────────
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAllDevices);

module.exports = router;
