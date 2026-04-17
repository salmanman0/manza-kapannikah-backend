const crypto = require('crypto');
const User = require('../../../models/user.model');
const AccessToken = require('../../../models/accessToken.model');
const OtpCode = require('../../../models/otpCode.model');
const ApiError = require('../../../utils/ApiError');
const otpHelper = require('../../../utils/otpHelper');
const emailService = require('../../../utils/emailService');
const config = require('../../../config');
const logger = require('../../../utils/logger');

class AuthService {
    // ── Register ────────────────────────────────────────────────────────────────
    async register(data) {
        const { name, email, phone, password } = data;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw ApiError.conflict('Email sudah terdaftar');
        }

        // Generate email verification token (hashed for DB, plain for link)
        const plainVerifyToken = crypto.randomBytes(32).toString('hex');
        const hashedVerifyToken = crypto
            .createHash('sha256')
            .update(plainVerifyToken)
            .digest('hex');

        const user = await User.create({
            name,
            email,
            phone,
            password,
            emailVerificationToken: hashedVerifyToken,
            emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 jam
        });

        // Send verification email
        const verifyUrl = `${config.appUrl}/api/v1/auth/verify-email?token=${plainVerifyToken}`;
        try {
            await emailService.sendVerificationEmail(user.email, user.name, verifyUrl);
        } catch (emailError) {
            // emailService sudah handle fallback di development — ini hanya terjadi di production
            logger.error('[Register] Gagal mengirim email verifikasi:', emailError);
            await User.findByIdAndDelete(user._id);
            throw ApiError.internal('Gagal mengirim email verifikasi. Silakan coba lagi.');
        }

        return {
            message: 'Silahkan verifikasi email anda dengan meninjau email yang kami kirimkan',
        };
    }

    // ── Verify Email (via link) ─────────────────────────────────────────────────
    async verifyEmail(plainToken) {
        const hashedToken = crypto
            .createHash('sha256')
            .update(plainToken)
            .digest('hex');

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: new Date() },
        });

        if (!user) {
            throw ApiError.badRequest(
                'Link verifikasi tidak valid atau sudah kedaluwarsa. Silakan daftar ulang.'
            );
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return { message: 'Email berhasil diverifikasi. Silakan login.' };
    }

    // ── Login ───────────────────────────────────────────────────────────────────
    async login(email, password, deviceInfo = {}) {
        const user = await User.findOne({ email, isActive: true }).select('+password');

        // Same error message for invalid email & wrong password (prevent enumeration)
        if (!user || !(await user.comparePassword(password))) {
            throw ApiError.unauthorized('Email atau password salah');
        }

        if (!user.isEmailVerified) {
            throw ApiError.unauthorized(
                'Akun Anda belum melakukan verified email. Silahkan cek email untuk melakukan verifikasi'
            );
        }

        user.lastLoginAt = new Date();
        await user.save({ validateBeforeSave: false });

        const accessToken = await this._createAccessToken(user._id, deviceInfo);

        return {
            user: this._response(user),
            accessToken,
        };
    }

    // ── Logout (current device) ─────────────────────────────────────────────────
    async logout(plainToken) {
        const hashedToken = crypto
            .createHash('sha256')
            .update(plainToken)
            .digest('hex');
        await AccessToken.deleteOne({ token: hashedToken });
    }

    // ── Logout all devices ──────────────────────────────────────────────────────
    async logoutAllDevices(userId) {
        await AccessToken.deleteMany({ userId });
    }

    // ── Send OTP (password reset only) ─────────────────────────────────────────
    async sendOtp(email, type) {
        const user = await User.findOne({ email, isActive: true });
        if (!user) {
            // Silent return to prevent email enumeration
            return { message: `Jika email terdaftar, OTP akan dikirim ke ${email}` };
        }

        // Invalidate all previous unused OTPs of same type
        await OtpCode.deleteMany({ userId: user._id, type, isUsed: false });

        const plainCode = otpHelper.generateOtp();
        const hashedCode = otpHelper.hashOtp(plainCode);

        await OtpCode.create({
            userId: user._id,
            email,
            code: hashedCode,
            type,
            expiresAt: new Date(Date.now() + config.otp.expiresInMinutes * 60 * 1000),
        });

        // TODO: kirim OTP via email (saat ini hanya di-log)
        logger.info(`[OTP] ${email} → ${plainCode}`);

        return { message: `OTP telah dikirim ke ${email}` };
    }

    // ── Verify OTP ──────────────────────────────────────────────────────────────
    async verifyOtp(email, code, type) {
        const otpRecord = await OtpCode.findOne({
            email,
            type,
            isUsed: false,
            expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            throw ApiError.badRequest('OTP tidak valid atau sudah kedaluwarsa');
        }

        if (otpRecord.attempts >= config.otp.maxAttempts) {
            throw ApiError.tooManyRequests(
                'Terlalu banyak percobaan salah. Silakan minta OTP baru.'
            );
        }

        const isValid = otpHelper.verifyOtp(code, otpRecord.code);
        if (!isValid) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            const remaining = config.otp.maxAttempts - otpRecord.attempts;
            throw ApiError.badRequest(
                `OTP salah. ${remaining > 0 ? `Sisa percobaan: ${remaining}` : 'Silakan minta OTP baru.'}`
            );
        }

        otpRecord.isUsed = true;
        await otpRecord.save();

        return { message: 'OTP berhasil diverifikasi' };
    }

    // ── Forgot password ─────────────────────────────────────────────────────────
    async forgotPassword(email) {
        const user = await User.findOne({ email, isActive: true });
        if (!user) return; // Silent — prevent email enumeration

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 jam
        await user.save({ validateBeforeSave: false });

        // TODO: kirim link reset via email (saat ini hanya di-log)
        const resetUrl = `${config.appUrl}/api/v1/auth/reset-password?token=${resetToken}`;
        logger.info(`[RESET PASSWORD] ${email} → ${resetUrl}`);
    }

    // ── Reset password ──────────────────────────────────────────────────────────
    async resetPassword(token, password) {
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() },
        }).select('+password');

        if (!user) {
            throw ApiError.badRequest('Token reset tidak valid atau sudah kedaluwarsa');
        }

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // Invalidate all active sessions after password reset
        await this.logoutAllDevices(user._id);
    }

    // ── Private: generate & store opaque access token ──────────────────────────
    async _createAccessToken(userId, deviceInfo = {}) {
        const plainToken = crypto.randomBytes(40).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(plainToken)
            .digest('hex');

        await AccessToken.create({ token: hashedToken, userId, deviceInfo });
        return plainToken;
    }

    // ── Private: safe user shape for responses ──────────────────────────────────
    _response(user) {
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone ?? null,
            initials: user.initials,
            isEmailVerified: user.isEmailVerified,
            role: user.role,
        };
    }
}

module.exports = new AuthService();
