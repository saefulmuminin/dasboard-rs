import { requireMutu } from "@/lib/auth";
import IndikatorManager, { type Ind } from "@/components/IndikatorManager";
import IndicatorAssignment, {
  type AssignInd,
  type AssignUnit,
  type AssignRow,
} from "@/components/IndicatorAssignment";

export const dynamic = "force-dynamic";

export default async function KelolaIndikatorPage() {
  const { supabase } = await requireMutu();

  const [{ data: inds }, { data: unitsData }, iu] = await Promise.all([
    supabase.from("indicators").select("id, nomor, nama, satuan, target, aktif").order("nomor", { ascending: true }),
    supabase.from("units").select("id, nama").eq("aktif", true).order("nama"),
    supabase.from("indicator_units").select("indicator_id, unit_id"),
  ]);

  const indikator = (inds as Ind[]) ?? [];
  const assigns = iu.error ? [] : ((iu.data as AssignRow[]) ?? []);

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Kelola Indikator Mutu</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Kelola parameter indikator mutu pelayanan rumah sakit, atur target pencapaian, serta kelola status aktifnya.
          </p>
        </div>
        <IndikatorManager initial={indikator} />
      </div>

      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Penugasan Indikator Khusus</h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Tetapkan indikator yang <strong>hanya diisi unit tertentu</strong> (mis. Formularium Nasional &rarr; Farmasi). Indikator tanpa penugasan otomatis muncul untuk <strong>semua unit</strong>.
        </p>
        {iu.error ? (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 text-sm text-amber-800 leading-relaxed">
            <p className="font-semibold text-amber-900">Fitur penugasan belum aktif</p>
            <p className="mt-1">Jalankan <code>supabase/migration_indicator_units.sql</code> di Supabase &rarr; SQL Editor, lalu muat ulang halaman ini.</p>
          </div>
        ) : (
          <div className="mt-3">
            <IndicatorAssignment
              indicators={indikator as AssignInd[]}
              units={(unitsData as AssignUnit[]) ?? []}
              initial={assigns}
            />
          </div>
        )}
      </div>
    </div>
  );
}
