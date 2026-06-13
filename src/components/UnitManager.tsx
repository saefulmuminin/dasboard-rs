"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { showConfirm, showError, showToast } from "@/lib/swal";

export type Unit = { id: number; nama: string; aktif: boolean };

export default function UnitManager({ initial }: { initial: Unit[] }) {
  const supabase = createClient();
  const [list, setList] = useState<Unit[]>(initial);
  const [nama, setNama] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  async function reload() {
    const { data } = await supabase
      .from("units")
      .select("id, nama, aktif")
      .order("nama", { ascending: true });
    setList((data as Unit[]) ?? []);
  }

  async function tambah(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim()) {
      showError("Input Tidak Valid", "Nama unit/ruangan wajib diisi.");
      return;
    }

    setIsAdding(true);
    const { error } = await supabase.from("units").insert({ nama: nama.trim() });
    setIsAdding(false);

    if (error) {
      showError("Gagal Menambah", error.message);
      return;
    }

    showToast("success", "Unit berhasil ditambahkan");
    setNama("");
    reload();
  }

  async function simpan(u: Unit) {
    if (!u.nama.trim()) {
      showError("Input Tidak Valid", "Nama unit tidak boleh kosong.");
      return;
    }

    setLoadingId(u.id);
    const { error } = await supabase
      .from("units")
      .update({ nama: u.nama, aktif: u.aktif })
      .eq("id", u.id);
    setLoadingId(null);

    if (error) {
      showError("Gagal Menyimpan", error.message);
      return;
    }

    showToast("success", "Perubahan unit disimpan");
    reload();
  }

  async function hapus(id: number) {
    const result = await showConfirm(
      "Hapus Unit?",
      "Tindakan ini akan menghapus unit. Operasi akan gagal jika unit sudah dikaitkan dengan laporan apa pun.",
      "Ya, Hapus",
      "Batal"
    );
    if (!result.isConfirmed) return;

    const { error } = await supabase.from("units").delete().eq("id", id);
    if (error) {
      showError("Gagal Menghapus", "Tidak bisa menghapus unit: " + error.message);
      return;
    }

    showToast("success", "Unit berhasil dihapus");
    reload();
  }

  const patch = (id: number, p: Partial<Unit>) =>
    setList((l) => l.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const inp = "rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 bg-slate-50/50 focus:bg-white";

  return (
    <div className="space-y-6">
      {/* Form Tambah */}
      <form onSubmit={tambah} className="flex flex-col sm:flex-row items-end gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nama Unit/Ruangan Baru</label>
          <input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className={`${inp} w-full`}
            placeholder="mis. Poli Rawat Jalan / Ruang Melati"
          />
        </div>
        <button
          disabled={isAdding}
          className="w-full sm:w-auto rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60 shrink-0"
        >
          {isAdding ? "Menambahkan..." : "+ Tambah Unit"}
        </button>
      </form>

      {/* Tabel */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4">Nama Unit / Ruangan</th>
                <th className="px-5 py-4 text-center">Status Aktif</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-slate-400">
                    Belum ada unit yang terdaftar.
                  </td>
                </tr>
              ) : (
                list.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <input
                        value={u.nama}
                        onChange={(e) => patch(u.id, { nama: e.target.value })}
                        className={`${inp} w-full max-w-md font-semibold text-slate-700`}
                      />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={u.aktif}
                          onChange={(e) => patch(u.id, { aktif: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                      </label>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => simpan(u)}
                          disabled={loadingId === u.id}
                          className="rounded-xl bg-brand-50 border border-brand-200/50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 hover:text-brand-800 transition active:scale-[0.98] disabled:opacity-60"
                        >
                          {loadingId === u.id ? "Menyimpan..." : "Simpan"}
                        </button>
                        <button
                          onClick={() => hapus(u.id)}
                          className="rounded-xl border border-red-100 bg-red-50/50 px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition active:scale-[0.98]"
                        >
                          Hapus
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
