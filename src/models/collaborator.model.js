const mongoose = require('mongoose');

/**
 * Menyimpan satu entri kolaborator per acara.
 *
 * - Pemilik acara juga tersimpan di sini dengan status 'accepted' dan role 'editor'.
 * - Kolaborator yang diundang akan berstatus 'pending' hingga direspons.
 * - userId bisa null jika email yang diundang belum terdaftar di aplikasi.
 */
const collaboratorSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    invitedEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['editor', 'viewer'],
      default: 'viewer',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Satu email hanya bisa menjadi satu kolaborator per acara
collaboratorSchema.index({ eventId: 1, invitedEmail: 1 }, { unique: true });

const Collaborator = mongoose.model('Collaborator', collaboratorSchema);
module.exports = Collaborator;
