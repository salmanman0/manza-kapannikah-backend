const Event = require('../../../models/event.model');
const Collaborator = require('../../../models/collaborator.model');
const User = require('../../../models/user.model');
const ApiError = require('../../../utils/ApiError');

class CollaboratorService {
  // ── List collaborators ──────────────────────────────────────────────────────
  async getCollaborators(eventId, userId) {
    const event = await Event.findById(eventId);
    if (!event) throw ApiError.notFound('Acara tidak ditemukan');

    // Hanya member yang accepted bisa melihat daftar kolaborator
    const membership = await Collaborator.findOne({ eventId, userId, status: 'accepted' });
    if (!membership) throw ApiError.forbidden('Anda tidak memiliki akses ke acara ini');

    const collaborators = await Collaborator.find({ eventId })
      .populate('userId', 'name email')
      .populate('invitedBy', 'name')
      .sort({ createdAt: 1 });

    return collaborators.map((c) => ({
      id: c._id,
      userId: c.userId?._id || null,
      name: c.userId?.name || c.invitedEmail,
      email: c.invitedEmail,
      role: c.role,
      status: c.status,
      isOwner: event.ownerId.toString() === (c.userId?._id?.toString() ?? ''),
      invitedBy: c.invitedBy ? { id: c.invitedBy._id, name: c.invitedBy.name } : null,
      createdAt: c.createdAt,
    }));
  }

  // ── Invite collaborator (owner only) ────────────────────────────────────────
  async inviteCollaborator(eventId, userId, data) {
    const event = await Event.findById(eventId);
    if (!event) throw ApiError.notFound('Acara tidak ditemukan');

    if (event.ownerId.toString() !== userId.toString()) {
      throw ApiError.forbidden('Hanya pemilik acara yang dapat mengundang kolaborator');
    }

    const { email, role = 'viewer' } = data;

    // Tidak boleh mengundang diri sendiri
    const inviter = await User.findById(userId);
    if (inviter.email.toLowerCase() === email.toLowerCase()) {
      throw ApiError.badRequest('Anda tidak dapat mengundang diri sendiri');
    }

    // Cek duplikat
    const existing = await Collaborator.findOne({
      eventId,
      invitedEmail: email.toLowerCase(),
    });
    if (existing) {
      throw ApiError.conflict('Email ini sudah diundang ke acara ini');
    }

    // Cari user terdaftar dengan email tersebut
    const invitedUser = await User.findOne({ email: email.toLowerCase() });

    const collaborator = await Collaborator.create({
      eventId,
      userId: invitedUser?._id || null,
      invitedEmail: email.toLowerCase(),
      role,
      status: 'pending',
      invitedBy: userId,
    });

    await collaborator.populate('invitedBy', 'name');

    return {
      id: collaborator._id,
      userId: invitedUser?._id || null,
      name: invitedUser?.name || email,
      email,
      role: collaborator.role,
      status: collaborator.status,
      isOwner: false,
      invitedBy: { id: collaborator.invitedBy._id, name: collaborator.invitedBy.name },
      createdAt: collaborator.createdAt,
    };
  }

  // ── Change collaborator role (owner only) ───────────────────────────────────
  async updateCollaboratorRole(eventId, userId, collaboratorId, role) {
    const event = await Event.findById(eventId);
    if (!event) throw ApiError.notFound('Acara tidak ditemukan');

    if (event.ownerId.toString() !== userId.toString()) {
      throw ApiError.forbidden('Hanya pemilik acara yang dapat mengubah role kolaborator');
    }

    const collaborator = await Collaborator.findOne({ _id: collaboratorId, eventId });
    if (!collaborator) throw ApiError.notFound('Kolaborator tidak ditemukan');

    // Tidak boleh mengubah role pemilik
    if (collaborator.userId?.toString() === event.ownerId.toString()) {
      throw ApiError.badRequest('Role pemilik acara tidak dapat diubah');
    }

    collaborator.role = role;
    await collaborator.save();

    return { id: collaborator._id, role: collaborator.role };
  }

  // ── Remove collaborator (owner only) ────────────────────────────────────────
  async removeCollaborator(eventId, userId, collaboratorId) {
    const event = await Event.findById(eventId);
    if (!event) throw ApiError.notFound('Acara tidak ditemukan');

    if (event.ownerId.toString() !== userId.toString()) {
      throw ApiError.forbidden('Hanya pemilik acara yang dapat menghapus kolaborator');
    }

    const collaborator = await Collaborator.findOne({ _id: collaboratorId, eventId });
    if (!collaborator) throw ApiError.notFound('Kolaborator tidak ditemukan');

    // Tidak boleh menghapus pemilik
    if (collaborator.userId?.toString() === event.ownerId.toString()) {
      throw ApiError.badRequest('Pemilik acara tidak dapat dihapus dari kolaborator');
    }

    await collaborator.deleteOne();
  }
}

module.exports = new CollaboratorService();
