"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { showError, showSuccess, showToast } from "@/lib/swal";
import { buatPengguna } from "@/app/dashboard/pengguna/actions";

export type Pengguna = {
  id: string;
  nama: string | null;
  email: string | null;
  role: "unit" | "mutu";
  unit_id: number | null;
};
export type UnitOpt = { id: number; nama: string };

export default function PenggunaManager({
  initial,
  units,
}: {
  initial: Pengguna[];
  units: UnitOpt[];
}) {
  const supabase = createClient();
  const [list, setList] = useState<Pengguna[]>(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // --- form tambah pengguna ---
  const [nbNama, setNbNama] = useState("");
  const [nbEmail, setNbEmail] = useState("");
  const [nbPass, setNbPass] = useState("");
  const [nbRole, setNbRole] = useState<"unit" | "mutu">("unit");
  const [nbUnit, setNbUnit] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [creating, setCreating] = useState(false);

  async function tambah(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await buatPengguna({
      nama: nbNama,
      email: nbEmail,
      password: nbPass,
      role: nbRole,
      unit_id: nbRole === "unit" && nbUnit ? Number(nbUnit) : null,
    });
    setCreating(false);

    if (!res.ok) {
      showError("Gagal Membuat Pengguna", res.error);
      return;
    }

    const emailBaru = res.pengguna.email;
    const passBaru = nbPass;
    setList((l) => [res.pengguna, ...l]);
    setNbNama("");
    setNbEmail("");
    setNbPass("");
    setNbRole("unit");
    setNbUnit("");
    showSuccess(
      "Pengguna Berhasil Dibuat",
      `Akun ${emailBaru} siap dipakai.\n\nKata sandi: ${passBaru}\n\nSalin & berikan ke petugas — kata sandi tidak dapat dilihat lagi setelah ini.`,
    );
  }

  async function simpan(p: Pengguna) {
    setLoadingId(p.id);
    const { error } = await supabase
      .from("profiles")
      .update({
        nama: p.nama?.trim() || null,
        role: p.role,
        unit_id: p.role === "mutu" ? null : p.unit_id,
      })
      .eq("id", p.id);
    setLoadingId(null);

    if (error) {
      showError("Gagal Menyimpan", error.message);
      return;
    }

    showToast("success", "Pengguna berhasil diperbarui");
  }

  const patch = (id: string, p: Partial<Pengguna>) =>
    setList((l) => l.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const inp = "rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none transition-all focus:border-slate-400 bg-white";
  const inp2 = "rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-white";
  const lbl = "block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1";

  return (
    <div className="space-y-6">
      {/* Form Tambah Pengguna */}
      <form onSubmit={tambah} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Tambah Pengguna Baru</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Buat akun login (email + kata sandi) untuk petugas unit atau Tim Mutu. Akun langsung aktif tanpa verifikasi email.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={lbl}>Nama Lengkap</label>
            <input value={nbNama} onChange={(e) => setNbNama(e.target.value)} className={`${inp2} w-full`} placeholder="mis. Siti Aminah" />
          </div>
          <div>
            <label className={lbl}>Email (untuk login)</label>
            <input type="email" value={nbEmail} onChange={(e) => setNbEmail(e.target.value)} className={`${inp2} w-full`} placeholder="nama@rsusofifi.go.id" />
          </div>
          <div>
            <label className={lbl}>Kata Sandi</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={nbPass}
                onChange={(e) => setNbPass(e.target.value)}
                className={`${inp2} w-full pr-10`}
                placeholder="Min. 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <div>
            <label className={lbl}>Peran</label>
            <select value={nbRole} onChange={(e) => setNbRole(e.target.value as "unit" | "mutu")} className={`${inp2} w-full`}>
              <option value="unit">Petugas Unit</option>
              <option value="mutu">Tim Mutu</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Unit Kerja</label>
            <select
              value={nbUnit}
              disabled={nbRole === "mutu"}
              onChange={(e) => setNbUnit(e.target.value)}
              className={`${inp2} w-full disabled:bg-slate-100 disabled:text-slate-400`}
            >
              <option value="">— pilih unit —</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.nama}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              disabled={creating}
              className="w-full rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60"
            >
              {creating ? "Membuat..." : "+ Tambah Pengguna"}
            </button>
          </div>
        </div>
      </form>

      {/* Tabel */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4">Alamat Email</th>
                <th className="px-5 py-4">Nama Lengkap</th>
                <th className="px-5 py-4">Peran Akses</th>
                <th className="px-5 py-4">Unit Kerja</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    Belum ada pengguna terdaftar.
                  </td>
                </tr>
              ) : (
                list.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-700">{p.email}</td>
                    <td className="px-5 py-3">
                      <input
                        value={p.nama ?? ""}
                        onChange={(e) => patch(p.id, { nama: e.target.value })}
                        className={`${inp} w-full min-w-[160px] font-medium text-slate-800`}
                        placeholder="Nama Lengkap"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={p.role}
                        onChange={(e) => patch(p.id, { role: e.target.value as Pengguna["role"] })}
                        className={`${inp} font-medium text-slate-700`}
                      >
                        <option value="unit">Petugas Unit</option>
                        <option value="mutu">Tim Mutu</option>
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={p.unit_id ?? ""}
                        disabled={p.role === "mutu"}
                        onChange={(e) => patch(p.id, { unit_id: e.target.value === "" ? null : Number(e.target.value) })}
                        className={`${inp} w-full min-w-[180px] font-medium text-slate-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200`}
                      >
                        <option value="">— pilih unit pelayanan —</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.nama}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => simpan(p)}
                          disabled={loadingId === p.id}
                          className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition active:scale-[0.98] disabled:opacity-60"
                        >
                          {loadingId === p.id ? "Menyimpan..." : "Simpan"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
