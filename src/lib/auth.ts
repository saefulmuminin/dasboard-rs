import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "unit" | "mutu";

export type Profile = {
  id: string;
  nama: string | null;
  role: Role;
  unit_id: number | null;
};

// Ambil sesi + profil (tanpa redirect).
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, profile: null as Profile | null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nama, role, unit_id")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, profile: (profile as Profile) ?? null };
}

// Wajib login.
export async function requireUser() {
  const s = await getSession();
  if (!s.user) redirect("/login");
  return s;
}

// Wajib login + role mutu (admin).
export async function requireMutu() {
  const s = await requireUser();
  if (s.profile?.role !== "mutu") redirect("/dashboard");
  return s;
}
