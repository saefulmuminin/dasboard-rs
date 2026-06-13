"use client";

import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, LineChart, Line, ReferenceLine,
} from "recharts";

export type IndPoint = {
  label: string; nama: string; capaian: number | null;
  target: number | null; tercapai: boolean | null;
};
export type UnitPoint = { nama: string; capaian: number };
export type TrendPoint = { label: string; capaian: number };
export type StatusDist = { tercapai: number; belum: number; tanpaTarget: number; tanpaData: number };

const card = "rounded-2xl border border-slate-100 bg-white p-5 shadow-sm";
const title = "text-sm font-bold text-slate-700 mb-4";

function barColor(d: IndPoint) {
  if (d.capaian == null) return "#cbd5e1"; // belum ada data
  if (d.tercapai == null) return "#f59e0b"; // ada data, belum ada target
  return d.tercapai ? "#16a34a" : "#dc2626"; // tercapai / belum
}

export default function MonitoringCharts({
  perIndikator, perUnit, trend, status,
}: {
  perIndikator: IndPoint[];
  perUnit: UnitPoint[];
  trend: TrendPoint[];
  status: StatusDist;
}) {
  const indData = perIndikator.map((d) => ({ ...d, value: d.capaian ?? 0 }));
  const legend = [
    { name: "Tercapai", value: status.tercapai, fill: "#16a34a" },
    { name: "Belum tercapai", value: status.belum, fill: "#dc2626" },
    { name: "Belum ada target", value: status.tanpaTarget, fill: "#f59e0b" },
    { name: "Belum ada data", value: status.tanpaData, fill: "#cbd5e1" },
  ];
  const pieData = legend.filter((d) => d.value > 0);
  const totalInd = legend.reduce((s, l) => s + l.value, 0);
  const unitHeight = Math.max(260, perUnit.length * 26);

  return (
    <div className="space-y-6">
      {/* Capaian per indikator */}
      <div className={card}>
        <h3 className={title}>Capaian per Indikator (warna = status vs target)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={indData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" interval={0} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                formatter={(v: number) => [`${v}%`, "Capaian"]}
                labelFormatter={(_l, p) => (p?.[0]?.payload as IndPoint | undefined)?.nama ?? ""}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={42}>
                {indData.map((d, i) => (
                  <Cell key={i} fill={barColor(d)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-green-600" /> Tercapai</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-600" /> Belum tercapai</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-500" /> Belum ada target</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-slate-300" /> Belum ada data</span>
        </div>
      </div>

      {/* Donut status + Tren bulanan */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={card}>
          <h3 className={title}>Status Pencapaian Indikator</h3>
          <p className="-mt-3 mb-4 text-xs text-slate-400">
            Dari {totalInd} indikator: berapa yang capaiannya sudah memenuhi target.
          </p>
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <div className="relative h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={80} paddingAngle={2} stroke="none">
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-800">{totalInd}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Indikator</span>
              </div>
            </div>
            <ul className="w-full space-y-2">
              {legend.map((l) => (
                <li key={l.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-3 w-3 rounded-sm" style={{ background: l.fill }} />
                    {l.name}
                  </span>
                  <span className="text-sm font-bold text-slate-800">{l.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={card}>
          <h3 className={title}>Tren Capaian Rata-rata Bulanan</h3>
          {trend.length >= 2 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Capaian"]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="2 2" />
                  <Line type="monotone" dataKey="capaian" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 4, fill: "#0d9488" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Capaian {trend[0]?.label ?? "periode ini"}
              </span>
              <span className="mt-1 text-5xl font-extrabold text-brand-700">{trend[0]?.capaian ?? 0}%</span>
              <p className="mt-4 max-w-xs text-xs text-slate-400">
                Grafik garis tren muncul otomatis setelah ada minimal <strong>2 bulan</strong> data yang disetujui.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Capaian per unit */}
      <div className={card}>
        <h3 className={title}>Capaian per Unit (rata-rata seluruh indikator)</h3>
        <div className="w-full" style={{ height: unitHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perUnit} layout="vertical" margin={{ top: 0, right: 24, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis type="category" dataKey="nama" width={110} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip formatter={(v: number) => [`${v}%`, "Capaian"]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="capaian" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {perUnit.map((u, i) => (
                  <Cell key={i} fill={u.capaian >= 80 ? "#0d9488" : u.capaian >= 60 ? "#f59e0b" : "#dc2626"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-brand-600" /> ≥80%</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-500" /> 60–79%</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-600" /> &lt;60%</span>
        </div>
      </div>
    </div>
  );
}
