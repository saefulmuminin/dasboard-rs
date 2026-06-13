"use client";

import { useState } from "react";
import { SITE, waLink } from "@/lib/site";

export default function KontakPage() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [pesan, setPesan] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teks =
      `Halo Tim Mutu ${SITE.rs},\n\n` +
      `Nama: ${nama}\n` +
      `Email: ${email}\n\n` +
      `Pesan:\n${pesan}`;
    window.open(waLink(teks), "_blank", "noopener,noreferrer");
  };

  const labelCls = "block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5";
  const inputCls = "mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-850 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10";

  return (
    <main className="mx-auto max-w-4xl px-5 py-16 sm:py-24 space-y-12">
      <div className="text-center sm:text-left mb-12">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">Hubungi Kami</h1>
        <p className="mt-3 text-base sm:text-lg text-slate-500 font-medium">
          Silakan hubungi Tim Mutu {SITE.rs} untuk pertanyaan, saran, atau pelaporan kendala teknis.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-5">
        {/* Info kontak */}
        <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Kontak Resmi</h2>
            <dl className="space-y-6">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Email Korespondensi</dt>
                <dd className="mt-1.5 font-bold text-slate-800 text-sm">{SITE.email}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Alamat Instansi</dt>
                <dd className="mt-1.5 font-bold text-slate-800 text-sm leading-relaxed">{SITE.alamat}</dd>
              </div>
            </dl>
          </div>

          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-slate-900 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-slate-800 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>WhatsApp Tim Mutu</span>
          </a>
        </div>

        {/* Formulir pesan */}
        <div className="md:col-span-3 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Kirim Pesan Langsung</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelCls}>Nama Pengirim</label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className={inputCls}
                placeholder="Masukkan nama lengkap Anda"
              />
            </div>
            <div>
              <label className={labelCls}>Email Pengirim</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="nama@email.com"
              />
            </div>
            <div>
              <label className={labelCls}>Isi Pesan</label>
              <textarea
                required
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                rows={5}
                className={inputCls}
                placeholder="Tuliskan pesan Anda secara terperinci di sini..."
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-brand-600/20 transition-all hover:bg-brand-700 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Kirim ke WhatsApp
            </button>
            <p className="text-center text-xs font-semibold text-slate-400">
              Pesan Anda akan otomatis diformat dan dikirimkan melalui platform WhatsApp.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
