const path = require('path');
const fs = require('fs');
const authService = require('./auth.service');
const ApiResponse = require('../../../utils/ApiResponse');
const asyncHandler = require('../../../utils/asyncHandler');

const WEB_TEMPLATES = path.join(__dirname, '../../../templates/web');

// ── POST /api/v1/auth/register ────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    return ApiResponse.created(res, null, result.message);
});

// ── GET /api/v1/auth/verify-email?token=xxx ───────────────────────────────────
const verifyEmail = async (req, res) => {
    try {
        await authService.verifyEmail(req.query.token);
        const html = fs.readFileSync(path.join(WEB_TEMPLATES, 'verifyEmailSuccess.html'), 'utf8');
        return res.status(200).type('html').send(html);
    } catch (_err) {
        const html = fs.readFileSync(path.join(WEB_TEMPLATES, 'verifyEmailError.html'), 'utf8');
        return res.status(400).type('html').send(html);
    }
};

// ── POST /api/v1/auth/login ───────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
    const deviceInfo = {userAgent: req.get('user-agent'), ip: req.ip};
    const result = await authService.login(
        req.body.email,
        req.body.password,
        deviceInfo
    );
    return ApiResponse.success(res, result, 'Login berhasil');
});

// ── POST /api/v1/auth/logout ──────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
    await authService.logout(req.plainToken);
    return ApiResponse.success(res, null, 'Logout berhasil');
});

// ── POST /api/v1/auth/logout-all ─────────────────────────────────────────────
const logoutAllDevices = asyncHandler(async (req, res) => {
    await authService.logoutAllDevices(req.user.id);
    return ApiResponse.success(res, null, 'Logout dari semua perangkat berhasil');
});

// ── POST /api/v1/auth/google ───────────────────────────────────────────────────
const googleAuth = asyncHandler(async (req, res) => {
    const deviceInfo = { userAgent: req.get('user-agent'), ip: req.ip };
    const result = await authService.googleAuth(req.body.idToken, deviceInfo);
    return ApiResponse.success(res, result, 'Login dengan Google berhasil');
});

// ── POST /api/v1/auth/forgot-password ────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    return ApiResponse.success(
        res,
        null,
        'Jika email terdaftar, instruksi reset password akan dikirim'
    );
});

// ── POST /api/v1/auth/reset-password ─────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body.token, req.body.password);
    return ApiResponse.success(res, null, 'Password berhasil direset. Silakan login kembali.');
});

module.exports = {
    register,
    verifyEmail,
    login,
    logout,
    logoutAllDevices,
    googleAuth,
    forgotPassword,
    resetPassword,
};
