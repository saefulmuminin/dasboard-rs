import { requireMutu } from "@/lib/auth";
import VerifikasiList from "@/components/VerifikasiList";

export const dynamic = "force-dynamic";

type Row = {
  id: number;
  tahun: number;
  bulan: number;
  numerator: number;
  denominator: number;
  hasil: number;
  analisa: string | null;
  rtl: string | null;
  bukti_url: string | null;
  indicators: { nomor: number | null; nama: string; satuan: string; target: number | null } | null;
  units: { nama: string } | null;
};

export default async function VerifikasiPage() {
  const { supabase, user } = await requireMutu();

  const { data } = await supabase
    .from("reports")
    .select(
      "id, tahun, bulan, numerator, denominator, hasil, analisa, rtl, bukti_url, indicators(nomor, nama, satuan, target), units(nama)",
    )
    .eq("status", "submitted")
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false });

  const rows = (data as unknown as Row[]) ?? [];

  // Signed URL bukti
  const signedUrls: Record<number, string> = {};
  await Promise.all(
    rows
      .filter((r) => r.bukti_url)
      .map(async (r) => {
        const { data: s } = await supabase.storage
          .from("bukti")
          .createSignedUrl(r.bukti_url as string, 3600);
        if (s?.signedUrl) {
          signedUrls[r.id] = s.signedUrl;
        }
      }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Verifikasi Laporan</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Tinjau berkas laporan indikator mutu pelayanan yang diajukan oleh tiap unit sebelum dipublikasikan.
        </p>
      </div>

      <VerifikasiList
        initialRows={rows}
        signedUrls={signedUrls}
        userId={user.id}
      />
    </div>
  );
}
