const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Nama acara wajib diisi'],
      trim: true,
      minlength: [2, 'Nama acara minimal 2 karakter'],
      maxlength: [150, 'Nama acara maksimal 150 karakter'],
    },
    date: {
      type: Date,
      required: [true, 'Tanggal acara wajib diisi'],
    },
    initialBudget: {
      type: Number,
      default: 0,
      min: [0, 'Tabungan tidak boleh negatif'],
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
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

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
