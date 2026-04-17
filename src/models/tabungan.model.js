const mongoose = require('mongoose');

/**
 * Satu entri catatan tabungan milik sebuah acara.
 * Siapa pun yang menjadi kolaborator accepted di acara tersebut dapat mencatat tabungan.
 * Field userId & namaUser diisi dari req.user saat create — tidak perlu dikirim dari client.
 */
const tabunganSchema = new mongoose.Schema(
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
      required: true,
    },
    jumlah: {
      type: Number,
      required: [true, 'Jumlah tabungan wajib diisi'],
      min: [1, 'Jumlah harus lebih dari 0'],
    },
    tanggal: {
      type: Date,
      required: [true, 'Tanggal tabungan wajib diisi'],
    },
    catatan: {
      type: String,
      trim: true,
      maxlength: [500, 'Catatan maksimal 500 karakter'],
      default: '',
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

tabunganSchema.index({ eventId: 1, tanggal: -1 });

const Tabungan = mongoose.model('Tabungan', tabunganSchema);
module.exports = Tabungan;
