import { requireMutu } from "@/lib/auth";
import UnitManager, { type Unit } from "@/components/UnitManager";

export const dynamic = "force-dynamic";

export default async function KelolaUnitPage() {
  const { supabase } = await requireMutu();
  const { data } = await supabase
    .from("units")
    .select("id, nama, aktif")
    .order("nama", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Kelola Unit / Ruangan</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Daftar dan kelola status keaktifan unit pelayanan yang berkewajiban melaporkan indikator mutu pelayanan.
        </p>
      </div>
      <UnitManager initial={(data as Unit[]) ?? []} />
    </div>
  );
}
