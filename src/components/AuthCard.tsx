import Link from "next/link";

// Kartu terpusat untuk halaman auth sederhana (lupa/reset password).
export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50/50 px-4 py-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[30%] -left-[10%] h-[70%] w-[50%] rounded-full bg-brand-100/40 blur-[100px]" />
        <div className="absolute -bottom-[30%] -right-[10%] h-[70%] w-[50%] rounded-full bg-teal-100/30 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="w-full rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-xl shadow-slate-100/60 backdrop-blur-md">
          {children}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand-600"
          >
            <span>←</span>
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
