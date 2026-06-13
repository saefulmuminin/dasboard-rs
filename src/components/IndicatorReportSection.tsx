"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, LabelList,
} from "recharts";

export type GridRow = Record<string, number | string | null>; // { unit, [bulanLabel]: capaian }
export type LinePoint = { label: string; capaian: number; target: number | null };

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
      </div>
    </div>
  );
}
