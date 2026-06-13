import { requireMutu } from "@/lib/auth";
import IndikatorManager, { type Ind } from "@/components/IndikatorManager";

export const dynamic = "force-dynamic";

export default async function KelolaIndikatorPage() {
  const { supabase } = await requireMutu();
  const { data } = await supabase
    .from("indicators")
    .select("id, nomor, nama, satuan, target, aktif")
    .order("nomor", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Kelola Indikator Mutu</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Kelola parameter indikator mutu pelayanan rumah sakit, atur target pencapaian, serta kelola status aktifnya.
        </p>
      </div>
      <IndikatorManager initial={(data as Ind[]) ?? []} />
    </div>
  );
}
