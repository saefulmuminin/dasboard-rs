"use client";

import { useEffect, useState } from "react";
import XLSX from "xlsx-js-style";
import { createClient } from "@/lib/supabase/client";
import { showError } from "@/lib/swal";
import { SITE, NAMA_BULAN } from "@/lib/site";
import { rsOfficial } from "@/lib/rsOfficialTotals";

export type ExpInd = { id: number; nomor: number | null; nama: string; satuan: string; target: number | null };
export type ExpUnit = { id: number; nama: string };
type Rep = { indicator_id: number; unit_id: number; numerator: number; denominator: number; status: string };

type Cell = { num: number; den: number };
type Block = {
  nomor: number | null;
  nama: string;
  cols: { id: number; nama: string }[];
  cell: Map<number, Cell>;
  total: Cell;
  hasData: boolean;
};
type Meta = { tahun: number; bulan: number; hanyaApproved: boolean };

const THIS_YEAR = 2026; // fallback; diganti oleh periode terbaru saat mount
const pctInt = (c: Cell) => (c.den > 0 ? Math.round((c.num / c.den) * 100) : null);
const esc = (s: string) =>
  s.replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m] as string));

export default function LaporanExport({ indikators, units }: { indikators: ExpInd[]; units: ExpUnit[] }) {
  const supabase = createClient();
  const unitName = new Map(units.map((u) => [u.id, u.nama]));

  // Filter aktif (bisa diubah user) — TERPISAH dari periode yang benar-benar dimuat.
  const [tahun, setTahun] = useState<number>(THIS_YEAR);
  const [bulan, setBulan] = useState<number>(5);
  const [hanyaApproved, setHanyaApproved] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  // Data yang sudah dimuat + periode/status-nya (sumber kebenaran untuk label & export).
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);

  function buildBlocks(reps: Rep[], ty: number, bl: number, appr: boolean): Block[] {
    const byInd = new Map<number, Rep[]>();
    for (const r of reps) {
      const a = byInd.get(r.indicator_id) ?? [];
      a.push(r);
      byInd.set(r.indicator_id, a);
    }
    return indikators.map((ind) => {
      const rs = byInd.get(ind.id) ?? [];
      const cell = new Map<number, Cell>();
      for (const r of rs) {
        const c = cell.get(r.unit_id) ?? { num: 0, den: 0 };
        c.num += Number(r.numerator) || 0;
        c.den += Number(r.denominator) || 0;
        cell.set(r.unit_id, c);
      }
      const cols = [...cell.keys()]
        .map((id) => ({ id, nama: unitName.get(id) ?? `Unit ${id}` }))
        .sort((a, b) => a.nama.localeCompare(b.nama, "id"));
      let num = 0;
      let den = 0;
      for (const c of cell.values()) {
        num += c.num;
        den += c.den;
      }
      // Total resmi RS (rsOfficial) HANYA dipakai pada mode "disetujui", karena
      // angka resmi itu berbasis data terverifikasi. Jika menyertakan data belum
      // diverifikasi, pakai jumlah per-unit apa adanya agar kolom & total konsisten.
      const off = appr ? rsOfficial(ind.nomor, ty, bl) : null;
      const total = off ? { num: off.num, den: off.den } : { num, den };
      return { nomor: ind.nomor, nama: ind.nama, cols, cell, total, hasData: cols.length > 0 };
    });
  }

  async function tampilkan(ty: number, bl: number, appr: boolean) {
    setLoading(true);
    let q = supabase
      .from("reports")
      .select("indicator_id, unit_id, numerator, denominator, status")
      .eq("tahun", ty)
      .eq("bulan", bl);
    q = appr ? q.eq("status", "approved") : q.in("status", ["submitted", "approved"]);
    const { data, error } = await q;
    setLoading(false);
    if (error) {
      showError("Gagal Memuat", error.message);
      return;
    }
    setBlocks(buildBlocks((data as Rep[]) ?? [], ty, bl, appr));
    setMeta({ tahun: ty, bulan: bl, hanyaApproved: appr });
  }

  // Saat mount: pakai periode terbaru yang punya data DISETUJUI (sesuai default
  // toggle) agar tampilan awal tidak kosong; jika belum ada approved sama sekali,
  // pakai periode terbaru apa pun.
  useEffect(() => {
    (async () => {
      const appr = await supabase
        .from("reports")
        .select("tahun, bulan")
        .eq("status", "approved")
        .order("tahun", { ascending: false })
        .order("bulan", { ascending: false })
        .limit(1);
      let y = appr.data?.[0]?.tahun as number | undefined;
      let m = appr.data?.[0]?.bulan as number | undefined;
      if (y == null) {
        const any = await supabase
          .from("reports")
          .select("tahun, bulan")
          .order("tahun", { ascending: false })
          .order("bulan", { ascending: false })
          .limit(1);
        y = any.data?.[0]?.tahun as number | undefined;
        m = any.data?.[0]?.bulan as number | undefined;
      }
      const ty = y ?? THIS_YEAR;
      const bl = m ?? 5;
      setTahun(ty);
      setBulan(bl);
      await tampilkan(ty, bl, true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adaData = blocks.some((b) => b.hasData);
  // Label & filename SELALU dari periode yang dimuat (meta), bukan filter live.
  const sBulan = meta?.bulan ?? bulan;
  const sTahun = meta?.tahun ?? tahun;
  const sAppr = meta?.hanyaApproved ?? hanyaApproved;
  const periodeLabel = `${NAMA_BULAN[sBulan]} ${sTahun}`;
  const scopeLabel = sAppr ? " (data disetujui)" : " (termasuk belum diverifikasi)";
  const dirty = meta != null && (meta.bulan !== bulan || meta.tahun !== tahun || meta.hanyaApproved !== hanyaApproved);

  // ---------- Export XLSX ----------
  function exportXlsx() {
    const B = { style: "thin", color: { rgb: "94A3B8" } };
    const border = { top: B, bottom: B, left: B, right: B };
    const stTitle = { font: { bold: true, sz: 13, color: { rgb: "0F172A" } } };
    const stSub = { font: { sz: 10, italic: true, color: { rgb: "475569" } } };
    const stIndTitle = { font: { bold: true, sz: 11, color: { rgb: "0F766E" } } };
    const stNote = { font: { sz: 10, italic: true, color: { rgb: "94A3B8" } } };
    const stHeader = { font: { bold: true, sz: 10 }, alignment: { horizontal: "center", vertical: "center" }, fill: { fgColor: { rgb: "E2E8F0" } }, border };
    const stTotalHead = { font: { bold: true, sz: 10, color: { rgb: "FFFFFF" } }, alignment: { horizontal: "center" }, fill: { fgColor: { rgb: "0D9488" } }, border };
    const stLabel = { font: { bold: true, sz: 10 }, alignment: { horizontal: "left" }, border };
    const stCell = { font: { sz: 10 }, alignment: { horizontal: "center" }, border };
    const stHasil = { font: { bold: true, sz: 10 }, alignment: { horizontal: "center" }, border };
    const stTotalCell = { font: { bold: true, sz: 10 }, alignment: { horizontal: "center" }, fill: { fgColor: { rgb: "CCFBF1" } }, border };

    const ws: Record<string, unknown> = {};
    let R = 0;
    let maxC = 6;
    const merges: unknown[] = [];
    const put = (r: number, c: number, v: unknown, t: string, s: unknown) => {
      ws[XLSX.utils.encode_cell({ r, c })] = { v, t, s };
      if (c > maxC) maxC = c;
    };

    put(R, 0, `LAPORAN DATA MUTU — ${SITE.rs}`, "s", stTitle);
    merges.push({ s: { r: R, c: 0 }, e: { r: R, c: 6 } });
    R++;
    put(R, 0, `Periode: ${periodeLabel}${scopeLabel}`, "s", stSub);
    merges.push({ s: { r: R, c: 0 }, e: { r: R, c: 6 } });
    R += 2;

    for (const b of blocks) {
      put(R, 0, `${b.nomor ?? "•"}. ${b.nama}`, "s", stIndTitle);
      merges.push({ s: { r: R, c: 0 }, e: { r: R, c: Math.max(2, b.cols.length + 1) } });
      R++;
      if (!b.hasData) {
        put(R, 0, "Belum ada data untuk periode ini", "s", stNote);
        R += 2;
        continue;
      }
      put(R, 0, "", "s", stHeader);
      b.cols.forEach((u, i) => put(R, i + 1, u.nama, "s", stHeader));
      put(R, b.cols.length + 1, "Total RS", "s", stTotalHead);
      R++;
      put(R, 0, "Numerator", "s", stLabel);
      b.cols.forEach((u, i) => put(R, i + 1, b.cell.get(u.id)!.num, "n", stCell));
      put(R, b.cols.length + 1, b.total.num, "n", stTotalCell);
      R++;
      put(R, 0, "Denumerator", "s", stLabel);
      b.cols.forEach((u, i) => put(R, i + 1, b.cell.get(u.id)!.den, "n", stCell));
      put(R, b.cols.length + 1, b.total.den, "n", stTotalCell);
      R++;
      put(R, 0, "Hasil", "s", stLabel);
      b.cols.forEach((u, i) => {
        const c = b.cell.get(u.id)!;
        if (c.den > 0) put(R, i + 1, c.num / c.den, "n", { ...stHasil, numFmt: "0%" });
        else put(R, i + 1, "—", "s", stHasil);
      });
      if (b.total.den > 0) put(R, b.cols.length + 1, b.total.num / b.total.den, "n", { ...stTotalCell, numFmt: "0%" });
      else put(R, b.cols.length + 1, "—", "s", stTotalCell);
      R += 2;
    }

    ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: R, c: maxC } });
    ws["!cols"] = Array.from({ length: maxC + 1 }, (_, i) => ({ wch: i === 0 ? 14 : 12 }));
    ws["!merges"] = merges;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Mutu");
    XLSX.writeFile(wb, `Laporan-Mutu-${NAMA_BULAN[sBulan]}-${sTahun}.xlsx`);
  }

  // ---------- Export PDF (buka jendela cetak) ----------
  function exportPdf() {
    const body = blocks
      .map((b) => {
        const title = `<h3>${b.nomor ?? "•"}. ${esc(b.nama)}</h3>`;
        if (!b.hasData) return `${title}<p class="note">Belum ada data untuk periode ini</p>`;
        const th = b.cols.map((u) => `<th>${esc(u.nama)}</th>`).join("");
        const num = b.cols.map((u) => `<td>${b.cell.get(u.id)!.num}</td>`).join("");
        const den = b.cols.map((u) => `<td>${b.cell.get(u.id)!.den}</td>`).join("");
        const has = b.cols
          .map((u) => {
            const p = pctInt(b.cell.get(u.id)!);
            return `<td>${p == null ? "—" : p + "%"}</td>`;
          })
          .join("");
        const tp = pctInt(b.total);
        return `${title}<table>
          <thead><tr><th class="c0"></th>${th}<th class="tot">Total RS</th></tr></thead>
          <tbody>
            <tr><td class="lbl">Numerator</td>${num}<td class="tot">${b.total.num}</td></tr>
            <tr><td class="lbl">Denumerator</td>${den}<td class="tot">${b.total.den}</td></tr>
            <tr><td class="lbl">Hasil</td>${has}<td class="tot">${tp == null ? "—" : tp + "%"}</td></tr>
          </tbody></table>`;
      })
      .join("");

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Laporan Mutu ${esc(periodeLabel)}</title>
      <style>
        @page { size: A4 landscape; margin: 10mm; }
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #0f172a; font-size: 9px; margin: 0; }
        h1 { font-size: 15px; margin: 0 0 2px; }
        .sub { color: #475569; font-style: italic; margin: 0 0 14px; }
        h3 { font-size: 10px; margin: 12px 0 4px; color: #0f766e; page-break-after: avoid; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 6px; page-break-inside: avoid; table-layout: auto; }
        th, td { border: 1px solid #94a3b8; padding: 2px 4px; text-align: center; word-break: break-word; }
        th { background: #e2e8f0; font-weight: 700; }
        td.lbl, .c0 { text-align: left; font-weight: 700; background: #f8fafc; white-space: nowrap; }
        th.tot, td.tot { background: #ccfbf1; font-weight: 700; }
        .note { color: #94a3b8; font-style: italic; margin: 2px 0 8px; }
      </style></head><body>
      <h1>LAPORAN DATA MUTU — ${esc(SITE.rs)}</h1>
      <p class="sub">Periode: ${esc(periodeLabel)}${scopeLabel}</p>
      ${body}
      <script>window.onload=function(){window.print();}</script>
      </body></html>`;

    const w = window.open("", "_blank");
    if (!w) {
      showError("Popup Diblokir", "Izinkan popup untuk mencetak/menyimpan PDF, lalu coba lagi.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  const inp = "rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-white";

  return (
    <div className="space-y-6">
      {/* Panel filter + aksi */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Bulan</label>
            <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className={inp}>
              {NAMA_BULAN.map((n, i) => (i === 0 ? null : <option key={i} value={i}>{n}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Tahun</label>
            <input
              type="number"
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value) || THIS_YEAR)}
              className={`${inp} w-24`}
            />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm text-slate-600">
            <input type="checkbox" checked={hanyaApproved} onChange={(e) => setHanyaApproved(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
            Hanya data disetujui
          </label>
          <button
            onClick={() => tampilkan(tahun, bulan, hanyaApproved)}
            disabled={loading}
            className={`rounded-lg px-5 py-2 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-60 ${dirty ? "bg-brand-600 hover:bg-brand-700 ring-2 ring-brand-300 ring-offset-1" : "bg-slate-800 hover:bg-slate-900"}`}
          >
            {loading ? "Memuat..." : dirty ? "Tampilkan (filter berubah)" : "Tampilkan"}
          </button>
          <div className="ml-auto flex gap-2">
            <button
              onClick={exportXlsx}
              disabled={!adaData}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-[0.98] disabled:opacity-40"
            >
              ⬇ Export Excel
            </button>
            <button
              onClick={exportPdf}
              disabled={!adaData}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-40"
            >
              ⬇ Export PDF
            </button>
          </div>
        </div>
        {dirty && (
          <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
            Filter telah diubah. Klik <strong>Tampilkan</strong> untuk memuat data periode baru. (Laporan & export saat ini masih untuk <strong>{periodeLabel}</strong>.)
          </p>
        )}
        {meta != null && !adaData && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Tidak ada data untuk <strong>{periodeLabel}</strong>
            {sAppr ? " pada status disetujui. Hilangkan centang “Hanya data disetujui” lalu klik Tampilkan untuk melihat data yang masih diproses." : "."}
          </p>
        )}
      </div>

      {/* Preview */}
      {meta != null && adaData && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-800">Laporan Data Mutu — {SITE.rs}</h2>
            <p className="text-sm italic text-slate-500">Periode: {periodeLabel}{scopeLabel}</p>
          </div>
          <div className="space-y-6">
            {blocks.filter((b) => b.hasData).map((b, idx) => (
              <div key={idx}>
                <h3 className="mb-1.5 text-sm font-bold text-brand-700">{b.nomor ?? "•"}. {b.nama}</h3>
                <div className="overflow-x-auto">
                  <table className="border-collapse text-xs">
                    <thead>
                      <tr>
                        <th className="border border-slate-300 bg-slate-100 px-2 py-1"></th>
                        {b.cols.map((u) => (
                          <th key={u.id} className="border border-slate-300 bg-slate-100 px-2 py-1 font-semibold text-slate-700">{u.nama}</th>
                        ))}
                        <th className="border border-slate-300 bg-brand-100 px-2 py-1 font-bold text-brand-800">Total RS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 bg-slate-50 px-2 py-1 font-bold text-slate-600">Numerator</td>
                        {b.cols.map((u) => (
                          <td key={u.id} className="border border-slate-300 px-2 py-1 text-center">{b.cell.get(u.id)!.num}</td>
                        ))}
                        <td className="border border-slate-300 bg-brand-50 px-2 py-1 text-center font-bold">{b.total.num}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 bg-slate-50 px-2 py-1 font-bold text-slate-600">Denumerator</td>
                        {b.cols.map((u) => (
                          <td key={u.id} className="border border-slate-300 px-2 py-1 text-center">{b.cell.get(u.id)!.den}</td>
                        ))}
                        <td className="border border-slate-300 bg-brand-50 px-2 py-1 text-center font-bold">{b.total.den}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 bg-slate-50 px-2 py-1 font-bold text-slate-600">Hasil</td>
                        {b.cols.map((u) => {
                          const p = pctInt(b.cell.get(u.id)!);
                          return <td key={u.id} className="border border-slate-300 px-2 py-1 text-center font-semibold">{p == null ? "—" : `${p}%`}</td>;
                        })}
                        <td className="border border-slate-300 bg-brand-50 px-2 py-1 text-center font-bold">{pctInt(b.total) == null ? "—" : `${pctInt(b.total)}%`}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
