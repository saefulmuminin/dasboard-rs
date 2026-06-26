// Tes realtime: insert / hapus 1 data uji ke tabel reports.
//   node scripts/test-realtime.mjs           -> insert data uji
//   ACTION=delete node scripts/test-realtime.mjs  -> hapus data uji
// Data uji ditandai tahun=2099, bulan=12 (tidak bentrok dengan data asli).
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env", "utf8").split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; }),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("✗ URL / service_role key tidak ada di .env"); process.exit(1); }

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const ACTION = process.env.ACTION || "insert";
const TAHUN = 2099, BULAN = 12;

if (ACTION === "delete") {
  const { error, count } = await sb.from("reports").delete({ count: "exact" }).eq("tahun", TAHUN).eq("bulan", BULAN);
  if (error) { console.error("✗ Gagal hapus:", error.message); process.exit(1); }
  console.log(`🗑️  Data uji dihapus (${count ?? "?"} baris, tahun ${TAHUN}/${BULAN}).`);
  process.exit(0);
}

// insert
const { data: ind } = await sb.from("indicators").select("id, nama").eq("nomor", 1).maybeSingle();
const { data: unit } = await sb.from("units").select("id, nama").eq("nama", "Amarilis").maybeSingle();
if (!ind || !unit) { console.error("✗ Indikator/unit tidak ditemukan."); process.exit(1); }

const { data, error } = await sb.from("reports").insert({
  indicator_id: ind.id, unit_id: unit.id, tahun: TAHUN, bulan: BULAN,
  numerator: 7, denominator: 10, status: "submitted",
  analisa: "DATA TES REALTIME — boleh dihapus",
}).select("id, hasil").maybeSingle();

if (error) { console.error("✗ Gagal insert:", error.message); process.exit(1); }
console.log(`✅ Data uji masuk: id=${data.id} | ${ind.nama} / ${unit.nama} | Des 2099 | 7/10 = ${data.hasil}% | status submitted`);
console.log("   Cek tab 'Data Mutu' di sheet — cari baris Tahun 2099, Bulan Desember.");
