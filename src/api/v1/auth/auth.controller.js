const authService = require('./auth.service');
const ApiResponse = require('../../../utils/ApiResponse');
const asyncHandler = require('../../../utils/asyncHandler');

// ── POST /api/v1/auth/register ────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    return ApiResponse.created(res, null, result.message);
});

// ── GET /api/v1/auth/verify-email?token=xxx ───────────────────────────────────
const verifyEmail = asyncHandler(async (req, res) => {
    const result = await authService.verifyEmail(req.query.token);
    return ApiResponse.success(res, null, result.message);
});

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

// ── POST /api/v1/auth/send-otp ────────────────────────────────────────────────
const sendOtp = asyncHandler(async (req, res) => {
    const result = await authService.sendOtp(req.body.email, req.body.type);
    return ApiResponse.success(res, null, result?.message || 'OTP berhasil dikirim');
});

// ── POST /api/v1/auth/verify-otp ─────────────────────────────────────────────
const verifyOtp = asyncHandler(async (req, res) => {
    const result = await authService.verifyOtp(
        req.body.email,
        req.body.code,
        req.body.type
    );
    return ApiResponse.success(res, null, result.message);
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
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
};
