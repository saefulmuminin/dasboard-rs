"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { NAMA_BULAN } from "@/lib/site";
import { showConfirm, showError, showToast } from "@/lib/swal";

type Row = {
  id: number;
  tahun: number;
  bulan: number;
  numerator: number;
  denominator: number;
  hasil: number;
  nama_pengisi: string | null;
  analisa: string | null;
  rtl: string | null;
  bukti_url: string | null;
  indicators: { nomor: number | null; nama: string; satuan: string; target: number | null } | null;
  units: { nama: string } | null;
};

export default function VerifikasiList({
  initialRows,
  signedUrls,
  userId,
}: {
  initialRows: Row[];
  signedUrls: Record<number, string>;
  userId: string;
}) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [actioningId, setActioningId] = useState<number | null>(null);
  const supabase = createClient();

  async function handleStatus(id: number, status: "approved" | "rejected") {
    const isApprove = status === "approved";
    const title = isApprove ? "Setujui Laporan?" : "Tolak Laporan?";
    const text = isApprove
      ? "Laporan ini akan disetujui dan datanya akan direkap ke grafik monitoring mutu."
      : "Laporan ini akan ditolak dan dikembalikan ke draf petugas unit pelayanan terkait.";
    
    const confirmResult = await showConfirm(
      title,
      text,
      isApprove ? "Ya, Setujui" : "Ya, Tolak",
      "Batal"
    );
    if (!confirmResult.isConfirmed) return;

    setActioningId(id);
    const { error } = await supabase
      .from("reports")
      .update({ status, reviewed_by: userId })
      .eq("id", id);
    setActioningId(null);

    if (error) {
      showError("Gagal Memproses", error.message);
      return;
    }

    showToast("success", isApprove ? "Laporan disetujui" : "Laporan berhasil ditolak");
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
        <h3 className="text-base font-bold text-slate-800">Semua Laporan Terverifikasi</h3>
        <p className="mt-1 text-sm text-slate-400 max-w-sm">
          Tidak ada berkas pelaporan masuk yang sedang menunggu persetujuan Anda saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((r) => {
        const target = r.indicators?.target ?? 0;
        const tercapai = r.indicators?.target != null ? Number(r.hasil) >= target : null;
        const isActioning = actioningId === r.id;

        return (
          <div
            key={r.id}
            className="rounded-2xl border border-slate-255 bg-white p-6 transition-all duration-200 hover:border-slate-300"
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-slate-400">
                  {r.units?.nama || "Umum"}
                </span>
                <h3 className="mt-1.5 text-base font-bold text-slate-800 leading-snug">
                  {r.indicators?.nomor ? `${r.indicators.nomor}. ` : ""}
                  {r.indicators?.nama}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Periode Laporan: {NAMA_BULAN[r.bulan]} {r.tahun}
                </p>
              </div>

              <div className="sm:text-right shrink-0">
                <p className="text-3xl font-extrabold text-slate-800">
                  {r.hasil}
                  <span className="text-base font-medium ml-0.5">{r.indicators?.satuan ?? "%"}</span>
                </p>
                {tercapai !== null && (
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {tercapai ? "Tercapai" : "Belum Tercapai"} (Target: {target}{r.indicators?.satuan})
                  </p>
                )}
              </div>
            </div>

            {/* Rincian data */}
            <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 bg-slate-50 rounded-xl p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pengisi Laporan</p>
                <p className="mt-1 font-semibold text-slate-700">{r.nama_pengisi || "—"}</p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Variabel Capaian</p>
                <p className="mt-1 font-semibold text-slate-700">
                  Numerator: {r.numerator} · Denominator: {r.denominator}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bukti Dukung</p>
                <div className="mt-1">
                  {signedUrls[r.id] ? (
                    <a
                      href={signedUrls[r.id]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-brand-600 hover:underline"
                    >
                      Lihat File Lampiran (PDF)
                    </a>
                  ) : (
                    <span className="text-xs text-slate-455 italic font-medium">Tidak ada lampiran dokumen</span>
                  )}
                </div>
              </div>

              {r.analisa && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Analisa Capaian</p>
                  <p className="mt-1 text-slate-655 leading-relaxed font-medium">{r.analisa}</p>
                </div>
              )}

              {r.rtl && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Rencana Tindak Lanjut (RTL)</p>
                  <p className="mt-1 text-slate-655 leading-relaxed font-medium">{r.rtl}</p>
                </div>
              )}
            </div>

            {/* Aksi Verifikasi */}
            <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">
              <button
                disabled={isActioning}
                onClick={() => handleStatus(r.id, "approved")}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isActioning && actioningId === r.id ? "Memproses..." : "Setujui"}
              </button>
              <button
                disabled={isActioning}
                onClick={() => handleStatus(r.id, "rejected")}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Tolak
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
