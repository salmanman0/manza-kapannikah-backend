const Reminder = require('../../../models/reminder.model');
const ApiError = require('../../../utils/ApiError');

class ReminderService {
  /**
   * Ambil semua pengingat acara, opsional filter per bulan/tahun.
   * Diurutkan: tanggal terdekat lebih dulu.
   */
  async getAll(eventId, { bulan, tahun } = {}) {
    const filter = { eventId };

    if (bulan || tahun) {
      const targetYear = tahun ? parseInt(tahun, 10) : new Date().getFullYear();
      const targetMonth = bulan ? parseInt(bulan, 10) - 1 : 0;

      if (bulan && tahun) {
        const start = new Date(targetYear, targetMonth, 1);
        const end = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
        filter.tanggal = { $gte: start, $lte: end };
      } else if (tahun) {
        const start = new Date(targetYear, 0, 1);
        const end = new Date(targetYear, 11, 31, 23, 59, 59);
        filter.tanggal = { $gte: start, $lte: end };
      }
    }

    const list = await Reminder.find(filter)
      .populate('createdBy', 'name')
      .sort({ tanggal: 1, jamNotif: 1, menitNotif: 1 });

    return list.map((r) => this._format(r));
  }

  /**
   * Buat pengingat baru. Semua accepted member bisa menambah.
   */
  async create(eventId, userId, data) {
    const reminder = await Reminder.create({
      eventId,
      createdBy: userId,
      judul: data.judul,
      catatan: data.catatan || '',
      tanggal: data.tanggal,
      jamNotif: data.jamNotif ?? 7,
      menitNotif: data.menitNotif ?? 0,
    });

    await reminder.populate('createdBy', 'name');
    return this._format(reminder);
  }

  /**
   * Hapus pengingat. Hanya creator atau owner acara yang boleh menghapus.
   */
  async delete(reminderId, eventId, requesterId, isOwner) {
    const reminder = await Reminder.findOne({ _id: reminderId, eventId });
    if (!reminder) throw ApiError.notFound('Pengingat tidak ditemukan');

    const isCreator = reminder.createdBy.toString() === requesterId.toString();
    if (!isCreator && !isOwner) {
      throw ApiError.forbidden('Anda tidak dapat menghapus pengingat milik orang lain');
    }

    await reminder.deleteOne();
  }

  _format(r) {
    return {
      id: r._id,
      eventId: r.eventId,
      createdBy: {
        id: r.createdBy?._id || r.createdBy,
        name: r.createdBy?.name || '',
      },
      judul: r.judul,
      catatan: r.catatan,
      tanggal: r.tanggal,
      jamNotif: r.jamNotif,
      menitNotif: r.menitNotif,
      createdAt: r.createdAt,
    };
  }
}

module.exports = new ReminderService();
