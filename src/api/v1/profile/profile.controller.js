const profileService = require('./profile.service');
const ApiResponse = require('../../../utils/ApiResponse');
const asyncHandler = require('../../../utils/asyncHandler');

// ── GET /api/v1/profile/me ────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
    const profile = await profileService.getMe(req.user.id);
    return ApiResponse.success(res, profile, 'Berhasil mendapatkan profil');
});

// ── PATCH /api/v1/profile/me ──────────────────────────────────────────────────
const updateMe = asyncHandler(async (req, res) => {
    const profile = await profileService.updateMe(req.user.id, req.body);
    return ApiResponse.success(res, profile, 'Profil berhasil diperbarui');
});

// ── PATCH /api/v1/profile/me/password ────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await profileService.changePassword(req.user.id, currentPassword, newPassword);
    return ApiResponse.success(
        res,
        null,
        'Password berhasil diubah. Silakan login kembali.'
    );
});

// ── PATCH /api/v1/profile/me/preferences ─────────────────────────────────────
const updatePreferences = asyncHandler(async (req, res) => {
    const profile = await profileService.updatePreferences(req.user.id, req.body);
    return ApiResponse.success(res, profile, 'Preferensi berhasil diperbarui');
});

module.exports = { getMe, updateMe, changePassword, updatePreferences };
