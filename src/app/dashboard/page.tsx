import Link from "next/link";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* ---------- Ikon ---------- */
const I = {
  clock: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  check: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  trend: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8m0 0h-5m5 0v5" /></svg>
  ),
  clipboard: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
  ),
  building: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
  ),
  users: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
  ),
  x: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  doc: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  ),
  stack: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
  ),
};

type Tone = "amber" | "green" | "brand" | "blue" | "purple" | "red" | "slate";
const TONE: Record<Tone, { bg: string; fg: string; val: string }> = {
  amber: { bg: "bg-amber-50", fg: "text-amber-600", val: "text-amber-600" },
  green: { bg: "bg-green-50", fg: "text-green-600", val: "text-green-600" },
  brand: { bg: "bg-brand-50", fg: "text-brand-600", val: "text-brand-700" },
  blue: { bg: "bg-blue-50", fg: "text-blue-600", val: "text-blue-700" },
  purple: { bg: "bg-purple-50", fg: "text-purple-600", val: "text-purple-700" },
  red: { bg: "bg-red-50", fg: "text-red-600", val: "text-red-600" },
  slate: { bg: "bg-slate-100", fg: "text-slate-500", val: "text-slate-800" },
};

function StatCard({
  label, value, icon, tone = "slate", href,
}: {
  label: string; value: number | string; icon: React.ReactNode; tone?: Tone; href?: string;
}) {
  const t = TONE[tone];
  const inner = (
    <div className="group h-full rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.bg} ${t.fg}`}>{icon}</span>
        {href && (
          <svg className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
      <p className={`mt-4 text-3xl font-extrabold ${t.val}`}>{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
    </div>
  );
  return href ? <Link href={href} className="block outline-none">{inner}</Link> : inner;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export default async function DashboardHome() {
  const { supabase, user, profile } = await getSession();
  const role = profile?.role ?? "unit";

  /* ============== TIM MUTU ============== */
  if (role === "mutu") {
    const [pending, approvedRows, indikator, unit, pengguna] = await Promise.all([
      supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "submitted"),
      supabase.from("reports").select("numerator, denominator").eq("status", "approved"),
      supabase.from("indicators").select("id", { count: "exact", head: true }).eq("aktif", true),
      supabase.from("units").select("id", { count: "exact", head: true }).eq("aktif", true),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    const appRows = (approvedRows.data as { numerator: number; denominator: number }[]) ?? [];
    const gNum = appRows.reduce((s, r) => s + (Number(r.numerator) || 0), 0);
    const gDen = appRows.reduce((s, r) => s + (Number(r.denominator) || 0), 0);
    const capaian = gDen > 0 ? r2((gNum / gDen) * 100) : 0;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Dashboard Tim Mutu</h1>
          <p className="mt-1 text-sm text-slate-500">Ringkasan pelaporan dan indikator mutu pelayanan rumah sakit.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Menunggu Verifikasi" value={pending.count ?? 0} icon={I.clock} tone="amber" href="/dashboard/verifikasi" />
          <StatCard label="Laporan Disetujui" value={appRows.length} icon={I.check} tone="green" />
          <StatCard label="Capaian Keseluruhan" value={`${capaian}%`} icon={I.trend} tone="brand" href="/dashboard/monitoring" />
          <StatCard label="Indikator Aktif" value={indikator.count ?? 0} icon={I.clipboard} tone="blue" href="/dashboard/indikator" />
          <StatCard label="Unit Aktif" value={unit.count ?? 0} icon={I.building} tone="purple" href="/dashboard/unit" />
          <StatCard label="Total Pengguna" value={pengguna.count ?? 0} icon={I.users} tone="slate" href="/dashboard/pengguna" />
        </div>

        <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-brand-600 to-brand-700 p-6 shadow-sm">
          <h2 className="text-base font-bold text-white">Aksi Cepat Admin</h2>
          <p className="mt-0.5 text-sm text-brand-50/90">Proses data dengan cepat lewat pintasan berikut.</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link href="/dashboard/verifikasi" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50 active:scale-[0.98]">
              Verifikasi Laporan ({pending.count ?? 0})
            </Link>
            <Link href="/dashboard/monitoring" className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/25 active:scale-[0.98]">
              Lihat Grafik Monitoring
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ============== PETUGAS UNIT ============== */
  const unitId = profile?.unit_id ?? null;
  let unitNama = "";
  const counts = { draft: 0, submitted: 0, approved: 0, rejected: 0 };
  let total = 0;
  let capaianUnit = 0;

  if (unitId) {
    const [u, all] = await Promise.all([
      supabase.from("units").select("nama").eq("id", unitId).maybeSingle(),
      supabase.from("reports").select("status, numerator, denominator").eq("unit_id", unitId),
    ]);
    unitNama = (u.data?.nama as string) ?? "";
    const rows = (all.data as { status: keyof typeof counts; numerator: number; denominator: number }[]) ?? [];
    total = rows.length;
    let n = 0, d = 0;
    for (const r of rows) {
      if (r.status in counts) counts[r.status]++;
      if (r.status === "approved") { n += Number(r.numerator) || 0; d += Number(r.denominator) || 0; }
    }
    capaianUnit = d > 0 ? r2((n / d) * 100) : 0;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Selamat datang{profile?.nama ? `, ${profile.nama}` : ""}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {unitId ? <>Unit Pelayanan: <strong>{unitNama}</strong></> : "Status Unit Anda belum ditetapkan."}
          <span className="mx-2 text-slate-300">•</span>
          <span>{user?.email}</span>
        </p>
      </div>

      {!unitId ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 text-sm shadow-sm">
          <p className="font-bold text-amber-900">Unit Belum Ditetapkan</p>
          <p className="mt-1 text-amber-800">
            Akun Anda belum ditautkan ke unit/ruangan oleh administrator. Hubungi Tim Mutu untuk menetapkan unit sebelum dapat menginput laporan.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="Capaian Keseluruhan" value={`${capaianUnit}%`} icon={I.trend} tone="brand" />
            <StatCard label="Total Laporan" value={total} icon={I.stack} tone="blue" href="/dashboard/laporan" />
            <StatCard label="Disetujui" value={counts.approved} icon={I.check} tone="green" href="/dashboard/laporan" />
            <StatCard label="Menunggu Verifikasi" value={counts.submitted} icon={I.clock} tone="amber" href="/dashboard/laporan" />
            <StatCard label="Draft" value={counts.draft} icon={I.doc} tone="slate" href="/dashboard/laporan" />
            <StatCard label="Ditolak / Perbaikan" value={counts.rejected} icon={I.x} tone="red" href="/dashboard/laporan" />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-brand-600 to-brand-700 p-6 shadow-sm">
            <h2 className="text-base font-bold text-white">Menu Cepat Laporan</h2>
            <p className="mt-0.5 text-sm text-brand-50/90">Mulai mengisi capaian atau periksa status pengajuan Anda.</p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link href="/dashboard/laporan/baru" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50 active:scale-[0.98]">
                + Input Laporan Baru
              </Link>
              <Link href="/dashboard/laporan" className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/25 active:scale-[0.98]">
                Lihat Semua Laporan Saya
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
