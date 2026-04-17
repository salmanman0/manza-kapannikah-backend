const tabunganService = require('./tabungan.service');
const ApiResponse = require('../../../utils/ApiResponse');
const asyncHandler = require('../../../utils/asyncHandler');

// ── GET /events/:eventId/tabungan?bulan=&tahun= ────────────────────────────
const getAll = asyncHandler(async (req, res) => {
  const { bulan, tahun } = req.query;
  const list = await tabunganService.getAll(req.params.eventId, { bulan, tahun });
  return ApiResponse.success(res, list, 'Daftar tabungan berhasil diambil');
});

// ── POST /events/:eventId/tabungan ─────────────────────────────────────────
const create = asyncHandler(async (req, res) => {
  const tabungan = await tabunganService.create(
    req.params.eventId,
    req.user._id,
    req.body
  );
  return ApiResponse.created(res, tabungan, 'Catatan tabungan berhasil disimpan');
});

// ── DELETE /events/:eventId/tabungan/:tabunganId ───────────────────────────
const remove = asyncHandler(async (req, res) => {
  const isOwner = req.event.ownerId.toString() === req.user._id.toString();
  await tabunganService.delete(
    req.params.tabunganId,
    req.params.eventId,
    req.user._id,
    isOwner
  );
  return ApiResponse.success(res, null, 'Catatan tabungan berhasil dihapus');
});

module.exports = { getAll, create, remove };
