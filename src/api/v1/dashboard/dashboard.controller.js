const dashboardService = require('./dashboard.service');
const ApiResponse = require('../../../utils/ApiResponse');
const asyncHandler = require('../../../utils/asyncHandler');

// ── GET /events/:eventId/dashboard ─────────────────────────────────────────
const getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary(req.params.eventId);
  return ApiResponse.success(res, summary, 'Ringkasan acara berhasil diambil');
});

module.exports = { getSummary };
