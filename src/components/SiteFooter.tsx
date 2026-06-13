import { SITE, waLink } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-100 bg-white mt-auto">
      <div className="mx-auto max-w-5xl px-5 py-10 grid gap-8 sm:grid-cols-3">
        <div className="space-y-2.5">
          <p className="font-extrabold text-brand-700 leading-tight">{SITE.nama}</p>
          <p className="text-xs font-semibold text-slate-400 leading-relaxed max-w-xs">
            Sistem informasi transparansi pelaporan & monitoring indikator mutu pelayanan kesehatan pada {SITE.rs}.
          </p>
        </div>
        <div className="text-xs text-slate-500 space-y-2">
          <p className="font-bold text-slate-800 uppercase tracking-wider">Kontak Instansi</p>
          <p className="font-medium leading-relaxed">{SITE.alamat}</p>
          <p className="font-semibold text-brand-600">{SITE.email}</p>
        </div>
        <div className="sm:text-right flex sm:flex-col sm:justify-between sm:items-end gap-4">
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/10 transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            <span>💬</span>
            <span>Hubungi Tim Mutu (WhatsApp)</span>
          </a>
        </div>
      </div>
      <div className="border-t border-slate-100/60 bg-slate-50/50">
        <div className="mx-auto max-w-5xl px-5 py-4 flex flex-col sm:flex-row sm:justify-between gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>© {new Date().getFullYear()} Tim Mutu {SITE.rs}. Semua Hak Dilindungi.</span>
          <span>Transparan · Akuntabel · Profesional</span>
        </div>
      </div>
    </footer>
  );
}
