"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, LabelList,
} from "recharts";

export type GridRow = Record<string, number | string | null>; // { unit, [bulanLabel]: capaian }
export type LinePoint = { label: string; capaian: number; target: number | null };
export type RsTotal = { label: string; num: number; den: number; hasil: number };

export type IndReport = {
  id: number;
  nomor: number | null;
  nama: string;
  satuan: string;
  target: number | null;
  months: string[]; // urut kronologis, mis. ["Mei 2026"]
  units: string[]; // nama unit yang melapor
  grid: GridRow[]; // satu baris per unit
  line: LinePoint[]; // satu titik per bulan
  rsTotals: RsTotal[]; // total RS keseluruhan per bulan (Σnum, Σden, hasil)
};

// Warna per bulan (mengikuti gaya laporan: biru, merah, hijau, ungu, teal, ...)
const MONTH_COLORS = [
  "#2563eb", "#dc2626", "#16a34a", "#7c3aed", "#0d9488",
  "#f59e0b", "#db2777", "#0891b2", "#65a30d", "#ea580c", "#4f46e5", "#059669",
];

const card = "rounded-2xl border border-slate-100 bg-white p-5 shadow-sm";

export default function IndicatorReportSection({ reports }: { reports: IndReport[] }) {
  const [sel, setSel] = useState<number>(reports[0]?.id ?? 0);
  const r = reports.find((x) => x.id === sel) ?? reports[0];

  if (!r) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
        Belum ada indikator dengan data untuk ditampilkan.
      </div>
    );
  }

  const sat = r.satuan || "%";
  const hasTarget = r.line.some((p) => p.target != null);
  const avg = (a: number[]) =>
    a.length ? Math.round((a.reduce((s, v) => s + v, 0) / a.length) * 100) / 100 : null;
  const avgCapaian = avg(r.line.map((p) => p.capaian));
  const avgTarget = avg(r.line.filter((p) => p.target != null).map((p) => p.target as number));
  const rsLast = r.rsTotals.length ? r.rsTotals[r.rsTotals.length - 1] : null;
  const rsTercapai =
    rsLast && r.target != null ? rsLast.hasil >= r.target : null;

  return (
    <div className="space-y-5">
      {/* Pemilih indikator */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Detail per Indikator</h2>
          <p className="text-sm text-slate-500">Format sesuai Laporan Mutu — diagram per unit & tren capaian.</p>
        </div>
        <select
          value={sel}
          onChange={(e) => setSel(Number(e.target.value))}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
        >
          {reports.map((x) => (
            <option key={x.id} value={x.id}>
              {x.nomor ? `${x.nomor}. ` : ""}{x.nama}
            </option>
          ))}
        </select>
      </div>

      {/* ---- Capaian RS Keseluruhan (Σnum ÷ Σden × 100), seperti kotak R/S laporan ---- */}
      {rsLast && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Capaian RS Keseluruhan — {rsLast.label}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Σ Numerator ÷ Σ Denominator × 100 (gabungan seluruh unit)
              </p>
            </div>
            {rsTercapai != null && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  rsTercapai ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {rsTercapai ? "Tercapai" : "Belum Tercapai"}
                {r.target != null ? ` (target ${r.target}${sat})` : ""}
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Numerator</p>
              <p className="mt-0.5 text-2xl font-extrabold text-slate-800">{rsLast.num}</p>
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Denumerator</p>
              <p className="mt-0.5 text-2xl font-extrabold text-slate-800">{rsLast.den}</p>
            </div>
            <div className="rounded-xl bg-brand-600 p-3 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-50/80">Hasil</p>
              <p className="mt-0.5 text-2xl font-extrabold">{rsLast.hasil}{sat}</p>
            </div>
          </div>
        </div>
      )}

      {/* ---- Diagram 1: Bar berkelompok per unit × bulan ---- */}
      <div className={card}>
        <h3 className="mb-1 text-center text-sm font-bold text-slate-700">{r.nama} — per Unit</h3>
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={r.grid} margin={{ top: 10, right: 10, left: -10, bottom: 50 }} barGap={2} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="unit" tick={{ fontSize: 10 }} stroke="#94a3b8" interval={0} angle={-35} textAnchor="end" height={60} />
              <YAxis domain={[0, 120]} ticks={[0, 20, 40, 60, 80, 100, 120]} unit="%" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip formatter={(v: number) => [`${v}${sat}`, ""]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {r.months.map((m, i) => (
                <Bar key={m} dataKey={m} name={m} fill={MONTH_COLORS[i % MONTH_COLORS.length]} radius={[2, 2, 0, 0]} maxBarSize={40} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabel: baris = bulan, kolom = unit */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="border border-slate-200 px-2 py-1.5 text-left font-semibold">Bulan</th>
                {r.units.map((u) => (
                  <th key={u} className="border border-slate-200 px-2 py-1.5 text-center font-semibold">{u}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.months.map((m) => (
                <tr key={m}>
                  <td className="border border-slate-200 px-2 py-1.5 font-medium text-slate-600">{m}</td>
                  {r.units.map((u) => {
                    const row = r.grid.find((g) => g.unit === u);
                    const v = row ? row[m] : null;
                    return (
                      <td key={u} className="border border-slate-200 px-2 py-1.5 text-center text-slate-700">
                        {v == null ? "–" : `${v}${sat}`}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Diagram 2: Garis Capaian vs Target antar-bulan ---- */}
      <div className={card}>
        <h3 className="mb-1 text-center text-sm font-bold text-slate-700">{r.nama} — Capaian vs Target</h3>
        {r.line.length >= 2 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={r.line} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip formatter={(v: number) => [`${v}${sat}`, ""]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="capaian" name="Capaian" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }}>
                  <LabelList dataKey="capaian" position="top" offset={10} style={{ fontSize: 10, fontWeight: 600, fill: "#2563eb" }} formatter={(v: number) => (v == null ? "" : `${v}${sat}`)} />
                </Line>
                {hasTarget && (
                  <Line type="monotone" dataKey="target" name="Target" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }}>
                    <LabelList dataKey="target" position="bottom" offset={10} style={{ fontSize: 10, fill: "#dc2626" }} formatter={(v: number) => (v == null ? "" : `${v}${sat}`)} />
                  </Line>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-44 flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Capaian {r.line[0]?.label ?? "periode ini"}
            </span>
            <div className="mt-1 flex items-end gap-3">
              <span className="text-5xl font-extrabold text-blue-600">{r.line[0]?.capaian ?? 0}{sat}</span>
              <span className="mb-1 text-sm font-medium text-red-500">target {r.line[0]?.target ?? "–"}{r.line[0]?.target != null ? sat : ""}</span>
            </div>
            <p className="mt-3 max-w-xs text-xs text-slate-400">Grafik garis tren muncul otomatis setelah ada ≥2 bulan data.</p>
          </div>
        )}

        {/* Tabel: baris Capaian/Target, kolom = bulan */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="border border-slate-200 px-2 py-1.5 text-left font-semibold">Indikator</th>
                {r.line.map((p) => (
                  <th key={p.label} className="border border-slate-200 px-2 py-1.5 text-center font-semibold">{p.label}</th>
                ))}
                <th className="border border-slate-200 bg-slate-100 px-2 py-1.5 text-center font-semibold">Nilai Rata-Rata</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-200 px-2 py-1.5 font-medium text-blue-600">Capaian</td>
                {r.line.map((p) => (
                  <td key={p.label} className="border border-slate-200 px-2 py-1.5 text-center font-semibold text-slate-700">{p.capaian}{sat}</td>
                ))}
                <td className="border border-slate-200 bg-blue-50 px-2 py-1.5 text-center font-bold text-blue-700">{avgCapaian == null ? "–" : `${avgCapaian}${sat}`}</td>
              </tr>
              <tr>
                <td className="border border-slate-200 px-2 py-1.5 font-medium text-red-500">Target</td>
                {r.line.map((p) => (
                  <td key={p.label} className="border border-slate-200 px-2 py-1.5 text-center text-slate-500">{p.target == null ? "–" : `${p.target}${sat}`}</td>
                ))}
                <td className="border border-slate-200 bg-slate-50 px-2 py-1.5 text-center font-semibold text-slate-600">{avgTarget == null ? "–" : `${avgTarget}${sat}`}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-500">Capaian (per bulan)</span> = Σ numerator ÷ Σ denominator × 100.{" "}
          <span className="font-semibold text-slate-500">Nilai Rata-Rata</span> = rata-rata capaian per bulan = (jumlah capaian semua bulan) ÷ (banyaknya bulan). Contoh: (60% + 71% + 98% + 95%) ÷ 4 = 81%.
        </p>
      </div>
    </div>
  );
}
