const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const validate = require('../../../middlewares/validate');
const authenticate = require('../../../middlewares/authenticate');
const { authRateLimiter, otpRateLimiter } = require('../../../middlewares/rateLimiter');
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

// ── OTP routes (password reset only) ─────────────────────────────────────────
router.post(
    '/send-otp',
    otpRateLimiter,
    validate(authValidation.sendOtp),
    authController.sendOtp
);

router.post(
    '/verify-otp',
    validate(authValidation.verifyOtp),
    authController.verifyOtp
);

// ── Password reset routes ─────────────────────────────────────────────────────
router.post(
    '/forgot-password',
    otpRateLimiter,
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
