// Set target indikator (default standar Indikator Mutu Nasional).
// Pakai: SUPABASE_SERVICE_ROLE_KEY dari .env (atau env var).
//   node scripts/set-targets.mjs
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env", "utf8").split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("✗ URL / service_role key tidak ada."); process.exit(1); }

// nomor -> target
const TARGETS = {
  1: 85, 2: 100, 3: 100, 4: 80, 5: 80, 6: 100, 7: 80, 8: 80, 9: 100,
  10: 80, 11: 80, 12: 100, 13: 100, 14: 5, 15: 80, 16: 80, 17: 80, 18: 80,
};

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

let ok = 0;
for (const [nomor, target] of Object.entries(TARGETS)) {
  const { error } = await supabase.from("indicators").update({ target }).eq("nomor", Number(nomor));
  if (error) console.error(`✗ nomor ${nomor}: ${error.message}`);
  else ok++;
}
const { data } = await supabase.from("indicators").select("nomor, target").order("nomor");
console.log(`\nTarget di-set untuk ${ok} indikator.`);
console.log("Cek:", (data ?? []).map((d) => `#${d.nomor}=${d.target}`).join("  "));
