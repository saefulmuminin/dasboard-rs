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

  const { data } = await supabase
    .from("indicators")
    .select("id, nomor, nama, satuan, target")
    .eq("aktif", true)
    .order("nomor", { ascending: true });

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
          indikators={(data as IndikatorOpt[]) ?? []}
          unitId={unitId}
          userId={user!.id}
          initial={rep as LaporanInitial}
        />
      </div>
    </div>
  );
}
