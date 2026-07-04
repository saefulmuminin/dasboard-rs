import { requireMutu } from "@/lib/auth";
import KelolaLaporanList, { type Opt } from "@/components/KelolaLaporanList";

export const dynamic = "force-dynamic";

export default async function KelolaLaporanPage() {
  const { supabase } = await requireMutu();
  const { data: units } = await supabase.from("units").select("id, nama").order("nama", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Kelola / Hapus Laporan</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Hapus laporan yang salah (indikator/bulan keliru, atau perlu revisi meski sudah diverifikasi) agar ruangan dapat mengisi ulang.
        </p>
      </div>
      <KelolaLaporanList units={(units as Opt[]) ?? []} />
    </div>
  );
}
