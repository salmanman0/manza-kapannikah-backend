const reminderService = require('./reminder.service');
const ApiResponse = require('../../../utils/ApiResponse');
const asyncHandler = require('../../../utils/asyncHandler');

// ── GET /events/:eventId/reminders?bulan=&tahun= ────────────────────────────
const getAll = asyncHandler(async (req, res) => {
  const { bulan, tahun } = req.query;
  const list = await reminderService.getAll(req.params.eventId, { bulan, tahun });
  return ApiResponse.success(res, list, 'Daftar pengingat berhasil diambil');
});

// ── POST /events/:eventId/reminders ────────────────────────────────────────
const create = asyncHandler(async (req, res) => {
  const reminder = await reminderService.create(
    req.params.eventId,
    req.user._id,
    req.body
  );
  return ApiResponse.created(res, reminder, 'Pengingat berhasil ditambahkan');
});

// ── DELETE /events/:eventId/reminders/:reminderId ──────────────────────────
const remove = asyncHandler(async (req, res) => {
  const isOwner = req.event.ownerId.toString() === req.user._id.toString();
  await reminderService.delete(
    req.params.reminderId,
    req.params.eventId,
    req.user._id,
    isOwner
  );
  return ApiResponse.success(res, null, 'Pengingat berhasil dihapus');
});

module.exports = { getAll, create, remove };
