"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { showConfirm, showError, showToast } from "@/lib/swal";
import { NAMA_BULAN } from "@/lib/site";

export type Opt = { id: number; nama: string };
type Row = {
  id: number;
  tahun: number;
  bulan: number;
  numerator: number;
  denominator: number;
  hasil: number;
  status: string;
  nama_pengisi: string | null;
  indicators: { nomor: number | null; nama: string } | null;
  units: { nama: string } | null;
};

const STATUS_LABEL: Record<string, string> = { draft: "Draft", submitted: "Menunggu", approved: "Disetujui" };
const STATUS_CLS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
};

export default function KelolaLaporanList({ units }: { units: Opt[] }) {
  const supabase = createClient();
  const now = new Date();

  const [tahun, setTahun] = useState(now.getFullYear());
  const [bulan, setBulan] = useState(0); // 0 = semua bulan
  const [unitId, setUnitId] = useState<number | "all">("all");
  const [status, setStatus] = useState("all");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function muat() {
    setLoading(true);
    let q = supabase
      .from("reports")
      .select("id, tahun, bulan, numerator, denominator, hasil, status, nama_pengisi, indicators(nomor,nama), units(nama)")
      .eq("tahun", tahun)
      .order("bulan", { ascending: false });
    if (bulan) q = q.eq("bulan", bulan);
    if (unitId !== "all") q = q.eq("unit_id", unitId);
    if (status !== "all") q = q.eq("status", status);
    const { data, error } = await q;
    setLoading(false);
    if (error) {
      showError("Gagal Memuat", error.message);
      return;
    }
    setRows((data as unknown as Row[]) ?? []);
  }

  useEffect(() => {
    muat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tahun, bulan, unitId, status]);

  async function hapus(r: Row) {
    const approved = r.status === "approved";
    const res = await showConfirm(
      approved ? "Hapus Laporan yang SUDAH Diverifikasi?" : "Hapus Laporan?",
      `${r.units?.nama ?? "-"} — ${r.indicators?.nama ?? "-"} (${NAMA_BULAN[r.bulan]} ${r.tahun}). ` +
        (approved ? "Laporan ini sudah disetujui. " : "") +
        "Setelah dihapus, ruangan dapat mengisi ulang laporan ini. Tindakan ini tidak dapat dibatalkan.",
      "Ya, Hapus",
      "Batal",
    );
    if (!res.isConfirmed) return;
    setBusyId(r.id);
    const { error } = await supabase.from("reports").delete().eq("id", r.id);
    setBusyId(null);
    if (error) {
      showError("Gagal Menghapus", error.message);
      return;
    }
    setRows((l) => l.filter((x) => x.id !== r.id));
    showToast("success", "Laporan dihapus — ruangan bisa input ulang");
  }

  const inp = "rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-white";

  return (
    <div className="space-y-5">
      {/* Filter */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Bulan</label>
          <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className={inp}>
            <option value={0}>Semua bulan</option>
            {NAMA_BULAN.map((n, i) => (i === 0 ? null : <option key={i} value={i}>{n}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Tahun</label>
          <input type="number" value={tahun} onChange={(e) => setTahun(Number(e.target.value) || now.getFullYear())} className={`${inp} w-24`} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Unit</label>
          <select value={unitId} onChange={(e) => setUnitId(e.target.value === "all" ? "all" : Number(e.target.value))} className={inp}>
            <option value="all">Semua unit</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.nama}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inp}>
            <option value="all">Semua status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Menunggu Verifikasi</option>
            <option value="approved">Disetujui</option>
          </select>
        </div>
        <div className="ml-auto self-center text-sm text-slate-400">
          {loading ? "Memuat..." : `${rows.length} laporan`}
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Indikator</th>
                <th className="px-4 py-3">Periode</th>
                <th className="px-4 py-3 text-center">Num/Den</th>
                <th className="px-4 py-3 text-center">Hasil</th>
                <th className="px-4 py-3">Pengisi</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    {loading ? "Memuat..." : "Tidak ada laporan pada filter ini."}
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-700">{r.units?.nama ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="text-slate-400">{r.indicators?.nomor ? `${r.indicators.nomor}. ` : ""}</span>
                      {r.indicators?.nama ?? "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">{NAMA_BULAN[r.bulan]} {r.tahun}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{r.numerator}/{r.denominator}</td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-800">{r.hasil}%</td>
                    <td className="px-4 py-3 text-slate-500">{r.nama_pengisi ?? "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLS[r.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => hapus(r)}
                        disabled={busyId === r.id}
                        className="rounded-lg border border-red-100 bg-red-50/50 px-3.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 active:scale-[0.98] disabled:opacity-50"
                      >
                        {busyId === r.id ? "Menghapus..." : "Hapus"}
                      </button>
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
