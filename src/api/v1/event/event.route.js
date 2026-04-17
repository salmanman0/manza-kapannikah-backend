const express = require('express');
const router = express.Router();

const eventController = require('./event.controller');
const authenticate = require('../../../middlewares/authenticate');
const validate = require('../../../middlewares/validate');
const eventValidation = require('./event.validation');

// Semua route memerlukan autentikasi
router.use(authenticate);

// ── Invitation routes ─────────────────────────────────────────────────────────
// PENTING: Route statis ini harus didefinisikan SEBELUM route /:eventId
// agar Express tidak salah tangkap "invitations" sebagai eventId
router.get('/invitations', eventController.getMyInvitations);
router.patch('/invitations/:invitationId/accept', eventController.acceptInvitation);
router.patch('/invitations/:invitationId/reject', eventController.rejectInvitation);

// ── Event CRUD ────────────────────────────────────────────────────────────────
router.get('/', eventController.getMyEvents);
router.post('/', validate(eventValidation.createEvent), eventController.createEvent);
router.get('/:eventId', eventController.getEvent);
router.patch('/:eventId', validate(eventValidation.updateEvent), eventController.updateEvent);
router.delete('/:eventId', eventController.deleteEvent);

// ── Archive / Unarchive ───────────────────────────────────────────────────────
router.patch('/:eventId/archive', eventController.archiveEvent);
router.patch('/:eventId/unarchive', eventController.unarchiveEvent);



module.exports = router;
