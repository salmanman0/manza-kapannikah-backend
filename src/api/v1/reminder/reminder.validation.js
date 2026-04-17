const Joi = require('joi');

const createReminder = Joi.object({
  judul: Joi.string().min(2).max(200).trim().required().messages({
    'string.min': 'Judul minimal 2 karakter',
    'string.max': 'Judul maksimal 200 karakter',
    'any.required': 'Judul pengingat wajib diisi',
  }),
  catatan: Joi.string().max(500).allow('').default('').messages({
    'string.max': 'Catatan maksimal 500 karakter',
  }),
  tanggal: Joi.date().iso().required().messages({
    'date.base': 'Format tanggal tidak valid. Gunakan ISO (YYYY-MM-DD)',
    'any.required': 'Tanggal pengingat wajib diisi',
  }),
  jamNotif: Joi.number().integer().min(0).max(23).default(7).messages({
    'number.base': 'Jam notifikasi harus berupa angka',
    'number.min': 'Jam tidak valid (0-23)',
    'number.max': 'Jam tidak valid (0-23)',
  }),
  menitNotif: Joi.number().integer().min(0).max(59).default(0).messages({
    'number.base': 'Menit notifikasi harus berupa angka',
    'number.min': 'Menit tidak valid (0-59)',
    'number.max': 'Menit tidak valid (0-59)',
  }),
});

module.exports = { createReminder };
