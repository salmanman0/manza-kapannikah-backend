const Joi = require('joi');

const createKebutuhan = Joi.object({
  nama: Joi.string().min(2).max(200).trim().required().messages({
    'string.min': 'Nama kebutuhan minimal 2 karakter',
    'string.max': 'Nama kebutuhan maksimal 200 karakter',
    'any.required': 'Nama kebutuhan wajib diisi',
  }),
  biaya: Joi.number().min(0).required().messages({
    'number.base': 'Biaya harus berupa angka',
    'number.min': 'Biaya tidak boleh negatif',
    'any.required': 'Biaya wajib diisi',
  }),
  tanggal: Joi.date().iso().required().messages({
    'date.base': 'Format tanggal tidak valid. Gunakan ISO (YYYY-MM-DD)',
    'any.required': 'Tanggal target wajib diisi',
  }),
  catatan: Joi.string().max(500).allow('').default('').messages({
    'string.max': 'Catatan maksimal 500 karakter',
  }),
  reminderAktif: Joi.boolean().default(true),
});

const updateKebutuhan = Joi.object({
  nama: Joi.string().min(2).max(200).trim().messages({
    'string.min': 'Nama kebutuhan minimal 2 karakter',
    'string.max': 'Nama kebutuhan maksimal 200 karakter',
  }),
  biaya: Joi.number().min(0).messages({
    'number.base': 'Biaya harus berupa angka',
    'number.min': 'Biaya tidak boleh negatif',
  }),
  tanggal: Joi.date().iso().messages({
    'date.base': 'Format tanggal tidak valid. Gunakan ISO (YYYY-MM-DD)',
  }),
  catatan: Joi.string().max(500).allow('').messages({
    'string.max': 'Catatan maksimal 500 karakter',
  }),
  reminderAktif: Joi.boolean(),
}).min(1).messages({
  'object.min': 'Setidaknya satu field harus diisi untuk update',
});

module.exports = { createKebutuhan, updateKebutuhan };
