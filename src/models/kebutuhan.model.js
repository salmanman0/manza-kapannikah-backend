const mongoose = require('mongoose');

/**
 * Satu item kebutuhan / pengeluaran yang direncanakan untuk sebuah acara.
 * - nama     : nama kebutuhan, misal "Gedung Resepsi", "Katering 500 pax"
 * - biaya    : estimasi biaya (Rp)
 * - tanggal  : target tanggal pembayaran / deadline
 * - reminderAktif : apakah push notification diaktifkan di sisi client
 */
const kebutuhanSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    nama: {
      type: String,
      required: [true, 'Nama kebutuhan wajib diisi'],
      trim: true,
      minlength: [2, 'Nama kebutuhan minimal 2 karakter'],
      maxlength: [200, 'Nama kebutuhan maksimal 200 karakter'],
    },
    biaya: {
      type: Number,
      required: [true, 'Biaya wajib diisi'],
      min: [0, 'Biaya tidak boleh negatif'],
    },
    tanggal: {
      type: Date,
      required: [true, 'Tanggal target wajib diisi'],
    },
    catatan: {
      type: String,
      trim: true,
      maxlength: [500, 'Catatan maksimal 500 karakter'],
      default: '',
    },
    reminderAktif: {
      type: Boolean,
      default: true,
    },
    selesai: {
      type: Boolean,
      default: false,
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

kebutuhanSchema.index({ eventId: 1, tanggal: 1 });

const Kebutuhan = mongoose.model('Kebutuhan', kebutuhanSchema);
module.exports = Kebutuhan;
