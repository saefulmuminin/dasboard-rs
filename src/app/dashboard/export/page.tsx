import { requireMutu } from "@/lib/auth";
import LaporanExport, { type ExpInd, type ExpUnit } from "@/components/LaporanExport";

export const dynamic = "force-dynamic";

export default async function ExportLaporanPage() {
  const { supabase } = await requireMutu();

  const [{ data: inds }, { data: units }] = await Promise.all([
    supabase.from("indicators").select("id, nomor, nama, satuan, target").eq("aktif", true).order("nomor", { ascending: true }),
    supabase.from("units").select("id, nama").order("nama", { ascending: true }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Export Laporan Mutu</h1>
        <p className="mt-1 text-sm text-slate-500">
          Unduh rekap indikator mutu per bulan (format resmi: unit sebagai kolom, baris Numerator/Denumerator/Hasil) dalam Excel atau PDF.
        </p>
      </div>
      <LaporanExport indikators={(inds as ExpInd[]) ?? []} units={(units as ExpUnit[]) ?? []} />
    </div>
  );
}
