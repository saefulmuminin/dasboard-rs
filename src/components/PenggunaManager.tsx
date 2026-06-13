"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { showError, showToast } from "@/lib/swal";

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

  return (
    <div className="space-y-6">
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
                        className={`${inp} font-medium text-slate-755`}
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
                        className={`${inp} w-full min-w-[180px] font-medium text-slate-755 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200`}
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
