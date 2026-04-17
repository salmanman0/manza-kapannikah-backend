const Joi = require('joi');

// ── Update profile (name, email, phone) ───────────────────────────────────────
const updateProfile = Joi.object({
    name: Joi.string().min(2).max(100).trim().optional().messages({
        'string.min': 'Nama minimal 2 karakter',
        'string.max': 'Nama maksimal 100 karakter',
    }),
    email: Joi.string().email().lowercase().optional().messages({
        'string.email': 'Format email tidak valid',
    }),
    phone: Joi.string()
        .pattern(/^(\+62|62|0)[0-9]{8,13}$/)
        .allow('', null)
        .optional()
        .messages({'string.pattern.base': 'Format nomor HP tidak valid (contoh: 08xx, +628xx)'}),
}).min(1).messages({'object.min': 'Minimal satu field harus diisi'});

// ── Change password ───────────────────────────────────────────────────────────
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#\-])[A-Za-z\d@$!%*?&_#\-]{8,}$/;

const changePassword = Joi.object({
    currentPassword: Joi.string().required().messages({
        'any.required': 'Password saat ini wajib diisi',
    }),
    newPassword: Joi.string()
        .pattern(passwordPattern)
        .required()
        .messages({ 
            'string.pattern.base':
                'Password baru minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan karakter spesial (@$!%*?&)',
                'any.required': 'Password baru wajib diisi',
        }),
    confirmNewPassword: Joi.any()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Konfirmasi password tidak cocok',
            'any.required': 'Konfirmasi password wajib diisi',
        }),
});

// ── Update preferences ────────────────────────────────────────────────────────
const updatePreferences = Joi.object({
    notificationsEnabled: Joi.boolean().optional(),
    language: Joi.string().valid('id', 'en').optional().messages({'any.only': 'Bahasa hanya boleh id atau en'}),
}).min(1).messages({'object.min': 'Minimal satu preferensi harus diisi'});

module.exports = { updateProfile, changePassword, updatePreferences };
