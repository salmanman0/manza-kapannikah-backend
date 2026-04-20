const User = require('../../../models/user.model');
const AccessToken = require('../../../models/accessToken.model');
const ApiError = require('../../../utils/ApiError');

class ProfileService {
    // ── Get my profile ──────────────────────────────────────────────────────────
    async getMe(userId) {
        const user = await User.findById(userId);
        if (!user) throw ApiError.notFound('Pengguna tidak ditemukan');
        return this._response(user);
    }

    // ── Update profile (name, email, phone, kota, provinsi) ───────────────────
    async updateMe(userId, data) {
        // If email is being changed, check it's not taken by another user
        if (data.email) {
            const existing = await User.findOne({email: data.email, _id: { $ne: userId }});
            if (existing) throw ApiError.conflict('Email sudah digunakan akun lain');

            // Changing email resets verification status
            data.isEmailVerified = false;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: data },
            { new: true, runValidators: true }
        );
        if (!user) throw ApiError.notFound('Pengguna tidak ditemukan');

        return this._response(user);
    }

    // ── Change password ─────────────────────────────────────────────────────────
    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findById(userId).select('+password');
        if (!user) throw ApiError.notFound('Pengguna tidak ditemukan');

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) throw ApiError.badRequest('Password saat ini salah');

        user.password = newPassword;
        await user.save();

        // Revoke all sessions so user must login again with new password
        await AccessToken.deleteMany({ userId });
    }

    // ── Update preferences ──────────────────────────────────────────────────────
    async updatePreferences(userId, preferences) {
        // Build dot-notation update to avoid overwriting other preference fields
        const update = {};
        Object.keys(preferences).forEach((key) => {
            update[`preferences.${key}`] = preferences[key];
        });

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: update },
            { new: true, runValidators: true }
        );
        if (!user) throw ApiError.notFound('Pengguna tidak ditemukan');

        return this._response(user);
    }

    // ── Private: consistent response shape ─────────────────────────────────────
    _response(user) {
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone ?? null,
            kota: user.kota ?? null,
            provinsi: user.provinsi ?? null,
            layanan: user.layanan ?? 'pasangan',
            initials: user.initials,
            isEmailVerified: user.isEmailVerified,
            role: user.role,
            preferences: {
                notificationsEnabled: user.preferences?.notificationsEnabled ?? true,
                language: user.preferences?.language ?? 'id',
            },
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt ?? null,
        };
    }
}

module.exports = new ProfileService();
