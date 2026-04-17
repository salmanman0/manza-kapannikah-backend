const Tabungan = require('../../../models/tabungan.model');
const Kebutuhan = require('../../../models/kebutuhan.model');

class DashboardService {
  /**
   * Kembalikan ringkasan lengkap untuk halaman Beranda (Home tab).
   * Semua kalkulasi dilakukan di server agar konsisten di semua klien.
   *
   * Response shape:
   * {
   *   totalKebutuhan:     number,   // Σ biaya semua kebutuhan
   *   kebutuhanCount:     number,   // jumlah item kebutuhan
   *   totalTabungan:      number,   // Σ jumlah semua tabungan
   *   sisaTarget:         number,   // max(0, totalKebutuhan - totalTabungan)
   *   progresPersen:      number,   // 0.0 – 1.0
   *   tabunganRecent:     TabunganItem[5],  // 5 entri terbaru
   * }
   */
  async getSummary(eventId) {
    // Jalankan 3 query secara paralel untuk efisiensi
    const [kebutuhanAgg, tabunganAgg, tabunganRecent] = await Promise.all([
      // Total biaya kebutuhan + count
      Kebutuhan.aggregate([
        { $match: { eventId } },
        {
          $group: {
            _id: null,
            totalBiaya: { $sum: '$biaya' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Total tabungan
      Tabungan.aggregate([
        { $match: { eventId } },
        {
          $group: {
            _id: null,
            totalJumlah: { $sum: '$jumlah' },
          },
        },
      ]),

      // 5 tabungan terbaru dengan nama user
      Tabungan.find({ eventId })
        .populate('userId', 'name')
        .sort({ tanggal: -1, createdAt: -1 })
        .limit(5),
    ]);

    const totalKebutuhan = kebutuhanAgg[0]?.totalBiaya ?? 0;
    const kebutuhanCount = kebutuhanAgg[0]?.count ?? 0;
    const totalTabungan = tabunganAgg[0]?.totalJumlah ?? 0;
    const sisaTarget = Math.max(0, totalKebutuhan - totalTabungan);
    const progresPersen =
      totalKebutuhan > 0
        ? Math.min(1, totalTabungan / totalKebutuhan)
        : 0;

    return {
      totalKebutuhan,
      kebutuhanCount,
      totalTabungan,
      sisaTarget,
      progresPersen,
      tabunganRecent: tabunganRecent.map((t) => ({
        id: t._id,
        userId: t.userId?._id || t.userId,
        namaUser: t.userId?.name || '',
        jumlah: t.jumlah,
        tanggal: t.tanggal,
        catatan: t.catatan,
        createdAt: t.createdAt,
      })),
    };
  }
}

module.exports = new DashboardService();
