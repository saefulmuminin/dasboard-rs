// Identitas & konstanta situs — ubah di satu tempat ini saja.
export const SITE = {
  nama: "Simpati Mutu",
  rs: "RSU Sofifi",
  // GANTI dengan nomor WhatsApp Tim Mutu (format internasional tanpa +, mis. 62812xxxx)
  waNumber: "6281234567890",
  waTextDefault: "Halo Tim Mutu RSU Sofifi, saya ingin bertanya.",
  email: "mutu@rsusofifi.go.id", // ganti sesuai email resmi
  alamat: "Sofifi, Maluku Utara",
};

// Bangun link WhatsApp dengan teks otomatis.
export function waLink(text?: string) {
  const t = encodeURIComponent(text ?? SITE.waTextDefault);
  return `https://wa.me/${SITE.waNumber}?text=${t}`;
}

// Format waktu -> "05 Jul 2026, 18.25 WIT" (zona Sofifi = WIT/UTC+9).
export function fmtWaktu(iso: string | null | undefined): string {
  if (!iso) return "-";
  try {
    return (
      new Date(iso).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jayapura",
      }) + " WIT"
    );
  } catch {
    return "-";
  }
}

// Daftar bulan (index 1..12)
export const NAMA_BULAN = [
  "",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
