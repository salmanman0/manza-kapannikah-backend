const collaboratorService = require('./collaborator.service');
const ApiResponse = require('../../../utils/ApiResponse');
const asyncHandler = require('../../../utils/asyncHandler');

// ── GET /api/v1/events/:eventId/collaborators ────────────────────────────────
const getCollaborators = asyncHandler(async (req, res) => {
  const collaborators = await collaboratorService.getCollaborators(
    req.params.eventId,
    req.user._id
  );
  return ApiResponse.success(res, collaborators, 'Daftar kolaborator berhasil diambil');
});

// ── POST /api/v1/events/:eventId/collaborators ───────────────────────────────
const inviteCollaborator = asyncHandler(async (req, res) => {
  const collaborator = await collaboratorService.inviteCollaborator(
    req.params.eventId,
    req.user._id,
    req.body
  );
  return ApiResponse.created(res, collaborator, 'Undangan kolaborator berhasil dikirim');
});

// ── PATCH /api/v1/events/:eventId/collaborators/:collaboratorId ──────────────
const updateCollaboratorRole = asyncHandler(async (req, res) => {
  const result = await collaboratorService.updateCollaboratorRole(
    req.params.eventId,
    req.user._id,
    req.params.collaboratorId,
    req.body.role
  );
  return ApiResponse.success(res, result, 'Role kolaborator berhasil diperbarui');
});

// ── DELETE /api/v1/events/:eventId/collaborators/:collaboratorId ─────────────
const removeCollaborator = asyncHandler(async (req, res) => {
  await collaboratorService.removeCollaborator(
    req.params.eventId,
    req.user._id,
    req.params.collaboratorId
  );
  return ApiResponse.success(res, null, 'Kolaborator berhasil dihapus');
});

module.exports = {
  getCollaborators,
  inviteCollaborator,
  updateCollaboratorRole,
  removeCollaborator,
};
