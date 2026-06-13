// =============================================================
// Impor data-mei-2026.csv -> tabel reports (status approved).
//
// CARA PAKAI (dari root project, setelah review CSV):
//   SUPABASE_SERVICE_ROLE_KEY="<service_role key>" node scripts/import-reports.mjs
//
// Opsional:
//   IMPORT_BULAN=5  IMPORT_TAHUN=2026  IMPORT_CSV=data-mei-2026.csv
//
// - Baris dengan unit_db kosong / flag DIV0 OTOMATIS DILEWATI (tidak diimpor).
// - Idempotent: upsert pada (indicator_id, unit_id, tahun, bulan) -> aman diulang.
// =============================================================

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
// Ambil dari ENV proses, atau fallback dari file .env (baris SUPABASE_SERVICE_ROLE_KEY=...)
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const BULAN = Number(process.env.IMPORT_BULAN || 5);
const TAHUN = Number(process.env.IMPORT_TAHUN || 2026);
const CSV = process.env.IMPORT_CSV || "data-mei-2026.csv";

if (!url) { console.error("✗ NEXT_PUBLIC_SUPABASE_URL tidak ada di .env"); process.exit(1); }
if (!serviceKey) {
  console.error(
    "✗ service_role key tidak ditemukan.\n" +
      "  Tambahkan baris ini ke file .env (TANPA prefix NEXT_PUBLIC_):\n" +
      "    SUPABASE_SERVICE_ROLE_KEY=<service_role key Anda>",
  );
  process.exit(1);
}

// --- CSV parser sederhana (mendukung field ber-tanda kutip) ---
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const raw = parseCSV(readFileSync(CSV, "utf8")).filter((r) => r.length > 1);
const header = raw.shift();
const idx = (n) => header.indexOf(n);
const iNomor = idx("indikator_nomor"), iUnit = idx("unit_db"),
  iNum = idx("numerator"), iDen = idx("denominator"), iFlag = idx("flag");

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Map referensi dari DB
const { data: inds } = await supabase.from("indicators").select("id, nomor");
const indByNomor = new Map((inds ?? []).map((x) => [Number(x.nomor), x.id]));
const { data: units } = await supabase.from("units").select("id, nama");
const unitByName = new Map((units ?? []).map((x) => [x.nama.trim().toLowerCase(), x.id]));

let impor = 0, lewat = 0;
const skip = [];
const payload = [];

for (const r of raw) {
  const nomor = Number(r[iNomor]);
  const unitName = (r[iUnit] || "").trim();
  const num = Number(r[iNum]);
  const den = Number(r[iDen]);
  const flag = r[iFlag] || "";

  if (!unitName) { lewat++; skip.push(`ind${nomor} (unit kosong)`); continue; }
  if (flag.includes("DIV0")) { lewat++; skip.push(`ind${nomor}/${unitName} (DIV0)`); continue; }
  if (!Number.isFinite(num) || !Number.isFinite(den)) { lewat++; skip.push(`ind${nomor}/${unitName} (angka invalid)`); continue; }

  const indicator_id = indByNomor.get(nomor);
  const unit_id = unitByName.get(unitName.toLowerCase());
  if (!indicator_id) { lewat++; skip.push(`indikator nomor ${nomor} tidak ada di DB`); continue; }
  if (!unit_id) { lewat++; skip.push(`unit "${unitName}" tidak ada di DB`); continue; }

  payload.push({
    indicator_id, unit_id, tahun: TAHUN, bulan: BULAN,
    numerator: num, denominator: den, status: "approved",
  });
  impor++;
}

if (payload.length) {
  const { error } = await supabase
    .from("reports")
    .upsert(payload, { onConflict: "indicator_id,unit_id,tahun,bulan" });
  if (error) { console.error("✗ Gagal upsert:", error.message); process.exit(1); }
}

console.log(`\n=== IMPOR SELESAI (${BULAN}/${TAHUN}) ===`);
console.log(`Diimpor : ${impor}`);
console.log(`Dilewati: ${lewat}`);
if (skip.length) {
  console.log("\nBaris dilewati:");
  skip.forEach((s) => console.log("  - " + s));
}
