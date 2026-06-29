import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import LaporanForm, {
  type IndikatorOpt,
  type LaporanInitial,
} from "@/components/LaporanForm";

export const dynamic = "force-dynamic";

export default async function EditLaporanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reportId = Number(id);
  if (!Number.isInteger(reportId)) notFound();

  const { supabase, user, profile } = await getSession();
  const unitId = profile?.unit_id ?? null;

  if (!unitId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 text-sm text-amber-800 shadow-sm leading-relaxed">
        <p className="font-bold text-amber-900">Unit Belum Ditentukan</p>
        <p className="mt-1">
          Unit pelayanan Anda belum diatur oleh administrator. Hubungi <strong>Tim Mutu</strong> untuk mengaktifkan akun unit Anda.
        </p>
      </div>
    );
  }

  const { data: rep } = await supabase
    .from("reports")
    .select(
      "id, indicator_id, tahun, bulan, numerator, denominator, nama_pengisi, analisa, rtl, bukti_url, status, unit_id",
    )
    .eq("id", reportId)
    .maybeSingle();

  if (!rep || rep.unit_id !== unitId || rep.status === "approved") notFound();

  const [{ data }, iu] = await Promise.all([
    supabase.from("indicators").select("id, nomor, nama, satuan, target").eq("aktif", true).order("nomor", { ascending: true }),
    supabase.from("indicator_units").select("indicator_id, unit_id"),
  ]);

  const assignedUnits = new Map<number, Set<number>>();
  if (!iu.error) {
    for (const a of (iu.data as { indicator_id: number; unit_id: number }[]) ?? []) {
      if (!assignedUnits.has(a.indicator_id)) assignedUnits.set(a.indicator_id, new Set());
      assignedUnits.get(a.indicator_id)!.add(a.unit_id);
    }
  }
  const indikators = ((data as IndikatorOpt[]) ?? []).filter((i) => {
    const units = assignedUnits.get(i.id);
    const visible = !units || units.size === 0 || units.has(unitId);
    return visible || i.id === rep.indicator_id; // selalu sertakan indikator laporan ini
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Edit Laporan</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Ubah dan perbarui data capaian indikator mutu pelayanan unit Anda untuk periode terkait.
        </p>
      </div>
      <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
        <LaporanForm
          mode="edit"
          indikators={indikators}
          unitId={unitId}
          userId={user!.id}
          initial={rep as LaporanInitial}
        />
      </div>
    </div>
  );
}
