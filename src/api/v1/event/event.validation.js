const Joi = require('joi');

// ── Create Event ──────────────────────────────────────────────────────────────
const createEvent = Joi.object({
  name: Joi.string().min(2).max(150).trim().required().messages({
    'string.min': 'Nama acara minimal 2 karakter',
    'string.max': 'Nama acara maksimal 150 karakter',
    'any.required': 'Nama acara wajib diisi',
  }),
  date: Joi.date().iso().required().messages({
    'date.base': 'Format tanggal tidak valid. Gunakan format ISO (YYYY-MM-DD)',
    'any.required': 'Tanggal acara wajib diisi',
  }),
  initialBudget: Joi.number().min(0).default(0).messages({
    'number.min': 'Tabungan tidak boleh negatif',
    'number.base': 'Tabungan harus berupa angka',
  }),
  collaborators: Joi.array()
    .items(
      Joi.object({
        email: Joi.string().email().lowercase().required().messages({
          'string.email': 'Format email kolaborator tidak valid',
          'any.required': 'Email kolaborator wajib diisi',
        }),
        role: Joi.string().valid('editor', 'viewer').default('viewer').messages({
          'any.only': 'Role hanya boleh editor atau viewer',
        }),
      })
    )
    .default([]),
});

// ── Update Event ──────────────────────────────────────────────────────────────
const updateEvent = Joi.object({
  name: Joi.string().min(2).max(150).trim().messages({
    'string.min': 'Nama acara minimal 2 karakter',
    'string.max': 'Nama acara maksimal 150 karakter',
  }),
  date: Joi.date().iso().messages({
    'date.base': 'Format tanggal tidak valid. Gunakan format ISO (YYYY-MM-DD)',
  }),
  initialBudget: Joi.number().min(0).messages({
    'number.min': 'Tabungan tidak boleh negatif',
    'number.base': 'Tabungan harus berupa angka',
  }),
}).min(1).messages({
  'object.min': 'Setidaknya satu field harus diisi untuk update',
});

module.exports = { createEvent, updateEvent };
