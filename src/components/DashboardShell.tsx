"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/actions";
import { SITE } from "@/lib/site";
import type { Role } from "@/lib/auth";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const HomeIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const EditIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const LaporanIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const VerifyIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const IndikatorIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const UnitIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const PenggunaIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const NAV_UNIT: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <HomeIcon /> },
  { href: "/dashboard/laporan/baru", label: "Input Laporan", icon: <EditIcon /> },
  { href: "/dashboard/laporan", label: "Laporan Saya", icon: <LaporanIcon /> },
];

const NAV_MUTU: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <HomeIcon /> },
  { href: "/dashboard/verifikasi", label: "Verifikasi", icon: <VerifyIcon /> },
  { href: "/dashboard/monitoring", label: "Monitoring", icon: <ChartIcon /> },
  { href: "/dashboard/indikator", label: "Kelola Indikator", icon: <IndikatorIcon /> },
  { href: "/dashboard/unit", label: "Kelola Unit", icon: <UnitIcon /> },
  { href: "/dashboard/pengguna", label: "Kelola Pengguna", icon: <PenggunaIcon /> },
];

export default function DashboardShell({
  role,
  nama,
  email,
  children,
}: {
  role: Role;
  nama: string;
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = role === "mutu" ? NAV_MUTU : NAV_UNIT;
  const isActive = (href: string) => pathname === href;
  const pageTitle = nav.find((n) => n.href === pathname)?.label ?? "Dashboard";
  const inisial = (nama || email || "?").charAt(0).toUpperCase();
  const tahun = new Date().getFullYear();

  const NavLinks = () => (
    <nav className="space-y-1.5">
      {nav.map((n) => {
        const active = isActive(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              active
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className={`${active ? "text-white" : "text-white/80"}`}>
              {n.icon}
            </span>
            <span>{n.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row">
      {/* Topbar mobile */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 md:hidden sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <span className="font-bold text-brand-700 block leading-tight">{SITE.nama}</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">{SITE.rs}</span>
          </div>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 border border-slate-100 transition-colors"
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

      {/* Sidebar Container */}
      <aside
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-40 w-72 bg-brand-700 border-r border-brand-800/40 p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:w-68 md:h-screen md:sticky md:top-0`}
      >
        <div className="space-y-6">
          {/* Logo Brand */}
          <div className="hidden items-center gap-3 pb-2 md:flex">
            <div>
              <p className="font-bold text-white leading-tight">{SITE.nama}</p>
              <p className="text-[10px] font-bold text-white/60 tracking-wider uppercase leading-tight">{SITE.rs}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <NavLinks />
        </div>

        {/* User Info & Footer */}
        <div className="border-t border-white/15 pt-5 mt-5 space-y-4">
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="truncate text-sm font-semibold text-white">{nama || "Petugas RS"}</p>
            <p className="truncate text-xs text-white/60 font-medium mt-0.5">{email}</p>
            <div className="mt-2.5">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                role === "mutu" 
                  ? "bg-white/20 text-white border border-white/30"
                  : "bg-white/10 text-white/80 border border-white/20"
              }`}>
                {role === "mutu" ? "Tim Mutu" : "Unit Pelapor"}
              </span>
            </div>
          </div>
          <form action={signOut}>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20 hover:text-white active:scale-[0.98]">
              <svg className="h-4 w-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Keluar</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Overlay background for mobile drawer */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main Column: Header + Content + Footer */}
      <div className="flex flex-1 flex-col min-h-screen max-w-full">
        {/* Header (desktop) */}
        <header className="hidden md:flex sticky top-0 z-20 items-center justify-between border-b border-slate-100 bg-white/80 px-8 py-4 backdrop-blur">
          <div>
            <h2 className="font-bold text-slate-800 leading-tight">{pageTitle}</h2>
            <p className="text-xs font-medium text-slate-400">
              {SITE.nama} · {SITE.rs}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700 leading-tight">
                {nama || "Petugas RS"}
              </p>
              <span
                className={`text-[10px] font-bold uppercase tracking-wide ${
                  role === "mutu" ? "text-teal-600" : "text-slate-400"
                }`}
              >
                {role === "mutu" ? "Tim Mutu" : "Unit Pelapor"}
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {inisial}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 sm:p-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-100 bg-white px-5 py-4 sm:px-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-1 sm:flex-row">
            <p className="text-xs text-slate-400">
              © {tahun} Tim Mutu {SITE.rs}. Semua hak dilindungi.
            </p>
            <p className="text-xs text-slate-400">
              {SITE.nama} — Sistem Monitoring Indikator Mutu
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
