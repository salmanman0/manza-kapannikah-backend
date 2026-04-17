const Event = require('../../../models/event.model');
const Collaborator = require('../../../models/collaborator.model');
const Tabungan = require('../../../models/tabungan.model');
const User = require('../../../models/user.model');
const ApiError = require('../../../utils/ApiError');

class EventService {
  // ── Get events for current user ─────────────────────────────────────────────
  // Returns all events where the user is an accepted collaborator
  // (this includes events they own, since owners are stored as accepted collaborators)
  // filter: 'active' | 'archived' | 'all'
  async getMyEvents(userId, filter = 'active') {
    const collabs = await Collaborator.find({
      userId,
      status: 'accepted',
    }).select('eventId');

    const eventIds = collabs.map((c) => c.eventId);

    const query = { _id: { $in: eventIds } };
    if (filter === 'active') query.isArchived = false;
    if (filter === 'archived') query.isArchived = true;

    const events = await Event.find(query).sort({ createdAt: -1 });

    const result = await Promise.all(
      events.map(async (event) => {
        const collaborators = await this._getCollaboratorsFormatted(event._id);
        return { ...event.toJSON(), collaborators };
      })
    );

    return result;
  }

  // ── Get pending invitations for current user ────────────────────────────────
  async getMyInvitations(userEmail) {
    const invitations = await Collaborator.find({
      invitedEmail: userEmail.toLowerCase(),
      status: 'pending',
    })
      .populate('eventId', 'name date')
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    return invitations.map((inv) => ({
      id: inv._id,
      event: {
        id: inv.eventId._id,
        name: inv.eventId.name,
        date: inv.eventId.date,
      },
      invitedBy: {
        id: inv.invitedBy._id,
        name: inv.invitedBy.name,
      },
      role: inv.role,
      status: inv.status,
      createdAt: inv.createdAt,
    }));
  }

  // ── Create event ────────────────────────────────────────────────────────────
  async createEvent(ownerId, data) {
    const { name, date, initialBudget = 0, collaborators = [] } = data;

    const event = await Event.create({ ownerId, name, date, initialBudget });

    const owner = await User.findById(ownerId);

    // Owner selalu menjadi kolaborator pertama dengan role editor & status accepted
    await Collaborator.create({
      eventId: event._id,
      userId: ownerId,
      invitedEmail: owner.email,
      role: 'editor',
      status: 'accepted',
      invitedBy: ownerId,
      respondedAt: new Date(),
    });

    // Buat entri tabungan awal jika initialBudget > 0
    if (initialBudget > 0) {
      await Tabungan.create({
        eventId: event._id,
        userId: ownerId,
        jumlah: initialBudget,
        tanggal: new Date(),
        catatan: 'Tabungan awal',
      });
    }

    // Kirim undangan ke kolaborator awal (kecuali owner sendiri)
    const invitePromises = collaborators
      .filter((c) => c.email.toLowerCase() !== owner.email.toLowerCase())
      .map((c) => this._sendInvite(event._id, ownerId, c.email, c.role || 'viewer'));

    await Promise.allSettled(invitePromises);

    const collab = await this._getCollaboratorsFormatted(event._id);
    return { ...event.toJSON(), collaborators: collab };
  }

  // ── Get single event ────────────────────────────────────────────────────────
  async getEventById(eventId, userId) {
    const event = await Event.findById(eventId);
    if (!event) throw ApiError.notFound('Acara tidak ditemukan');

    await this._assertMember(eventId, userId);

    const collaborators = await this._getCollaboratorsFormatted(event._id);
    return { ...event.toJSON(), collaborators };
  }

  // ── Update event (owner or editor) ─────────────────────────────────────────
  async updateEvent(eventId, userId, data) {
    const event = await Event.findById(eventId);
    if (!event) throw ApiError.notFound('Acara tidak ditemukan');

    const membership = await Collaborator.findOne({
      eventId,
      userId,
      status: 'accepted',
      role: 'editor',
    });
    if (!membership) {
      throw ApiError.forbidden('Anda tidak memiliki izin untuk mengubah acara ini');
    }

    Object.assign(event, data);
    await event.save();

    const collaborators = await this._getCollaboratorsFormatted(event._id);
    return { ...event.toJSON(), collaborators };
  }

  // ── Delete event (owner only) ───────────────────────────────────────────────
  async deleteEvent(eventId, userId) {
    const event = await Event.findById(eventId);
    if (!event) throw ApiError.notFound('Acara tidak ditemukan');

    this._assertOwner(event, userId);

    await Collaborator.deleteMany({ eventId });
    await event.deleteOne();
  }

  // ── Archive / Unarchive (owner only) ───────────────────────────────────────
  async setArchiveStatus(eventId, userId, isArchived) {
    const event = await Event.findById(eventId);
    if (!event) throw ApiError.notFound('Acara tidak ditemukan');

    this._assertOwner(event, userId, isArchived ? 'mengarsipkan' : 'memulihkan');

    event.isArchived = isArchived;
    await event.save();

    const collaborators = await this._getCollaboratorsFormatted(event._id);
    return { ...event.toJSON(), collaborators };
  }

  // ── Respond to invitation (accept / reject) ─────────────────────────────────
  async respondToInvitation(invitationId, userId, userEmail, accept) {
    const invitation = await Collaborator.findById(invitationId);
    if (!invitation) throw ApiError.notFound('Undangan tidak ditemukan');

    if (invitation.invitedEmail !== userEmail.toLowerCase()) {
      throw ApiError.forbidden('Undangan ini bukan milik Anda');
    }

    if (invitation.status !== 'pending') {
      throw ApiError.badRequest('Undangan ini sudah direspons sebelumnya');
    }

    invitation.status = accept ? 'accepted' : 'rejected';
    invitation.respondedAt = new Date();
    if (accept) invitation.userId = userId;

    await invitation.save();

    return {
      id: invitation._id,
      status: invitation.status,
      respondedAt: invitation.respondedAt,
    };
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  async _getCollaboratorsFormatted(eventId) {
    const collabs = await Collaborator.find({ eventId })
      .populate('userId', 'name email')
      .sort({ createdAt: 1 });

    return collabs.map((c) => ({
      id: c._id,
      userId: c.userId?._id || null,
      name: c.userId?.name || c.invitedEmail,
      email: c.invitedEmail,
      role: c.role,
      status: c.status,
      createdAt: c.createdAt,
    }));
  }

  async _sendInvite(eventId, invitedById, email, role) {
    const existing = await Collaborator.findOne({
      eventId,
      invitedEmail: email.toLowerCase(),
    });
    if (existing) return; // skip jika sudah ada

    const invitedUser = await User.findOne({ email: email.toLowerCase() });

    return Collaborator.create({
      eventId,
      userId: invitedUser?._id || null,
      invitedEmail: email.toLowerCase(),
      role,
      status: 'pending',
      invitedBy: invitedById,
    });
  }

  _assertOwner(event, userId, action = 'mengelola') {
    if (event.ownerId.toString() !== userId.toString()) {
      throw ApiError.forbidden(`Hanya pemilik acara yang dapat ${action} acara ini`);
    }
  }

  async _assertMember(eventId, userId) {
    const membership = await Collaborator.findOne({
      eventId,
      userId,
      status: 'accepted',
    });
    if (!membership) {
      throw ApiError.forbidden('Anda tidak memiliki akses ke acara ini');
    }
    return membership;
  }
}

module.exports = new EventService();
