import Link from "next/link";
import { requireMutu } from "@/lib/auth";
import { NAMA_BULAN } from "@/lib/site";
import MonitoringCharts, {
  type IndPoint, type UnitPoint, type TrendPoint,
} from "@/components/MonitoringCharts";
import IndicatorReportSection, { type IndReport } from "@/components/IndicatorReportSection";

export const dynamic = "force-dynamic";

type Indikator = { id: number; nomor: number | null; nama: string; satuan: string; target: number | null };
type Rep = { indicator_id: number; unit_id: number; tahun: number; bulan: number; numerator: number; denominator: number };

const r2 = (n: number) => Math.round(n * 100) / 100;

export default async function MonitoringPage() {
  const { supabase } = await requireMutu();

  const [{ data: indData }, { data: repData }, { data: unitData }] = await Promise.all([
    supabase.from("indicators").select("id, nomor, nama, satuan, target").eq("aktif", true).order("nomor"),
    supabase.from("reports").select("indicator_id, unit_id, tahun, bulan, numerator, denominator").eq("status", "approved"),
    supabase.from("units").select("id, nama"),
  ]);

  const indikators = (indData as Indikator[]) ?? [];
  const reports = (repData as Rep[]) ?? [];
  const unitName = new Map(((unitData as { id: number; nama: string }[]) ?? []).map((u) => [u.id, u.nama]));

  // --- per indikator: capaian periode terbaru ---
  const byInd = new Map<number, Rep[]>();
  for (const r of reports) {
    const a = byInd.get(r.indicator_id) ?? [];
    a.push(r); byInd.set(r.indicator_id, a);
  }
  const perIndCalc = indikators.map((ind) => {
    const rs = byInd.get(ind.id) ?? [];
    let capaian: number | null = null;
    if (rs.length) {
      const maxKey = Math.max(...rs.map((r) => r.tahun * 100 + r.bulan));
      const latest = rs.filter((r) => r.tahun * 100 + r.bulan === maxKey);
      const num = latest.reduce((s, r) => s + (Number(r.numerator) || 0), 0);
      const den = latest.reduce((s, r) => s + (Number(r.denominator) || 0), 0);
      capaian = den > 0 ? r2((num / den) * 100) : 0;
    }
    const tercapai = capaian != null && ind.target != null ? capaian >= ind.target : null;
    return { ind, capaian, tercapai };
  });

  const perIndikator: IndPoint[] = perIndCalc.map((r) => ({
    label: `#${r.ind.nomor ?? r.ind.id}`, nama: r.ind.nama,
    capaian: r.capaian, target: r.ind.target, tercapai: r.tercapai,
  }));

  const status = {
    tercapai: perIndCalc.filter((r) => r.tercapai === true).length,
    belum: perIndCalc.filter((r) => r.tercapai === false).length,
    tanpaTarget: perIndCalc.filter((r) => r.capaian != null && r.ind.target == null).length,
    tanpaData: perIndCalc.filter((r) => r.capaian == null).length,
  };

  // --- per unit: Σnum/Σden ---
  const byUnit = new Map<number, { num: number; den: number }>();
  for (const r of reports) {
    const a = byUnit.get(r.unit_id) ?? { num: 0, den: 0 };
    a.num += Number(r.numerator) || 0; a.den += Number(r.denominator) || 0;
    byUnit.set(r.unit_id, a);
  }
  const perUnit: UnitPoint[] = [...byUnit.entries()]
    .map(([uid, v]) => ({ nama: unitName.get(uid) ?? `Unit ${uid}`, capaian: v.den > 0 ? r2((v.num / v.den) * 100) : 0 }))
    .sort((a, b) => b.capaian - a.capaian);

  // --- tren bulanan ---
  const byMonth = new Map<number, { tahun: number; bulan: number; num: number; den: number }>();
  for (const r of reports) {
    const key = r.tahun * 100 + r.bulan;
    const a = byMonth.get(key) ?? { tahun: r.tahun, bulan: r.bulan, num: 0, den: 0 };
    a.num += Number(r.numerator) || 0; a.den += Number(r.denominator) || 0;
    byMonth.set(key, a);
  }
  const trend: TrendPoint[] = [...byMonth.values()]
    .sort((a, b) => a.tahun - b.tahun || a.bulan - b.bulan)
    .map((m) => ({ label: `${NAMA_BULAN[m.bulan]?.slice(0, 3)} ${m.tahun}`, capaian: m.den > 0 ? r2((m.num / m.den) * 100) : 0 }));

  // --- per indikator: data lengkap untuk diagram laporan (unit x bulan + capaian/target) ---
  const multiYear = new Set(reports.map((r) => r.tahun)).size > 1;
  const mlabel = (t: number, b: number) =>
    multiYear ? `${NAMA_BULAN[b]?.slice(0, 3)} ${t}` : (NAMA_BULAN[b] ?? `${b}`);

  const indReports: IndReport[] = indikators
    .filter((ind) => (byInd.get(ind.id)?.length ?? 0) > 0)
    .map((ind) => {
      const rs = byInd.get(ind.id)!;
      const monthKeys = [...new Set(rs.map((r) => r.tahun * 100 + r.bulan))].sort((a, b) => a - b);
      const months = monthKeys.map((k) => mlabel(Math.floor(k / 100), k % 100));
      const unitList = [...new Set(rs.map((r) => r.unit_id))]
        .map((id) => ({ id, nama: unitName.get(id) ?? `Unit ${id}` }))
        .sort((a, b) => a.nama.localeCompare(b.nama, "id"));
      const units = unitList.map((u) => u.nama);

      const grid = unitList.map((u) => {
        const row: Record<string, number | string | null> = { unit: u.nama };
        for (const k of monthKeys) {
          const rep = rs.find((r) => r.unit_id === u.id && r.tahun * 100 + r.bulan === k);
          row[mlabel(Math.floor(k / 100), k % 100)] = rep
            ? (Number(rep.denominator) > 0 ? r2((Number(rep.numerator) / Number(rep.denominator)) * 100) : 0)
            : null;
        }
        return row;
      });

      const line = monthKeys.map((k) => {
        const mr = rs.filter((r) => r.tahun * 100 + r.bulan === k);
        const num = mr.reduce((s, r) => s + (Number(r.numerator) || 0), 0);
        const den = mr.reduce((s, r) => s + (Number(r.denominator) || 0), 0);
        return { label: mlabel(Math.floor(k / 100), k % 100), capaian: den > 0 ? r2((num / den) * 100) : 0, target: ind.target };
      });

      return { id: ind.id, nomor: ind.nomor, nama: ind.nama, satuan: ind.satuan, target: ind.target, months, units, grid, line };
    });

  // --- KPI ---
  const gNum = reports.reduce((s, r) => s + (Number(r.numerator) || 0), 0);
  const gDen = reports.reduce((s, r) => s + (Number(r.denominator) || 0), 0);
  const avgCapaian = gDen > 0 ? r2((gNum / gDen) * 100) : 0;
  const unitMelapor = new Set(reports.map((r) => r.unit_id)).size;
  const indikatorDataAda = perIndCalc.filter((r) => r.capaian != null).length;
  const adaData = reports.length > 0;

  const kpis = [
    { label: "Capaian Keseluruhan", value: `${avgCapaian}%`, tone: "brand" },
    { label: "Indikator Tercapai", value: status.tercapai, tone: "green" },
    { label: "Belum Tercapai", value: status.belum, tone: "red" },
    { label: "Indikator Terpantau", value: `${indikatorDataAda}/${indikators.length}`, tone: "slate" },
    { label: "Unit Melapor", value: unitMelapor, tone: "slate" },
    { label: "Total Laporan", value: reports.length, tone: "slate" },
  ];
  const toneCls: Record<string, string> = {
    brand: "text-brand-700", green: "text-green-600", red: "text-red-600", slate: "text-slate-800",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Monitoring Mutu</h1>
      <p className="mt-1 text-sm text-slate-500">
        Ringkasan capaian indikator mutu (data yang sudah disetujui).
      </p>

      {!adaData ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
          Belum ada laporan yang disetujui. Dashboard akan terisi setelah verifikasi.
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-6">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-400">{k.label}</p>
                <p className={`mt-1 text-2xl font-bold ${toneCls[k.tone]}`}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Charts agregat */}
          <div className="mt-6">
            <MonitoringCharts perIndikator={perIndikator} perUnit={perUnit} trend={trend} status={status} />
          </div>

          {/* Detail per indikator — format Laporan Mutu */}
          <div className="mt-8">
            <IndicatorReportSection reports={indReports} />
          </div>

          {/* Tabel detail */}
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Indikator</th>
                  <th className="px-4 py-3 text-right">Capaian</th>
                  <th className="px-4 py-3 text-right">Target</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {perIndCalc.map(({ ind, capaian, tercapai }) => (
                  <tr key={ind.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-400">{ind.nomor}</td>
                    <td className="px-4 py-3">
                      <Link href={`/indikator/${ind.id}`} className="font-medium text-slate-700 hover:text-brand-700 hover:underline">
                        {ind.nama}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      {capaian != null ? `${capaian}${ind.satuan}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      {ind.target != null ? `${ind.target}${ind.satuan}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {tercapai == null ? (
                        <span className="text-slate-300">—</span>
                      ) : tercapai ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Tercapai</span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Belum</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
