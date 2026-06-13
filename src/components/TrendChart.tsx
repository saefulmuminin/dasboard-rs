"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

export type TrendPoint = {
  label: string;
  capaian: number;
};

export default function TrendChart({
  data,
  target,
  satuan = "%",
}: {
  data: TrendPoint[];
  target: number | null;
  satuan?: string;
}) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 text-sm">
        Belum ada data capaian yang disetujui untuk indikator ini.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#94a3b8"
            domain={[0, 100]}
            unit={satuan}
          />
          <Tooltip
            formatter={(v: number) => [`${v}${satuan}`, "Capaian"]}
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="capaian"
            name="Capaian"
            fill="#0d9488"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
          {target != null && (
            <ReferenceLine
              y={target}
              stroke="#dc2626"
              strokeDasharray="4 4"
              label={{
                value: `Target ${target}${satuan}`,
                position: "right",
                fill: "#dc2626",
                fontSize: 11,
              }}
            />
          )}
          {/* garis bantu tren */}
          <Line
            type="monotone"
            dataKey="capaian"
            name="Tren"
            stroke="#0f766e"
            strokeWidth={2}
            dot={{ r: 3 }}
            legendType="none"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
