"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { showError, showSuccess, showToast } from "@/lib/swal";
import type { Role } from "@/lib/auth";

export default function ProfilForm({
  userId,
  initialNama,
  email,
  role,
  unitNama,
}: {
  userId: string;
  initialNama: string;
  email: string;
  role: Role;
  unitNama: string | null;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [nama, setNama] = useState(initialNama);
  const [savingNama, setSavingNama] = useState(false);

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  async function simpanProfil(e: React.FormEvent) {
    e.preventDefault();
    const v = nama.trim();
    if (!v) {
      showError("Input Tidak Valid", "Nama tidak boleh kosong.");
      return;
    }
    setSavingNama(true);
    const { error } = await supabase.from("profiles").update({ nama: v }).eq("id", userId);
    setSavingNama(false);
    if (error) {
      showError("Gagal Menyimpan", error.message);
      return;
    }
    showToast("success", "Profil diperbarui");
    router.refresh();
  }

  async function gantiPassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 6) {
      showError("Sandi Terlalu Pendek", "Kata sandi minimal 6 karakter.");
      return;
    }
    if (pw !== pw2) {
      showError("Sandi Tidak Cocok", "Konfirmasi kata sandi tidak sesuai.");
      return;
    }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSavingPw(false);
    if (error) {
      showError("Gagal Mengubah Sandi", error.message);
      return;
    }
    setPw("");
    setPw2("");
    showSuccess("Kata Sandi Diperbarui", "Kata sandi akun Anda berhasil diubah. Gunakan sandi baru saat login berikutnya.");
  }

  const inp =
    "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 bg-slate-50/50 focus:bg-white";
  const label = "block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5";

  return (
    <div className="space-y-6">
      {/* Kartu 1: Informasi Profil */}
      <form onSubmit={simpanProfil} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Informasi Profil</h2>
          <p className="mt-0.5 text-sm text-slate-500">Nama yang tampil di sistem. Email & peran diatur oleh Tim Mutu.</p>
        </div>

        <div>
          <label className={label}>Nama Lengkap</label>
          <input value={nama} onChange={(e) => setNama(e.target.value)} className={inp} placeholder="Nama petugas / pengisi laporan" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Email (untuk login)</label>
            <input value={email} disabled className={`${inp} cursor-not-allowed text-slate-500`} />
          </div>
          <div>
            <label className={label}>{role === "mutu" ? "Peran" : "Unit / Ruangan"}</label>
            <input
              value={role === "mutu" ? "Tim Mutu (Admin)" : unitNama ?? "Belum ditetapkan"}
              disabled
              className={`${inp} cursor-not-allowed text-slate-500`}
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            disabled={savingNama}
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60"
          >
            {savingNama ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </div>
      </form>

      {/* Kartu 2: Ganti Kata Sandi */}
      <form onSubmit={gantiPassword} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Ganti Kata Sandi</h2>
          <p className="mt-0.5 text-sm text-slate-500">Ubah kata sandi akun Anda langsung di sini (tanpa email reset).</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Kata Sandi Baru</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className={`${inp} pr-10`}
                placeholder="Min. 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <div>
            <label className={label}>Konfirmasi Sandi Baru</label>
            <input
              type={showPw ? "text" : "password"}
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              className={inp}
              placeholder="Ulangi kata sandi baru"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            disabled={savingPw}
            className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 active:scale-[0.98] disabled:opacity-60"
          >
            {savingPw ? "Menyimpan..." : "Perbarui Kata Sandi"}
          </button>
        </div>
      </form>
    </div>
  );
}
