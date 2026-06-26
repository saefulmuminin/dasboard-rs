import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

type Indikator = {
  id: number;
  nomor: number | null;
  nama: string;
  target: number | null;
  satuan: string;
};

export default async function Home() {
  const hasEnv =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let indikator: Indikator[] = [];
  let errorMsg = "";

  if (hasEnv) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("indicators")
        .select("id, nomor, nama, target, satuan")
        .eq("aktif", true)
        .order("nomor", { ascending: true });
      if (error) errorMsg = error.message;
      else indikator = (data as Indikator[]) ?? [];
    } catch (e) {
      errorMsg =
        e instanceof Error ? e.message : "Gagal terhubung ke database.";
    }
  }

  return (
    <main className="bg-slate-50/30 min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-24 sm:py-32">
        {/* Realistic Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: "url('/rs.jpeg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

        <div className="relative mx-auto max-w-5xl px-5 text-center space-y-8 z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-200 backdrop-blur-md">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Transparansi Pelayanan Publik
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-sm">
            Pelaporan & Monitoring Indikator Mutu
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-medium drop-shadow-sm">
            Keterbukaan informasi dan publikasi berkala atas capaian indikator mutu pelayanan kesehatan nasional pada {SITE.rs}.
          </p>
          <div className="pt-6 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-slate-900 shadow-xl shadow-black/20 transition-all hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              Portal Internal Petugas
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Daftar Indikator */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Indikator Mutu Nasional (INM)
          </h2>
          <p className="mt-2 text-base text-slate-500 font-medium">
            Memantau {indikator.length} indikator aktif di lingkungan {SITE.rs}.
          </p>
        </div>

        {!hasEnv && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-700 text-sm shadow-sm leading-relaxed text-center">
            <svg className="mx-auto h-8 w-8 text-slate-400 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <strong>Sistem belum terkonfigurasi.</strong> Silakan lengkapi environment variables.
          </div>
        )}

        {hasEnv && errorMsg && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 text-sm shadow-sm leading-relaxed text-center">
            <strong>Gagal Memuat Data:</strong> {errorMsg}
          </div>
        )}

        {hasEnv && !errorMsg && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {indikator.map((it) => (
              <Link
                key={it.id}
                href={`/indikator/${it.id}`}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-300"
              >
                <div className="space-y-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 text-base font-black ring-1 ring-slate-100 shadow-sm">
                    {it.nomor ?? "•"}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-800 leading-snug group-hover:text-slate-900 transition-colors">
                      {it.nama}
                    </h3>
                    {it.target != null && (
                      <p className="text-xs font-semibold text-slate-500">
                        Target: <span className="text-slate-700 font-bold">{it.target}{it.satuan}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">
                  <span>Lihat capaian</span>
                  <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
