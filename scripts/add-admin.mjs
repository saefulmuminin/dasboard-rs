// Buat 1 akun admin (role: mutu). Idempotent.
//   ADMIN_EMAIL="admin@gmail.com" ADMIN_PASSWORD="Admin2026" node scripts/add-admin.mjs
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

const EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const PASSWORD = process.env.ADMIN_PASSWORD || "Admin2026";
const NAMA = process.env.ADMIN_NAMA || "Administrator";

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

// cari apakah email sudah ada
let id = null;
for (let page = 1; ; page++) {
  const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) { console.error("listUsers:", error.message); process.exit(1); }
  const found = data.users.find((u) => u.email === EMAIL);
  if (found) { id = found.id; break; }
  if (data.users.length < 1000) break;
}

if (id) {
  await sb.auth.admin.updateUserById(id, { password: PASSWORD, email_confirm: true });
} else {
  const { data, error } = await sb.auth.admin.createUser({
    email: EMAIL, password: PASSWORD, email_confirm: true, user_metadata: { nama: NAMA },
  });
  if (error) { console.error("✗ createUser:", error.message); process.exit(1); }
  id = data.user.id;
}

const { error: pe } = await sb.from("profiles").upsert(
  { id, role: "mutu", nama: NAMA, unit_id: null }, { onConflict: "id" },
);
if (pe) { console.error("✗ profil:", pe.message); process.exit(1); }

console.log(`✓ Akun admin siap: ${EMAIL}  (password: ${PASSWORD})  role: mutu`);
