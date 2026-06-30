"use server";

import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth";

export type BuatPenggunaInput = {
  nama: string;
  email: string;
  password: string;
  role: "unit" | "mutu";
  unit_id: number | null;
};

export type PenggunaBaru = {
  id: string;
  nama: string | null;
  email: string | null;
  role: "unit" | "mutu";
  unit_id: number | null;
};

export type BuatPenggunaResult =
  | { ok: true; pengguna: PenggunaBaru }
  | { ok: false; error: string };

export async function buatPengguna(input: BuatPenggunaInput): Promise<BuatPenggunaResult> {
  // 1) OTORISASI: hanya Tim Mutu (admin) yang boleh membuat akun.
  const { profile } = await getSession();
  if (profile?.role !== "mutu") {
    return { ok: false, error: "Akses ditolak. Hanya Tim Mutu yang dapat membuat pengguna." };
  }

  // 2) Validasi input.
  const nama = input.nama?.trim() || "";
  const email = input.email?.trim().toLowerCase() || "";
  const password = input.password ?? "";
  const role = input.role === "mutu" ? "mutu" : "unit";
  const unit_id = role === "unit" ? input.unit_id : null;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Format email tidak valid." };
  if (password.length < 6) return { ok: false, error: "Kata sandi minimal 6 karakter." };
  if (role === "unit" && !unit_id) return { ok: false, error: "Petugas Unit wajib dipilih unit kerjanya." };

  // 3) Klien admin (service_role) — HANYA berjalan di server.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return { ok: false, error: "Konfigurasi server belum lengkap: SUPABASE_SERVICE_ROLE_KEY belum diset di environment (Vercel)." };
  }
  const admin = createAdminClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // 4) Buat akun auth (email langsung terkonfirmasi, tanpa kirim email).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nama },
  });
  if (createErr || !created?.user) {
    const dup = /already|registered|exists|duplicate/i.test(createErr?.message ?? "");
    return { ok: false, error: dup ? "Email sudah terdaftar." : createErr?.message ?? "Gagal membuat akun." };
  }
  const id = created.user.id;

  // 5) Set profil (role + unit). Trigger handle_new_user sudah membuat baris (id, nama, email).
  const { error: profErr } = await admin
    .from("profiles")
    .upsert({ id, nama, email, role, unit_id }, { onConflict: "id" });
  if (profErr) {
    // rollback: hapus akun auth agar tak ada user tanpa profil yang benar.
    await admin.auth.admin.deleteUser(id);
    return { ok: false, error: "Gagal menyimpan profil: " + profErr.message };
  }

  revalidatePath("/dashboard/pengguna");
  return { ok: true, pengguna: { id, nama, email, role, unit_id } };
}
