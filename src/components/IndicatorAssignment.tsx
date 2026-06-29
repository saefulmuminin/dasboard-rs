"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { showError, showToast } from "@/lib/swal";

export type AssignInd = { id: number; nomor: number | null; nama: string };
export type AssignUnit = { id: number; nama: string };
export type AssignRow = { indicator_id: number; unit_id: number };

export default function IndicatorAssignment({
  indicators,
  units,
  initial,
}: {
  indicators: AssignInd[];
  units: AssignUnit[];
  initial: AssignRow[];
}) {
  const supabase = createClient();
  const [map, setMap] = useState<Record<number, number[]>>(() => {
    const m: Record<number, number[]> = {};
    for (const a of initial) (m[a.indicator_id] ??= []).push(a.unit_id);
    return m;
  });

  const unitName = (id: number) => units.find((u) => u.id === id)?.nama ?? `#${id}`;

  async function addUnit(indId: number, unitId: number) {
    if (!unitId || (map[indId] ?? []).includes(unitId)) return;
    const { error } = await supabase.from("indicator_units").insert({ indicator_id: indId, unit_id: unitId });
    if (error) { showError("Gagal", error.message); return; }
    setMap((m) => ({ ...m, [indId]: [...(m[indId] ?? []), unitId] }));
    showToast("success", "Indikator dikhususkan ke unit");
  }

  async function removeUnit(indId: number, unitId: number) {
    const { error } = await supabase.from("indicator_units").delete().eq("indicator_id", indId).eq("unit_id", unitId);
    if (error) { showError("Gagal", error.message); return; }
    setMap((m) => ({ ...m, [indId]: (m[indId] ?? []).filter((x) => x !== unitId) }));
    showToast("success", "Penugasan dihapus");
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-400">
              <th className="px-5 py-4 w-12 text-center">No.</th>
              <th className="px-5 py-4">Indikator</th>
              <th className="px-5 py-4">Khusus Untuk Unit <span className="normal-case font-medium text-slate-300">(kosong = semua unit)</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {indicators.map((it) => {
              const assigned = map[it.id] ?? [];
              const avail = units.filter((u) => !assigned.includes(u.id));
              return (
                <tr key={it.id} className="hover:bg-slate-50/50 align-top">
                  <td className="px-5 py-3 text-center font-bold text-slate-400">{it.nomor ?? "•"}</td>
                  <td className="px-5 py-3 font-semibold text-slate-700">{it.nama}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {assigned.length === 0 ? (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">Umum (semua unit)</span>
                      ) : (
                        assigned.map((uid) => (
                          <span key={uid} className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200/50">
                            {unitName(uid)}
                            <button
                              type="button"
                              onClick={() => removeUnit(it.id, uid)}
                              className="text-brand-400 hover:text-red-500"
                              title="Hapus penugasan"
                            >
                              ✕
                            </button>
                          </span>
                        ))
                      )}
                      <select
                        value=""
                        onChange={(e) => { addUnit(it.id, Number(e.target.value)); e.currentTarget.value = ""; }}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 outline-none focus:border-brand-500"
                      >
                        <option value="">+ tetapkan unit khusus</option>
                        {avail.map((u) => (
                          <option key={u.id} value={u.id}>{u.nama}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
