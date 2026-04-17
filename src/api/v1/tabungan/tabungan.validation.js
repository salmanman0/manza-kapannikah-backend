const Joi = require('joi');

const createTabungan = Joi.object({
  jumlah: Joi.number().integer().min(1).required().messages({
    'number.base': 'Jumlah harus berupa angka',
    'number.integer': 'Jumlah harus berupa bilangan bulat',
    'number.min': 'Jumlah harus lebih dari 0',
    'any.required': 'Jumlah tabungan wajib diisi',
  }),
  tanggal: Joi.date().iso().max('now').required().messages({
    'date.base': 'Format tanggal tidak valid. Gunakan ISO (YYYY-MM-DD)',
    'date.max': 'Tanggal tabungan tidak boleh di masa depan',
    'any.required': 'Tanggal wajib diisi',
  }),
  catatan: Joi.string().max(500).allow('').default('').messages({
    'string.max': 'Catatan maksimal 500 karakter',
  }),
});

module.exports = { createTabungan };
