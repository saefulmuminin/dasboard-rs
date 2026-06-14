// =============================================================
// Total RESMI "RS Keseluruhan" dari Laporan Mutu (kolom R/S Excel).
// Dipakai sebagai OVERRIDE agar "Capaian RS Keseluruhan" = Σnum/Σden
// PERSIS sama dengan laporan resmi.
//
// Kenapa override (bukan jumlah per-unit)? Total resmi RS dihitung dari
// master/sub-unit (mis. Krisan A/B, Mawar A/B) yang tidak ada di rincian
// per-unit, sehingga tidak bisa direkonstruksi dengan menjumlah unit.
//
// Cara menambah bulan/indikator baru: tambahkan entri "{nomor}-{tahun}-{bulan}".
// Indikator yang TIDAK ada di sini otomatis pakai jumlah per-unit biasa.
// =============================================================

export type RsNumDen = { num: number; den: number };

export const RS_OFFICIAL: Record<string, RsNumDen> = {
  // Mei 2026 (sumber: mutu mei 2026.xlsx, kolom R/S)
  "1-2026-5": { num: 662, den: 668 }, // Kepatuhan Cuci Tangan
  "2-2026-5": { num: 408, den: 412 }, // Kepatuhan Penggunaan APD
  "3-2026-5": { num: 551, den: 554 }, // Kepatuhan Identifikasi Pasien
  "4-2026-5": { num: 171, den: 191 }, // Waktu Tunggu Rawat Jalan
  "5-2026-5": { num: 243, den: 395 }, // Kepatuhan Waktu Visite Dokter
  "9-2026-5": { num: 385, den: 463 }, // Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh
};

// Ambil total resmi bila tersedia, jika tidak → null (pakai jumlah per-unit).
export function rsOfficial(
  nomor: number | null,
  tahun: number,
  bulan: number,
): RsNumDen | null {
  if (nomor == null) return null;
  return RS_OFFICIAL[`${nomor}-${tahun}-${bulan}`] ?? null;
}
