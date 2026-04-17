const Kebutuhan = require('../../../models/kebutuhan.model');
const ApiError = require('../../../utils/ApiError');

class KebutuhanService {
  /**
   * Ambil semua item kebutuhan acara, diurutkan berdasarkan tanggal target (asc).
   */
  async getAll(eventId) {
    const list = await Kebutuhan.find({ eventId })
      .populate('createdBy', 'name')
      .sort({ tanggal: 1, createdAt: 1 });

    return list.map((k) => this._response(k));
  }

  /**
   * Buat kebutuhan baru. Diperlukan role editor.
   */
  async create(eventId, userId, data) {
    const kebutuhan = await Kebutuhan.create({
      eventId,
      createdBy: userId,
      nama: data.nama,
      biaya: data.biaya,
      tanggal: data.tanggal,
      catatan: data.catatan || '',
      reminderAktif: data.reminderAktif ?? true,
      selesai: false,
    });

    await kebutuhan.populate('createdBy', 'name');
    return this._response(kebutuhan);
  }

  /**
   * Update kebutuhan. Diperlukan role editor.
   * Siapa pun editor bisa mengubah — kolaboratif.
   */
  async update(kebutuhanId, eventId, data) {
    const kebutuhan = await Kebutuhan.findOne({ _id: kebutuhanId, eventId });
    if (!kebutuhan) throw ApiError.notFound('Kebutuhan tidak ditemukan');

    Object.assign(kebutuhan, data);
    await kebutuhan.save();

    await kebutuhan.populate('createdBy', 'name');
    return this._response(kebutuhan);
  }

  /**
   * Hapus kebutuhan. Diperlukan role editor.
   */
  async delete(kebutuhanId, eventId) {
    const kebutuhan = await Kebutuhan.findOne({ _id: kebutuhanId, eventId });
    if (!kebutuhan) throw ApiError.notFound('Kebutuhan tidak ditemukan');

    await kebutuhan.deleteOne();
  }

  _response(k) {
    return {
      id: k._id,
      eventId: k.eventId,
      createdBy: {
        id: k.createdBy?._id || k.createdBy,
        name: k.createdBy?.name || '',
      },
      nama: k.nama,
      biaya: k.biaya,
      tanggal: k.tanggal,
      catatan: k.catatan,
      selesai: k.selesai,
      reminderAktif: k.reminderAktif,
      createdAt: k.createdAt,
      updatedAt: k.updatedAt,
    };
  }
}

module.exports = new KebutuhanService();
