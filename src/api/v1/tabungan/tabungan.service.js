const Tabungan = require('../../../models/tabungan.model');
const ApiError = require('../../../utils/ApiError');

class TabunganService {
  /**
   * Ambil semua catatan tabungan pada acara.
   * Query opsional: bulan (1-12) dan tahun (YYYY) untuk filter per periode.
   * Selalu diurutkan: tanggal terbaru lebih dulu.
   */
  async getAll(eventId, { bulan, tahun } = {}) {
    const filter = { eventId };

    if (bulan || tahun) {
      // Filter tanggal dengan range per bulan
      const targetYear = tahun ? parseInt(tahun, 10) : new Date().getFullYear();
      const targetMonth = bulan ? parseInt(bulan, 10) - 1 : 0; // JS month 0-based

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

    const list = await Tabungan.find(filter)
      .populate('userId', 'name')
      .sort({ tanggal: -1, createdAt: -1 });

    return list.map((t) => this._format(t));
  }

  /**
   * Buat catatan tabungan baru. Siapa pun (accepted member) bisa mencatat.
   */
  async create(eventId, userId, data) {
    const tabungan = await Tabungan.create({
      eventId,
      userId,
      jumlah: data.jumlah,
      tanggal: data.tanggal,
      catatan: data.catatan || '',
    });

    await tabungan.populate('userId', 'name');
    return this._format(tabungan);
  }

  /**
   * Hapus catatan tabungan.
   * Hanya pemilik catatan (userId) atau owner acara yang diizinkan.
   */
  async delete(tabunganId, eventId, requesterId, isOwner) {
    const tabungan = await Tabungan.findOne({ _id: tabunganId, eventId });
    if (!tabungan) throw ApiError.notFound('Catatan tabungan tidak ditemukan');

    const isCreator = tabungan.userId.toString() === requesterId.toString();
    if (!isCreator && !isOwner) {
      throw ApiError.forbidden('Anda tidak dapat menghapus catatan tabungan milik orang lain');
    }

    await tabungan.deleteOne();
  }

  _format(t) {
    return {
      id: t._id,
      eventId: t.eventId,
      userId: t.userId?._id || t.userId,
      namaUser: t.userId?.name || '',
      jumlah: t.jumlah,
      tanggal: t.tanggal,
      catatan: t.catatan,
      createdAt: t.createdAt,
    };
  }
}

module.exports = new TabunganService();
