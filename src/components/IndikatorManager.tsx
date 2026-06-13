"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { showConfirm, showError, showToast } from "@/lib/swal";

export type Ind = {
  id: number;
  nomor: number | null;
  nama: string;
  satuan: string;
  target: number | null;
  aktif: boolean;
};

export default function IndikatorManager({ initial }: { initial: Ind[] }) {
  const supabase = createClient();
  const [list, setList] = useState<Ind[]>(initial);
  const [nama, setNama] = useState("");
  const [satuan, setSatuan] = useState("%");
  const [target, setTarget] = useState("");
  const [nomor, setNomor] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  async function reload() {
    const { data } = await supabase
      .from("indicators")
      .select("id, nomor, nama, satuan, target, aktif")
      .order("nomor", { ascending: true });
    setList((data as Ind[]) ?? []);
  }

  async function tambah(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim()) {
      showError("Input Tidak Valid", "Nama indikator wajib diisi.");
      return;
    }

    setIsAdding(true);
    const { error } = await supabase.from("indicators").insert({
      nama: nama.trim(),
      satuan: satuan || "%",
      target: target ? Number(target) : null,
      nomor: nomor ? Number(nomor) : null,
      jenis: "nasional",
    });
    setIsAdding(false);

    if (error) {
      showError("Gagal Menambah", error.message);
      return;
    }

    showToast("success", "Indikator berhasil ditambahkan");
    setNama("");
    setTarget("");
    setNomor("");
    reload();
  }

  async function simpan(it: Ind) {
    if (!it.nama.trim()) {
      showError("Input Tidak Valid", "Nama indikator tidak boleh kosong.");
      return;
    }

    setLoadingId(it.id);
    const { error } = await supabase
      .from("indicators")
      .update({ nama: it.nama, satuan: it.satuan, target: it.target, aktif: it.aktif })
      .eq("id", it.id);
    setLoadingId(null);

    if (error) {
      showError("Gagal Menyimpan", error.message);
      return;
    }

    showToast("success", "Perubahan indikator disimpan");
    reload();
  }

  async function hapus(id: number) {
    const result = await showConfirm(
      "Hapus Indikator?",
      "Tindakan ini akan menghapus indikator mutu. Operasi akan gagal jika sudah ada data laporan yang dikaitkan dengan indikator ini.",
      "Ya, Hapus",
      "Batal"
    );
    if (!result.isConfirmed) return;

    const { error } = await supabase.from("indicators").delete().eq("id", id);
    if (error) {
      showError("Gagal Menghapus", "Tidak bisa menghapus indikator: " + error.message);
      return;
    }

    showToast("success", "Indikator berhasil dihapus");
    reload();
  }

  const patch = (id: number, p: Partial<Ind>) =>
    setList((l) => l.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const inp = "rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 bg-slate-50/50 focus:bg-white";

  return (
    <div className="space-y-6">
      {/* Tambah */}
      <form onSubmit={tambah} className="flex flex-wrap items-end gap-3.5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="w-20">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">No.</label>
          <input
            value={nomor}
            onChange={(e) => setNomor(e.target.value)}
            type="number"
            className={`${inp} w-full`}
            placeholder="1"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nama Indikator Baru</label>
          <input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className={`${inp} w-full`}
            placeholder="Masukkan nama indikator mutu..."
          />
        </div>
        <div className="w-20">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Satuan</label>
          <input
            value={satuan}
            onChange={(e) => setSatuan(e.target.value)}
            className={`${inp} w-full text-center`}
            placeholder="%"
          />
        </div>
        <div className="w-24">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Target</label>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            type="number"
            className={`${inp} w-full`}
            placeholder="100"
          />
        </div>
        <button
          disabled={isAdding}
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60 shrink-0"
        >
          {isAdding ? "Menambahkan..." : "+ Tambah"}
        </button>
      </form>

      {/* Tabel */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4 w-16 text-center">No.</th>
                <th className="px-5 py-4">Nama Indikator Mutu</th>
                <th className="px-5 py-4 w-24">Satuan</th>
                <th className="px-5 py-4 w-28">Target</th>
                <th className="px-5 py-4 w-24 text-center">Aktif</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    Belum ada indikator terdaftar.
                  </td>
                </tr>
              ) : (
                list.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 text-center font-bold text-slate-400">
                      {it.nomor ?? "•"}
                    </td>
                    <td className="px-5 py-3">
                      <input
                        value={it.nama}
                        onChange={(e) => patch(it.id, { nama: e.target.value })}
                        className={`${inp} w-full font-semibold text-slate-700`}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        value={it.satuan}
                        onChange={(e) => patch(it.id, { satuan: e.target.value })}
                        className={`${inp} w-full text-center font-medium text-slate-700`}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        value={it.target ?? ""}
                        onChange={(e) => patch(it.id, { target: e.target.value === "" ? null : Number(e.target.value) })}
                        className={`${inp} w-full font-medium text-slate-700`}
                        placeholder="Target"
                      />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={it.aktif}
                          onChange={(e) => patch(it.id, { aktif: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                      </label>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => simpan(it)}
                          disabled={loadingId === it.id}
                          className="rounded-xl bg-brand-50 border border-brand-200/50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 hover:text-brand-800 transition active:scale-[0.98] disabled:opacity-60"
                        >
                          {loadingId === it.id ? "Menyimpan..." : "Simpan"}
                        </button>
                        <button
                          onClick={() => hapus(it.id)}
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
