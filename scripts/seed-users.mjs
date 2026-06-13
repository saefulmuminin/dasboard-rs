// =============================================================
// Seed akun login untuk setiap UNIT kerja.
// Membuat 1 akun per unit + menautkan profil ke unit-nya (role 'unit').
//
// CARA PAKAI (jalankan dari root project):
//   SUPABASE_SERVICE_ROLE_KEY="<service_role key>" node scripts/seed-users.mjs
//
// Opsional:
//   SEED_PASSWORD="KataSandi123"  (default: Mutu#2026)
//   SEED_DOMAIN="unit.rsudsofifi.local"
//
// CATATAN:
// - service_role key TIDAK disimpan di file mana pun — hanya dipakai sekali via env var.
// - Email yang dibuat hanya untuk LOGIN (bukan mailbox nyata). Password = default di atas.
// - Idempotent: aman dijalankan ulang (akun yang sudah ada dilewati, hanya unit-nya disinkronkan).
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
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const DEFAULT_PASSWORD = process.env.SEED_PASSWORD || "Mutu#2026";
const DOMAIN = process.env.SEED_DOMAIN || "unit.rsudsofifi.local";

if (!url) {
  console.error("✗ NEXT_PUBLIC_SUPABASE_URL tidak ditemukan di .env");
  process.exit(1);
}
if (!serviceKey) {
  console.error(
    "✗ Set service_role key dulu:\n  SUPABASE_SERVICE_ROLE_KEY=\"<key>\" node scripts/seed-users.mjs",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// 1) Ambil daftar unit
const { data: units, error: ue } = await supabase
  .from("units")
  .select("id, nama")
  .order("nama", { ascending: true });
if (ue) {
  console.error("✗ Gagal mengambil units:", ue.message);
  process.exit(1);
}

// 2) Daftar user existing (untuk idempotent)
const existing = new Map();
for (let page = 1; ; page++) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) {
    console.error("✗ listUsers:", error.message);
    process.exit(1);
  }
  data.users.forEach((u) => u.email && existing.set(u.email, u.id));
  if (data.users.length < 1000) break;
}

let dibuat = 0,
  adaSudah = 0;
const hasil = [];

for (const u of units) {
  const email = `${slugify(u.nama)}@${DOMAIN}`;
  let userId = existing.get(email);

  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { nama: u.nama },
    });
    if (error) {
      console.error(`✗ ${email}: ${error.message}`);
      continue;
    }
    userId = data.user.id;
    dibuat++;
  } else {
    adaSudah++;
  }

  // Tautkan profil ke unit (role 'unit')
  const { error: pe } = await supabase
    .from("profiles")
    .upsert(
      { id: userId, role: "unit", unit_id: u.id, nama: u.nama },
      { onConflict: "id" },
    );
  if (pe) console.error(`  ! profil ${email}: ${pe.message}`);

  hasil.push(`${u.nama.padEnd(16)} -> ${email}`);
}

console.log("\n=== AKUN UNIT ===");
console.log(hasil.join("\n"));
console.log(
  `\nDibuat baru: ${dibuat} | sudah ada: ${adaSudah} | total unit: ${units.length}`,
);
console.log(`Password semua akun: ${DEFAULT_PASSWORD}`);
console.log("(Sarankan tiap unit mengganti password lewat fitur Lupa Password / oleh admin.)");
