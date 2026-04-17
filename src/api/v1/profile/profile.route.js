const express = require('express');
const router = express.Router();

const profileController = require('./profile.controller');
const authenticate = require('../../../middlewares/authenticate');
const validate = require('../../../middlewares/validate');
const profileValidation = require('./profile.validation');

// All profile routes require valid access token
router.use(authenticate);

// ── GET  /api/v1/profile/me ───────────────────────────────────────────────────
router.get('/me', profileController.getMe);

// ── PATCH /api/v1/profile/me ──────────────────────────────────────────────────
router.patch(
    '/me',
    validate(profileValidation.updateProfile),
    profileController.updateMe
);

// ── PATCH /api/v1/profile/me/password ────────────────────────────────────────
router.patch(
    '/me/password',
    validate(profileValidation.changePassword),
    profileController.changePassword
);

// ── PATCH /api/v1/profile/me/preferences ─────────────────────────────────────
router.patch(
    '/me/preferences',
    validate(profileValidation.updatePreferences),
    profileController.updatePreferences
);

module.exports = router;
