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

  const { data } = await supabase
    .from("indicators")
    .select("id, nomor, nama, satuan, target")
    .eq("aktif", true)
    .order("nomor", { ascending: true });

  const indikators = (data as IndikatorOpt[]) ?? [];

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
