const eventService = require('./event.service');
const ApiResponse = require('../../../utils/ApiResponse');
const asyncHandler = require('../../../utils/asyncHandler');

// ── GET /api/v1/events?filter=active|archived|all ────────────────────────────
const getMyEvents = asyncHandler(async (req, res) => {
  const filter = ['active', 'archived', 'all'].includes(req.query.filter)
    ? req.query.filter
    : 'active';
  const events = await eventService.getMyEvents(req.user._id, filter);
  return ApiResponse.success(res, events, 'Daftar acara berhasil diambil');
});

// ── GET /api/v1/events/invitations ───────────────────────────────────────────
const getMyInvitations = asyncHandler(async (req, res) => {
  const invitations = await eventService.getMyInvitations(req.user.email);
  return ApiResponse.success(res, invitations, 'Daftar undangan berhasil diambil');
});

// ── POST /api/v1/events ───────────────────────────────────────────────────────
const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.user._id, req.body);
  return ApiResponse.created(res, event, 'Acara berhasil dibuat');
});

// ── GET /api/v1/events/:eventId ───────────────────────────────────────────────
const getEvent = asyncHandler(async (req, res) => {
  const event = await eventService.getEventById(req.params.eventId, req.user._id);
  return ApiResponse.success(res, event, 'Detail acara berhasil diambil');
});

// ── PATCH /api/v1/events/:eventId ─────────────────────────────────────────────
const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(req.params.eventId, req.user._id, req.body);
  return ApiResponse.success(res, event, 'Acara berhasil diperbarui');
});

// ── DELETE /api/v1/events/:eventId ────────────────────────────────────────────
const deleteEvent = asyncHandler(async (req, res) => {
  await eventService.deleteEvent(req.params.eventId, req.user._id);
  return ApiResponse.success(res, null, 'Acara berhasil dihapus');
});

// ── PATCH /api/v1/events/:eventId/archive ────────────────────────────────────
const archiveEvent = asyncHandler(async (req, res) => {
  const event = await eventService.setArchiveStatus(req.params.eventId, req.user._id, true);
  return ApiResponse.success(res, event, 'Acara berhasil diarsipkan');
});

// ── PATCH /api/v1/events/:eventId/unarchive ───────────────────────────────────
const unarchiveEvent = asyncHandler(async (req, res) => {
  const event = await eventService.setArchiveStatus(req.params.eventId, req.user._id, false);
  return ApiResponse.success(res, event, 'Acara berhasil dipulihkan');
});

// ── PATCH /api/v1/events/invitations/:invitationId/accept ────────────────────
const acceptInvitation = asyncHandler(async (req, res) => {
  const result = await eventService.respondToInvitation(
    req.params.invitationId,
    req.user._id,
    req.user.email,
    true
  );
  return ApiResponse.success(res, result, 'Undangan berhasil diterima');
});

// ── PATCH /api/v1/events/invitations/:invitationId/reject ────────────────────
const rejectInvitation = asyncHandler(async (req, res) => {
  const result = await eventService.respondToInvitation(
    req.params.invitationId,
    req.user._id,
    req.user.email,
    false
  );
  return ApiResponse.success(res, result, 'Undangan berhasil ditolak');
});

module.exports = {
  getMyEvents,
  getMyInvitations,
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent,
  archiveEvent,
  unarchiveEvent,
  acceptInvitation,
  rejectInvitation,
};
