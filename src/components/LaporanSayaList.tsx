"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { NAMA_BULAN } from "@/lib/site";
import { showConfirm, showError, showToast } from "@/lib/swal";

const STATUS = {
  draft: { label: "Draft", cls: "bg-slate-50 text-slate-500 border-slate-200" },
  submitted: { label: "Menunggu Verifikasi", cls: "bg-slate-50 text-slate-600 border-slate-200" },
  approved: { label: "Disetujui", cls: "bg-slate-100 text-slate-700 border-slate-300" },
  rejected: { label: "Ditolak / Perbaikan", cls: "bg-slate-50 text-slate-600 border-slate-200" },
};

type Row = {
  id: number;
  tahun: number;
  bulan: number;
  hasil: number;
  status: keyof typeof STATUS;
  indicators: { nomor: number | null; nama: string; satuan: string } | null;
};

export default function LaporanSayaList({
  initialRows,
}: {
  initialRows: Row[];
}) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const supabase = createClient();

  async function handleKirim(id: number) {
    const confirmResult = await showConfirm(
      "Kirim Laporan?",
      "Laporan akan diajukan ke Tim Mutu untuk diverifikasi. Setelah dikirim, laporan tidak dapat langsung diedit kecuali ditolak.",
      "Ya, Kirim Laporan",
      "Batal"
    );
    if (!confirmResult.isConfirmed) return;

    setLoadingId(id);
    const { error } = await supabase
      .from("reports")
      .update({ status: "submitted" })
      .eq("id", id);
    setLoadingId(null);

    if (error) {
      showError("Gagal Mengirim", error.message);
      return;
    }

    showToast("success", "Laporan berhasil dikirim");
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "submitted" } : r))
    );
  }

  async function handleHapus(id: number) {
    const confirmResult = await showConfirm(
      "Hapus Laporan?",
      "Tindakan ini akan menghapus draf laporan Anda secara permanen.",
      "Ya, Hapus",
      "Batal"
    );
    if (!confirmResult.isConfirmed) return;

    setLoadingId(id);
    const { error } = await supabase.from("reports").delete().eq("id", id);
    setLoadingId(null);

    if (error) {
      showError("Gagal Menghapus", error.message);
      return;
    }

    showToast("success", "Laporan berhasil dihapus");
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-400">
              <th className="px-5 py-4">Indikator</th>
              <th className="px-5 py-4">Periode</th>
              <th className="px-5 py-4 text-right">Hasil Capaian</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400 font-medium">
                  Belum ada laporan mutu yang dibuat. Silakan klik "+ Input Laporan".
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const st = STATUS[r.status];
                const bisaEdit = r.status !== "approved";
                const isLoading = loadingId === r.id;

                return (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800 leading-snug">
                        {r.indicators?.nomor ? `${r.indicators.nomor}. ` : ""}
                        {r.indicators?.nama ?? "-"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-medium">
                      {NAMA_BULAN[r.bulan]} {r.tahun}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-800">
                      {r.hasil}
                      <span className="text-xs font-semibold text-slate-400 ml-0.5">{r.indicators?.satuan ?? "%"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        {bisaEdit && (
                          <Link
                            href={`/dashboard/laporan/${r.id}/edit`}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition active:scale-[0.98]"
                          >
                            Edit
                          </Link>
                        )}
                        {(r.status === "draft" || r.status === "rejected") && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleKirim(r.id)}
                            className="rounded-lg bg-slate-850 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 transition active:scale-[0.98] disabled:opacity-60"
                          >
                            Kirim
                          </button>
                        )}
                        {r.status === "draft" && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleHapus(r.id)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition active:scale-[0.98]"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
