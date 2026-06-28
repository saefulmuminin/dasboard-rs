// Migrasi domain email akun: rsudsofifi -> rsusofifi
// - Buat ulang 26 akun unit (<slug>@unit.rsusofifi.local) + admin@rsusofifi.go.id
// - Hapus akun lama berdomain rsudsofifi
//   node scripts/migrate-domain-rsu.mjs
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
const PASS_UNIT = "Mutu#2026";
const PASS_ADMIN = "MutuAdmin2026";
const slug = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// daftar semua user existing (sebelum migrasi)
const existing = new Map();
for (let page = 1; ; page++) {
  const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) { console.error("listUsers:", error.message); process.exit(1); }
  data.users.forEach((u) => u.email && existing.set(u.email, u.id));
  if (data.users.length < 1000) break;
}

async function upsert(email, pass, role, nama, unitId) {
  let id = existing.get(email);
  if (id) {
    await sb.auth.admin.updateUserById(id, { password: pass, email_confirm: true });
  } else {
    const { data, error } = await sb.auth.admin.createUser({ email, password: pass, email_confirm: true, user_metadata: { nama } });
    if (error) { console.error(`✗ create ${email}: ${error.message}`); return; }
    id = data.user.id;
  }
  await sb.from("profiles").upsert({ id, role, nama, unit_id: unitId ?? null }, { onConflict: "id" });
}

// 1) Buat akun unit baru (rsusofifi)
const { data: units } = await sb.from("units").select("id, nama").order("nama", { ascending: true });
let nUnit = 0;
for (const u of units) {
  await upsert(`${slug(u.nama)}@unit.rsusofifi.local`, PASS_UNIT, "unit", u.nama, u.id);
  nUnit++;
}
console.log(`✓ ${nUnit} akun unit (rsusofifi) siap.`);

// 2) Buat admin baru (rsusofifi)
await upsert("admin@rsusofifi.go.id", PASS_ADMIN, "mutu", "Administrator Tim Mutu", null);
console.log("✓ admin@rsusofifi.go.id siap.");

// 3) Hapus akun lama berdomain rsudsofifi
let nDel = 0;
for (const [email, id] of existing) {
  const old = email.endsWith("@unit.rsudsofifi.local") || email === "admin@rsudsofifi.go.id" || email === "unit.amarilis@rsudsofifi.go.id";
  if (!old) continue;
  const { error } = await sb.auth.admin.deleteUser(id);
  if (error) console.error(`✗ hapus ${email}: ${error.message}`);
  else { console.log(`🗑️  hapus ${email}`); nDel++; }
}
console.log(`\nSelesai. Akun baru dibuat & ${nDel} akun lama (rsudsofifi) dihapus.`);
