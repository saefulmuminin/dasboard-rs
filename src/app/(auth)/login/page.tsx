import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "@/components/LoginForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: `Login — ${SITE.nama}` };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Kalau sudah login, lempar ke dashboard.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Kolom kiri: Form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Masuk Akun</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              Sistem pelaporan internal petugas unit &amp; Tim Mutu {SITE.rs}.
            </p>
          </div>

          <LoginForm />

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand-600"
          >
            <span>←</span>
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>

      {/* Kolom kanan: Gambar / panel brand (sembunyi di layar kecil) */}
      <div className="relative hidden overflow-hidden lg:block">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/login_hero.png')" }}
        />
        {/* Teal transparent overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/70 via-brand-700/60 to-brand-800/75" />

        <div className="relative flex h-full flex-col items-center justify-center px-12 text-center text-white z-10">
          <h2 className="text-3xl font-bold tracking-tight">{SITE.nama}</h2>
          <p className="mt-2 text-lg font-medium text-slate-200">{SITE.rs}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-350">
            Pelaporan &amp; monitoring indikator mutu pelayanan rumah sakit secara
            terpusat dan real-time.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { v: "18", l: "Indikator" },
              { v: "26", l: "Unit" },
              { v: "100%", l: "Digital" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur-md">
                <p className="text-2xl font-extrabold">{s.v}</p>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-300">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
