const mongoose = require('mongoose');

/**
 * Pengingat custom pada kalender untuk sebuah acara.
 * - tanggal  : hari pengingat ditampilkan di kalender
 * - jamNotif / menitNotif : waktu notifikasi dikirim (0-23 / 0-59)
 *   -> Notifikasi push dijadwalkan di sisi client menggunakan nilai ini.
 *   -> Server hanya menyimpan; scheduling dilakukan di Flutter/device.
 */
const reminderSchema = new mongoose.Schema(
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
    judul: {
      type: String,
      required: [true, 'Judul pengingat wajib diisi'],
      trim: true,
      minlength: [2, 'Judul minimal 2 karakter'],
      maxlength: [200, 'Judul maksimal 200 karakter'],
    },
    catatan: {
      type: String,
      trim: true,
      maxlength: [500, 'Catatan maksimal 500 karakter'],
      default: '',
    },
    tanggal: {
      type: Date,
      required: [true, 'Tanggal pengingat wajib diisi'],
    },
    jamNotif: {
      type: Number,
      min: [0, 'Jam tidak valid'],
      max: [23, 'Jam tidak valid'],
      default: 7,
    },
    menitNotif: {
      type: Number,
      min: [0, 'Menit tidak valid'],
      max: [59, 'Menit tidak valid'],
      default: 0,
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

reminderSchema.index({ eventId: 1, tanggal: 1 });

const Reminder = mongoose.model('Reminder', reminderSchema);
module.exports = Reminder;
