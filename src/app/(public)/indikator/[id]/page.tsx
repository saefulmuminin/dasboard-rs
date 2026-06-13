import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NAMA_BULAN } from "@/lib/site";
import TrendChart, { type TrendPoint } from "@/components/TrendChart";

export const dynamic = "force-dynamic";

type Indikator = {
  id: number;
  nomor: number | null;
  nama: string;
  target: number | null;
  satuan: string;
};

type Row = {
  tahun: number;
  bulan: number;
  numerator: number;
  denominator: number;
};

export default async function DetailIndikatorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const indikatorId = Number(id);
  if (!Number.isInteger(indikatorId)) notFound();

  const supabase = await createClient();

  const { data: ind } = await supabase
    .from("indicators")
    .select("id, nomor, nama, target, satuan")
    .eq("id", indikatorId)
    .maybeSingle();

  if (!ind) notFound();
  const indikator = ind as Indikator;

  // Data approved untuk indikator ini
  const { data: rows } = await supabase
    .from("reports")
    .select("tahun, bulan, numerator, denominator")
    .eq("indicator_id", indikatorId)
    .eq("status", "approved");

  // Agregasi per (tahun, bulan): capaian = Σnumerator / Σdenominator × 100
  const map = new Map<string, { tahun: number; bulan: number; num: number; den: number }>();
  for (const r of (rows as Row[]) ?? []) {
    const key = `${r.tahun}-${r.bulan}`;
    const cur = map.get(key) ?? { tahun: r.tahun, bulan: r.bulan, num: 0, den: 0 };
    cur.num += Number(r.numerator) || 0;
    cur.den += Number(r.denominator) || 0;
    map.set(key, cur);
  }

  const agg = [...map.values()].sort(
    (a, b) => a.tahun - b.tahun || a.bulan - b.bulan,
  );

  const data: TrendPoint[] = agg.map((a) => ({
    label: `${NAMA_BULAN[a.bulan]?.slice(0, 3)} ${a.tahun}`,
    capaian: a.den > 0 ? Math.round((a.num / a.den) * 10000) / 100 : 0,
  }));

  const terkini = data.length ? data[data.length - 1] : null;
  const tercapai =
    terkini && indikator.target != null
      ? terkini.capaian >= indikator.target
      : null;

  return (
    <main className="mx-auto max-w-5xl px-5 py-16 sm:py-24 space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 hover:-translate-x-1 transition-all"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Kembali ke daftar indikator</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start gap-5">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white text-2xl font-black shadow-md">
          {indikator.nomor ?? "•"}
        </span>
        <div className="space-y-1 mt-1">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Indikator Mutu Nasional</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            {indikator.nama}
          </h1>
        </div>
      </div>

      {/* Ringkasan Capaian */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Capaian Terkini</p>
          <p className="mt-3 text-4xl font-black text-slate-900">
            {terkini ? `${terkini.capaian}${indikator.satuan}` : "—"}
          </p>
          {terkini && (
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{terkini.label}</p>
          )}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Target Standard</p>
          <p className="mt-3 text-4xl font-black text-slate-700">
            {indikator.target != null
              ? `${indikator.target}${indikator.satuan}`
              : "Belum diatur"}
          </p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Target Nasional</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Evaluasi Status</p>
          <p
            className={`mt-3 text-4xl font-black ${
              tercapai === null
                ? "text-slate-400"
                : tercapai
                  ? "text-slate-800"
                  : "text-slate-600"
            }`}
          >
            {tercapai === null ? "—" : tercapai ? "Tercapai" : "Belum Capai"}
          </p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Dibandingkan Target</p>
        </div>
      </div>

      {/* Grafik tren */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-8">
          Tren Capaian vs Target Capaian
        </h2>
        <div className="w-full">
          <TrendChart
            data={data}
            target={indikator.target}
            satuan={indikator.satuan}
          />
        </div>
      </section>

      {/* Tabel ringkas */}
      {data.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-8 pb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
              Rincian Capaian Bulanan
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-2">Data bulanan kumulatif nasional dari unit terkait.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-8 py-5">Periode</th>
                  <th className="px-8 py-5 text-right">Capaian</th>
                  <th className="px-8 py-5 text-right">Target Nasional</th>
                  <th className="px-8 py-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((d) => {
                  const ok =
                    indikator.target != null
                      ? d.capaian >= indikator.target
                      : null;

                  return (
                    <tr key={d.label} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 font-semibold text-slate-700">{d.label}</td>
                      <td className="px-8 py-4 text-right font-black text-slate-800">
                        {d.capaian}
                        <span className="text-xs font-bold text-slate-400 ml-1">{indikator.satuan}</span>
                      </td>
                      <td className="px-8 py-4 text-right font-bold text-slate-500">
                        {indikator.target ?? "—"}
                        <span className="text-xs font-bold text-slate-400 ml-1">{indikator.target != null ? indikator.satuan : ""}</span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex justify-center">
                          {ok === null ? (
                            <span className="text-slate-300 font-bold">—</span>
                          ) : ok ? (
                            <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-700 uppercase tracking-widest">
                              Tercapai
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-lg bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200">
                              Belum
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
