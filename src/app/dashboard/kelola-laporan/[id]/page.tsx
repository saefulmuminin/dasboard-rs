import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMutu } from "@/lib/auth";
import { NAMA_BULAN, fmtWaktu } from "@/lib/site";

export const dynamic = "force-dynamic";

type Rep = {
  id: number;
  tahun: number;
  bulan: number;
  numerator: number;
  denominator: number;
  hasil: number;
  status: string;
  nama_pengisi: string | null;
  analisa: string | null;
  rtl: string | null;
  bukti_url: string | null;
  submitted_at?: string | null;
  indicators: { nomor: number | null; nama: string; satuan: string; target: number | null } | null;
  units: { nama: string } | null;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  submitted: "Menunggu Verifikasi",
  approved: "Disetujui",
  rejected: "Ditolak",
};
const STATUS_CLS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default async function DetailLaporanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reportId = Number(id);
  if (!Number.isInteger(reportId)) notFound();

  const { supabase } = await requireMutu();

  const base =
    "id, tahun, bulan, numerator, denominator, hasil, status, nama_pengisi, analisa, rtl, bukti_url, indicators(nomor,nama,satuan,target), units(nama)";
  // Coba dengan submitted_at; fallback bila kolom belum ada (migrasi belum jalan).
  let res = await supabase.from("reports").select(`${base}, submitted_at`).eq("id", reportId).maybeSingle();
  if (res.error) res = await supabase.from("reports").select(base).eq("id", reportId).maybeSingle();

  const rep = res.data as unknown as Rep | null;
  if (!rep) notFound();

  let buktiUrl: string | null = null;
  if (rep.bukti_url) {
    const { data } = await supabase.storage.from("bukti").createSignedUrl(rep.bukti_url, 3600);
    buktiUrl = data?.signedUrl ?? null;
  }

  const sat = rep.indicators?.satuan ?? "%";
  const item = (label: string, value: React.ReactNode) => (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-700">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/dashboard/kelola-laporan" className="text-sm font-semibold text-brand-600 hover:underline">
          ← Kembali ke Kelola Laporan
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Detail Laporan</h1>
      </div>

      {/* Ringkasan */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-semibold text-slate-400">{rep.units?.nama ?? "-"}</span>
            <h2 className="mt-1 text-lg font-bold text-slate-800 leading-snug">
              {rep.indicators?.nomor ? `${rep.indicators.nomor}. ` : ""}
              {rep.indicators?.nama ?? "-"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">Periode: {NAMA_BULAN[rep.bulan]} {rep.tahun}</p>
          </div>
          <div className="sm:text-right shrink-0">
            <p className="text-3xl font-extrabold text-slate-800">
              {rep.hasil}
              <span className="text-base font-medium ml-0.5">{sat}</span>
            </p>
            <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLS[rep.status] ?? "bg-slate-100 text-slate-600"}`}>
              {STATUS_LABEL[rep.status] ?? rep.status}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {item("Numerator", rep.numerator)}
          {item("Denominator", rep.denominator)}
          {item("Pengisi Laporan", rep.nama_pengisi || "—")}
          {item("Waktu Dikirim", fmtWaktu(rep.submitted_at))}
          {rep.indicators?.target != null && item("Target", `${rep.indicators.target}${sat}`)}
        </div>
      </div>

      {/* Analisa & RTL */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Analisa Capaian</p>
          <p className="mt-1 whitespace-pre-wrap leading-relaxed text-slate-700">{rep.analisa || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Rencana Tindak Lanjut (RTL)</p>
          <p className="mt-1 whitespace-pre-wrap leading-relaxed text-slate-700">{rep.rtl || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bukti Dukung</p>
          <div className="mt-2">
            {rep.bukti_url ? (
              buktiUrl ? (
                <div className="space-y-2">
                  <iframe
                    src={buktiUrl}
                    title="Bukti Dukung"
                    className="h-[600px] w-full rounded-lg border border-slate-200 bg-slate-50"
                  />
                  <a href={buktiUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-semibold text-brand-600 hover:underline">
                    Buka di tab baru / Unduh ↗
                  </a>
                </div>
              ) : (
                <span className="text-sm italic text-slate-400">Bukti ada, tetapi tautan gagal dibuat (cek bucket Storage).</span>
              )
            ) : (
              <span className="text-sm italic text-slate-400">Tidak ada lampiran</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
