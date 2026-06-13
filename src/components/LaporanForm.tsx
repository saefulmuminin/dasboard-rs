"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NAMA_BULAN } from "@/lib/site";
import { showError, showSuccess } from "@/lib/swal";

export type IndikatorOpt = {
  id: number;
  nomor: number | null;
  nama: string;
  satuan: string;
  target: number | null;
};

export type LaporanInitial = {
  id: number;
  indicator_id: number;
  tahun: number;
  bulan: number;
  numerator: number;
  denominator: number;
  analisa: string | null;
  rtl: string | null;
  bukti_url: string | null;
};

export default function LaporanForm({
  mode,
  indikators,
  unitId,
  userId,
  initial,
}: {
  mode: "baru" | "edit";
  indikators: IndikatorOpt[];
  unitId: number;
  userId: string;
  initial?: LaporanInitial;
}) {
  const router = useRouter();
  const tahunIni = new Date().getFullYear();

  const [indicatorId, setIndicatorId] = useState<number>(
    initial?.indicator_id ?? indikators[0]?.id ?? 0,
  );
  const [tahun, setTahun] = useState<number>(initial?.tahun ?? tahunIni);
  const [bulan, setBulan] = useState<number>(
    initial?.bulan ?? new Date().getMonth() + 1,
  );
  const [numerator, setNumerator] = useState<string>(
    initial ? String(initial.numerator) : "",
  );
  const [denominator, setDenominator] = useState<string>(
    initial ? String(initial.denominator) : "",
  );
  const [analisa, setAnalisa] = useState(initial?.analisa ?? "");
  const [rtl, setRtl] = useState(initial?.rtl ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const indikatorTerpilih = indikators.find((i) => i.id === indicatorId);
  const hasil = useMemo(() => {
    const n = Number(numerator);
    const d = Number(denominator);
    if (!d || d <= 0) return null;
    return Math.round((n / d) * 10000) / 100;
  }, [numerator, denominator]);

  async function simpan(status: "draft" | "submitted") {
    if (!indicatorId) {
      showError("Validasi Gagal", "Pilih indikator terlebih dahulu.");
      return;
    }
    if (numerator === "" || denominator === "") {
      showError("Validasi Gagal", "Numerator dan denominator wajib diisi.");
      return;
    }
    if (Number(denominator) <= 0) {
      showError("Validasi Gagal", "Denominator harus lebih besar dari 0.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Upload bukti (opsional)
    let buktiPath = initial?.bukti_url ?? null;
    if (file) {
      const path = `${unitId}/${tahun}-${bulan}-${indicatorId}-${Date.now()}-${file.name}`;
      const { data: up, error: upErr } = await supabase.storage
        .from("bukti")
        .upload(path, file, { upsert: false });
      if (upErr) {
        setLoading(false);
        showError("Gagal Mengunggah", "Gagal upload file bukti: " + upErr.message);
        return;
      }
      buktiPath = up.path;
    }

    const payload = {
      indicator_id: indicatorId,
      unit_id: unitId,
      tahun,
      bulan,
      numerator: Number(numerator),
      denominator: Number(denominator),
      analisa: analisa || null,
      rtl: rtl || null,
      bukti_url: buktiPath,
      status,
      created_by: userId,
    };

    let error;
    if (mode === "edit" && initial) {
      ({ error } = await supabase
        .from("reports")
        .update(payload)
        .eq("id", initial.id));
    } else {
      ({ error } = await supabase.from("reports").insert(payload));
    }

    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        showError("Laporan Duplikat", "Laporan untuk indikator dan periode yang dipilih sudah terdaftar.");
      } else {
        showError("Gagal Menyimpan", error.message);
      }
      return;
    }

    await showSuccess(
      status === "draft" ? "Draft Disimpan" : "Laporan Terkirim",
      status === "draft"
        ? "Laporan berhasil disimpan sebagai draft."
        : "Laporan berhasil dikirim untuk proses verifikasi."
    );

    router.push("/dashboard/laporan");
    router.refresh();
  }

  const labelCls = "block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5";
  const inputCls =
    "mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        simpan("submitted");
      }}
      className="space-y-6"
    >
      <div>
        <label className={labelCls}>Indikator Mutu</label>
        <select
          value={indicatorId}
          onChange={(e) => setIndicatorId(Number(e.target.value))}
          className={inputCls}
        >
          {indikators.map((i) => (
            <option key={i.id} value={i.id}>
              {i.nomor ? `${i.nomor}. ` : ""}
              {i.nama}
            </option>
          ))}
        </select>
        {indikatorTerpilih?.target != null && (
          <p className="mt-2 text-xs font-semibold text-brand-600">
            Target Mutu: {indikatorTerpilih.target}
            {indikatorTerpilih.satuan}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Bulan Periode</label>
          <select
            value={bulan}
            onChange={(e) => setBulan(Number(e.target.value))}
            className={inputCls}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((b) => (
              <option key={b} value={b}>
                {NAMA_BULAN[b]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Tahun Periode</label>
          <input
            type="number"
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            className={inputCls}
            min={2020}
            max={2100}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Numerator</label>
          <input
            type="number"
            step="any"
            value={numerator}
            onChange={(e) => setNumerator(e.target.value)}
            className={inputCls}
            placeholder="Pembilang (data yang memenuhi standar)"
          />
        </div>
        <div>
          <label className={labelCls}>Denominator</label>
          <input
            type="number"
            step="any"
            value={denominator}
            onChange={(e) => setDenominator(e.target.value)}
            className={inputCls}
            placeholder="Penyebut (total seluruh kejadian)"
          />
        </div>
      </div>

      {/* Hasil otomatis */}
      <div className="rounded-2xl border border-brand-100 bg-brand-50/30 p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-800">Hasil Capaian (Kalkulasi Otomatis)</p>
          <p className="text-xs text-slate-400 mt-0.5">Dihitung dari numerator / denominator</p>
        </div>
        <span className="text-3xl font-extrabold text-brand-700">
          {hasil != null ? `${hasil}${indikatorTerpilih?.satuan ?? "%"}` : "—"}
        </span>
      </div>

      <div>
        <label className={labelCls}>
          Analisa Capaian <span className="text-slate-400 font-medium normal-case">(Penyebab Capaian Naik/Turun)</span>
        </label>
        <textarea
          rows={3}
          value={analisa}
          onChange={(e) => setAnalisa(e.target.value)}
          className={inputCls}
          placeholder="Jelaskan faktor pendukung atau penghambat capaian indikator..."
        />
      </div>

      <div>
        <label className={labelCls}>
          Rencana Tindak Lanjut (RTL) <span className="text-slate-400 font-medium normal-case">(Langkah Perbaikan)</span>
        </label>
        <textarea
          rows={3}
          value={rtl}
          onChange={(e) => setRtl(e.target.value)}
          className={inputCls}
          placeholder="Langkah konkret atau rekomendasi perbaikan untuk periode mendatang..."
        />
      </div>

      <div>
        <label className={labelCls}>
          Dokumen Bukti Dukung (PDF) <span className="text-slate-400 font-medium normal-case">— Opsional</span>
        </label>
        <div className="mt-1 flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/30 px-6 py-5">
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-10 w-10 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v24a4 4 0 004 4h24a4 4 0 004-4V20L28 8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M28 8v12h12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-slate-600">
              <label className="relative cursor-pointer rounded-md bg-white font-semibold text-brand-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2 hover:text-brand-500">
                <span>Pilih file PDF</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </label>
              <p className="pl-1">atau seret file ke sini</p>
            </div>
            <p className="text-xs text-slate-400">PDF maksimal 10MB</p>
            {file && (
              <p className="text-xs font-semibold text-brand-600 mt-2">
                Terpilih: {file.name}
              </p>
            )}
            {initial?.bukti_url && !file && (
              <p className="text-xs text-emerald-600 font-semibold mt-2">
                ✓ Dokumen bukti dukung sudah diunggah.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          disabled={loading}
          onClick={() => simpan("draft")}
          className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] disabled:opacity-60"
        >
          Simpan Draft
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/10 transition hover:bg-brand-700 hover:shadow-brand-700/20 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Kirim Laporan"}
        </button>
      </div>
    </form>
  );
}
