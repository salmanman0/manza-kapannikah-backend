const Collaborator = require('../models/collaborator.model');
const Event = require('../models/event.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Verifikasi bahwa req.user adalah kolaborator accepted dari event yang diminta.
 * Meng-attach req.event dan req.membership ke request untuk digunakan downstream.
 *
 * Gunakan sebagai middleware setelah authenticate:
 *   router.get('/:eventId/...', authenticate, assertMember, handler)
 */
const assertMember = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound('Acara tidak ditemukan');

  const membership = await Collaborator.findOne({
    eventId,
    userId: req.user._id,
    status: 'accepted',
  });
  if (!membership) throw ApiError.forbidden('Anda tidak memiliki akses ke acara ini');

  req.event = event;
  req.membership = membership;
  next();
});

/**
 * Verifikasi bahwa req.user memiliki role 'editor' (atau adalah owner).
 * Harus dipanggil SETELAH assertMember.
 */
const assertEditor = (req, res, next) => {
  if (req.membership.role !== 'editor') {
    throw ApiError.forbidden('Hanya editor yang dapat melakukan aksi ini');
  }
  next();
};

module.exports = { assertMember, assertEditor };
