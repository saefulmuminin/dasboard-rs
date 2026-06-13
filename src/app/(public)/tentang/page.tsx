import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Tentang Kami — ${SITE.nama}`,
};

const MISI = [
  "Menyelenggarakan pelayanan kesehatan yang bermutu dan berorientasi pada keselamatan pasien.",
  "Meningkatkan kompetensi sumber daya manusia secara berkelanjutan.",
  "Melaksanakan monitoring dan evaluasi mutu pelayanan secara berkala.",
  "Membangun budaya mutu di seluruh unit pelayanan.",
];

const TIM = [
  { nama: "dr. RSUD Sofifi", jabatan: "Ketua Tim Mutu", inisial: "K" },
  { nama: "Staf Tim Mutu", jabatan: "Sekretaris", inisial: "S" },
  { nama: "Pelaksana Mutu", jabatan: "Anggota", inisial: "A" },
];

export default function TentangPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-16 sm:py-24 space-y-12">
      <div className="text-center sm:text-left mb-12">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">Tentang Kami</h1>
        <p className="mt-3 text-base sm:text-lg text-slate-500 font-medium">
          Profil singkat dan komitmen peningkatan mutu pelayanan {SITE.rs}.
        </p>
      </div>

      {/* Profil */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm space-y-5">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Profil Rumah Sakit</h2>
        <div className="space-y-4 text-slate-600 leading-relaxed font-medium">
          <p>
            {SITE.rs} senantiasa berkomitmen untuk menyajikan pelayanan kesehatan terbaik, aman, bermutu tinggi, serta dapat dijangkau oleh seluruh kalangan masyarakat luas.
          </p>
          <p>
            Melalui platform inovasi <strong>{SITE.nama}</strong>, sistem pencatatan dan evaluasi indikator mutu pelayanan kami publikasikan secara transparan. Hal ini merupakan bagian dari upaya perbaikan berkelanjutan demi kepuasan dan keselamatan pasien.
          </p>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="grid gap-8 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Visi Kami</h2>
          <p className="text-xl font-bold text-slate-800 leading-snug italic">
            &ldquo;Menjadi rumah sakit dengan pelayanan bermutu dan menjadi kebanggaan masyarakat.&rdquo;
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Misi Kami</h2>
          <ul className="space-y-4">
            {MISI.map((m, i) => (
              <li key={i} className="flex gap-4 text-slate-600 font-medium leading-relaxed">
                <span className="text-slate-300 font-black">—</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tim Mutu */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm space-y-8">
        <div className="text-center sm:text-left">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Struktur Komite Mutu</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {TIM.map((t, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1 hover:bg-white hover:border-slate-200"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-white text-xl font-black shadow-md">
                {t.inisial}
              </div>
              <h3 className="mt-5 font-bold text-slate-900">{t.nama}</h3>
              <p className="text-sm font-semibold text-slate-500 mt-1">{t.jabatan}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
