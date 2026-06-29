import { getSession } from "@/lib/auth";
import LaporanForm, { type IndikatorOpt } from "@/components/LaporanForm";

export const dynamic = "force-dynamic";

export default async function InputLaporanPage() {
  const { supabase, user, profile } = await getSession();
  const unitId = profile?.unit_id ?? null;

  if (!unitId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 text-sm text-amber-800 shadow-sm leading-relaxed">
        <p className="font-bold text-amber-900">Unit Belum Ditentukan</p>
        <p className="mt-1">
          Unit pelayanan Anda belum diatur oleh administrator. Hubungi <strong>Tim Mutu</strong> untuk menetapkan unit sebelum mengisi laporan.
        </p>
      </div>
    );
  }

  const [{ data }, iu] = await Promise.all([
    supabase.from("indicators").select("id, nomor, nama, satuan, target").eq("aktif", true).order("nomor", { ascending: true }),
    supabase.from("indicator_units").select("indicator_id, unit_id"),
  ]);

  // Indikator "khusus" hanya muncul untuk unit penanggungjawabnya; tanpa penugasan = umum (semua unit).
  const assignedUnits = new Map<number, Set<number>>();
  if (!iu.error) {
    for (const a of (iu.data as { indicator_id: number; unit_id: number }[]) ?? []) {
      if (!assignedUnits.has(a.indicator_id)) assignedUnits.set(a.indicator_id, new Set());
      assignedUnits.get(a.indicator_id)!.add(a.unit_id);
    }
  }
  const indikators = ((data as IndikatorOpt[]) ?? []).filter((i) => {
    const units = assignedUnits.get(i.id);
    return !units || units.size === 0 || units.has(unitId);
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Input Laporan Baru</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Masukkan capaian bulanan numerator dan denominator dari indikator mutu pelayanan unit Anda.
        </p>
      </div>
      <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
        <LaporanForm
          mode="baru"
          indikators={indikators}
          unitId={unitId}
          userId={user!.id}
        />
      </div>
    </div>
  );
}
