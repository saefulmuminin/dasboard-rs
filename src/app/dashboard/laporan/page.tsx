import Link from "next/link";
import { getSession } from "@/lib/auth";
import LaporanSayaList from "@/components/LaporanSayaList";

export const dynamic = "force-dynamic";

type Row = {
  id: number;
  tahun: number;
  bulan: number;
  hasil: number;
  status: "draft" | "submitted" | "approved" | "rejected";
  indicators: { nomor: number | null; nama: string; satuan: string } | null;
};

export default async function LaporanSayaPage() {
  const { supabase, profile } = await getSession();
  const unitId = profile?.unit_id ?? null;

  if (!unitId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 text-sm text-amber-800 shadow-sm leading-relaxed">
        <p className="font-bold text-amber-900">Unit Belum Ditentukan</p>
        <p className="mt-1">
          Unit pelayanan Anda belum diatur oleh administrator. Hubungi <strong>Tim Mutu</strong> untuk mengaktifkan akun unit Anda agar dapat menginput data.
        </p>
      </div>
    );
  }

  const { data } = await supabase
    .from("reports")
    .select("id, tahun, bulan, hasil, status, indicators(nomor, nama, satuan)")
    .eq("unit_id", unitId)
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false });

  const rows = (data as unknown as Row[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Laporan Saya</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Daftar pengajuan laporan indikator mutu unit pelayanan Anda.
          </p>
        </div>
        <Link
          href="/dashboard/laporan/baru"
          className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/10 transition hover:bg-brand-700 hover:shadow-brand-700/20 active:scale-[0.98] shrink-0"
        >
          + Input Laporan Baru
        </Link>
      </div>

      <LaporanSayaList initialRows={rows} />
    </div>
  );
}
