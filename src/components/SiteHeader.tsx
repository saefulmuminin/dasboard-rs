"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SITE } from "@/lib/site";

const NAV = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang Kami" },
  { href: "/kontak", label: "Kontak" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100/80">
      <div className="mx-auto max-w-5xl px-5 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-102">
          <div>
            <p className="font-extrabold text-brand-700 leading-tight">{SITE.nama}</p>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase leading-tight">{SITE.rs}</p>
          </div>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                isActive(n.href)
                  ? "text-brand-700 bg-brand-50"
                  : "text-slate-500 hover:text-brand-700 hover:bg-slate-50"
              }`}
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="ml-3 rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/10 transition hover:bg-brand-700 hover:shadow-brand-700/20 active:scale-[0.98]"
          >
            Login
          </Link>
        </nav>

        {/* Tombol menu mobile */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden rounded-xl p-2.5 text-slate-500 hover:bg-slate-150 border border-slate-100 transition-colors"
          aria-label="Menu"
        >
          {open ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Nav mobile */}
      {open && (
        <nav className="md:hidden border-t border-slate-100 bg-white/95 px-5 py-3 space-y-2 shadow-inner">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                isActive(n.href)
                  ? "text-brand-700 bg-brand-50"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="block rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white text-center shadow-md shadow-brand-600/10"
          >
            Login
          </Link>
        </nav>
      )}
    </header>
  );
}
