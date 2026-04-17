const kebutuhanService = require('./kebutuhan.service');
const ApiResponse = require('../../../utils/ApiResponse');
const asyncHandler = require('../../../utils/asyncHandler');

// ── GET /events/:eventId/kebutuhan ─────────────────────────────────────────
const getAll = asyncHandler(async (req, res) => {
  const list = await kebutuhanService.getAll(req.params.eventId);
  return ApiResponse.success(res, list, 'Daftar kebutuhan berhasil diambil');
});

// ── POST /events/:eventId/kebutuhan ────────────────────────────────────────
const create = asyncHandler(async (req, res) => {
  const kebutuhan = await kebutuhanService.create(
    req.params.eventId,
    req.user._id,
    req.body
  );
  return ApiResponse.created(res, kebutuhan, 'Kebutuhan berhasil ditambahkan');
});

// ── PATCH /events/:eventId/kebutuhan/:kebutuhanId ──────────────────────────
const update = asyncHandler(async (req, res) => {
  const kebutuhan = await kebutuhanService.update(
    req.params.kebutuhanId,
    req.params.eventId,
    req.body
  );
  return ApiResponse.success(res, kebutuhan, 'Kebutuhan berhasil diperbarui');
});

// ── DELETE /events/:eventId/kebutuhan/:kebutuhanId ─────────────────────────
const remove = asyncHandler(async (req, res) => {
  await kebutuhanService.delete(req.params.kebutuhanId, req.params.eventId);
  return ApiResponse.success(res, null, 'Kebutuhan berhasil dihapus');
});

module.exports = { getAll, create, update, remove };
