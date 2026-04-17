const express = require('express');
const router = express.Router();

const authRouter = require('../api/v1/auth/auth.route');
const profileRouter = require('../api/v1/profile/profile.route');
const eventRouter = require('../api/v1/event/event.route');
const collaboratorRouter = require('../api/v1/collaborator/collaborator.route');
const tabunganRouter = require('../api/v1/tabungan/tabungan.route');
const kebutuhanRouter = require('../api/v1/kebutuhan/kebutuhan.route');
const reminderRouter = require('../api/v1/reminder/reminder.route');
const dashboardRouter = require('../api/v1/dashboard/dashboard.route');

// ── Health check ──────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// ── v1 routes ─────────────────────────────────────────────────────────────────
router.use('/v1/auth', authRouter);
router.use('/v1/profile', profileRouter);
router.use('/v1/events', eventRouter);

router.use('/v1/events/:eventId/collaborators', collaboratorRouter);
router.use('/v1/events/:eventId/dashboard', dashboardRouter);
router.use('/v1/events/:eventId/tabungan', tabunganRouter);
router.use('/v1/events/:eventId/kebutuhan', kebutuhanRouter);
router.use('/v1/events/:eventId/reminders', reminderRouter);
module.exports = router;
