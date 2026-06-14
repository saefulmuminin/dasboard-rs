// Buat akun serah-terima (handover) untuk client:
//  - 1 akun Admin Tim Mutu (role: mutu)
//  - 1 contoh akun Unit (role: unit, ditautkan ke unit Amarilis)
// Idempotent: kalau email sudah ada, password & profilnya disinkronkan.
//   node scripts/seed-handover.mjs
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env", "utf8").split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("✗ URL / service_role key tidak ada di .env"); process.exit(1); }

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const ADMIN = { email: "admin@rsudsofifi.go.id", password: "MutuAdmin2026", nama: "Administrator Tim Mutu", role: "mutu" };
const UNIT = { email: "unit.amarilis@rsudsofifi.go.id", password: "UnitAmarilis2026", nama: "Petugas Unit Amarilis", role: "unit", unitNama: "Amarilis" };

// cari id unit untuk contoh akun unit
const { data: unitRow } = await sb.from("units").select("id").eq("nama", UNIT.unitNama).maybeSingle();
const unitId = unitRow?.id ?? null;

// daftar user existing
const existing = new Map();
for (let page = 1; ; page++) {
  const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) { console.error("listUsers:", error.message); break; }
  data.users.forEach((u) => u.email && existing.set(u.email, u.id));
  if (data.users.length < 1000) break;
}

async function upsertAccount(acc, extraProfile = {}) {
  let id = existing.get(acc.email);
  if (id) {
    await sb.auth.admin.updateUserById(id, { password: acc.password, email_confirm: true });
  } else {
    const { data, error } = await sb.auth.admin.createUser({
      email: acc.email, password: acc.password, email_confirm: true, user_metadata: { nama: acc.nama },
    });
    if (error) { console.error(`✗ ${acc.email}: ${error.message}`); return; }
    id = data.user.id;
  }
  const { error: pe } = await sb.from("profiles").upsert(
    { id, role: acc.role, nama: acc.nama, ...extraProfile }, { onConflict: "id" },
  );
  if (pe) console.error(`  ! profil ${acc.email}: ${pe.message}`);
  console.log(`✓ ${acc.role.toUpperCase().padEnd(5)} ${acc.email}  (pass: ${acc.password})`);
}

await upsertAccount(ADMIN);
await upsertAccount(UNIT, { unit_id: unitId });

console.log("\nSelesai. unit_id Amarilis =", unitId);
