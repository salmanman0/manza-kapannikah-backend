const Joi = require('joi');

/**
 * Password policy: min 8 chars, uppercase, lowercase, digit, special char
 */
const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#\-])[A-Za-z\d@$!%*?&_#\-]{8,}$/;

const passwordField = Joi.string()
    .pattern(passwordPattern)
    .required()
    .messages({
        'string.pattern.base':
            'Password minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan karakter spesial (@$!%*?&)',
        'any.required': 'Password wajib diisi',
    });

// ── Register ──────────────────────────────────────────────────────────────────
const register = Joi.object({
    name: Joi.string().min(2).max(100).trim().required().messages({
        'string.min': 'Nama minimal 2 karakter',
        'string.max': 'Nama maksimal 100 karakter',
        'any.required': 'Nama wajib diisi',
    }),
    email: Joi.string().email().lowercase().required().messages({
        'string.email': 'Format email tidak valid',
        'any.required': 'Email wajib diisi',
    }),
    phone: Joi.string()
        .pattern(/^(\+62|62|0)[0-9]{8,13}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Format nomor HP tidak valid (contoh: 08xx, +628xx)',
        }),
    password: passwordField,
    confirmPassword: Joi.any()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Konfirmasi password tidak cocok',
            'any.required': 'Konfirmasi password wajib diisi',
        }),
    kota: Joi.string().max(100).trim().optional(),
    provinsi: Joi.string().max(100).trim().optional(),
    layanan: Joi.string().valid('pasangan', 'keluarga', 'tim').optional().messages({
        'any.only': 'Layanan hanya boleh: pasangan, keluarga, atau tim',
    }),
});

// ── Login ─────────────────────────────────────────────────────────────────────
const login = Joi.object({
    email: Joi.string().email().lowercase().required().messages({
        'string.email': 'Format email tidak valid',
        'any.required': 'Email wajib diisi',
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password wajib diisi',
    }),
});

// ── Google OAuth ──────────────────────────────────────────────────────────────
const googleAuth = Joi.object({
    idToken: Joi.string().required().messages({
        'any.required': 'Google ID token wajib diisi',
    }),
});

// ── Forgot password ───────────────────────────────────────────────────────────
const forgotPassword = Joi.object({
    email: Joi.string().email().lowercase().required().messages({
        'string.email': 'Format email tidak valid',
        'any.required': 'Email wajib diisi',
    }),
});

// ── Reset password ────────────────────────────────────────────────────────────
const resetPassword = Joi.object({
    token: Joi.string().required().messages({
        'any.required': 'Reset token wajib diisi',
    }),
    password: passwordField,
    confirmPassword: Joi.any()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Konfirmasi password tidak cocok',
        }),
});

module.exports = {
    register,
    login,
    googleAuth,
    forgotPassword,
    resetPassword,
};
