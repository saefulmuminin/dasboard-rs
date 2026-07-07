"use client";

import { usePathname, useRouter } from "next/navigation";
import { NAMA_BULAN } from "@/lib/site";

// Filter periode untuk Monitoring. `allPeriods` & `selected` berupa key tahun*100+bulan.
export default function PeriodFilter({
  allPeriods,
  selected,
}: {
  allPeriods: number[];
  selected: number[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const selSet = new Set(selected);
  const label = (k: number) => `${NAMA_BULAN[k % 100]} ${Math.floor(k / 100)}`;

  const apply = (arr: number[]) => {
    const sorted = [...new Set(arr)].sort((a, b) => b - a);
    router.push(sorted.length ? `${pathname}?periods=${sorted.join(",")}` : pathname);
  };
  const toggle = (k: number) => {
    const next = selSet.has(k) ? selected.filter((x) => x !== k) : [...selected, k];
    if (next.length) apply(next); // minimal 1 periode
  };

  const allSelected = selected.length === allPeriods.length && allPeriods.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Periode</span>
      <span className="text-[11px] text-slate-300">(klik untuk pilih 1 / beberapa bulan)</span>
      <div className="flex flex-wrap gap-1.5">
        {allPeriods.map((k) => {
          const on = selSet.has(k);
          return (
            <button
              key={k}
              onClick={() => toggle(k)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition active:scale-[0.98] ${
                on
                  ? "bg-brand-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label(k)}
            </button>
          );
        })}
      </div>
      <div className="ml-auto flex gap-1.5">
        <button
          onClick={() => apply(allPeriods)}
          disabled={allSelected}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
        >
          Semua
        </button>
        <button
          onClick={() => allPeriods[0] != null && apply([allPeriods[0]])}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Bulan Terbaru
        </button>
      </div>
    </div>
  );
}
