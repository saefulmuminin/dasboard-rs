// Identitas & konstanta situs — ubah di satu tempat ini saja.
export const SITE = {
  nama: "Simpati Mutu",
  rs: "RSU Sofifi",
  // GANTI dengan nomor WhatsApp Tim Mutu (format internasional tanpa +, mis. 62812xxxx)
  waNumber: "6281234567890",
  waTextDefault: "Halo Tim Mutu RSU Sofifi, saya ingin bertanya.",
  email: "mutu@rsudsofifi.go.id", // ganti sesuai email resmi
  alamat: "Sofifi, Maluku Utara",
};

// Bangun link WhatsApp dengan teks otomatis.
export function waLink(text?: string) {
  const t = encodeURIComponent(text ?? SITE.waTextDefault);
  return `https://wa.me/${SITE.waNumber}?text=${t}`;
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
