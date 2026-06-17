/**
 * =============================================================
 * SMART MUTU — Sinkronisasi data laporan unit ke Google Sheet
 * =============================================================
 * Menarik data LAPORAN (indikator × unit × bulan) dari Supabase
 * ke Google Sheet secara otomatis. TIDAK menyertakan data akun pengguna.
 *
 * CARA PASANG:
 *  1. Buka Google Sheet tujuan → menu Extensions → Apps Script.
 *  2. Hapus isi default, tempel SELURUH file ini.
 *  3. Isi SUPABASE_ANON_KEY di bawah (ambil dari .env: NEXT_PUBLIC_SUPABASE_ANON_KEY).
 *  4. Jalankan fungsi `syncReports` sekali → izinkan (authorize) saat diminta.
 *  5. Jalankan fungsi `pasangTriggerOtomatis` sekali → sync berjalan otomatis tiap jam.
 * =============================================================
 */

// ====== KONFIGURASI ======
const SUPABASE_URL = "https://yxirjhixzywquxweqzdv.supabase.co";
const SUPABASE_ANON_KEY = "TEMPEL_ANON_KEY_DI_SINI"; // dari .env: NEXT_PUBLIC_SUPABASE_ANON_KEY
const SHEET_NAME = "Data Mutu"; // nama tab tujuan (dibuat otomatis bila belum ada)
// Hanya data yang sudah DISETUJUI yang ditarik (sesuai keamanan/RLS).
const FILTER_STATUS = "approved";

const NAMA_BULAN = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

/** Tarik data dari Supabase lalu tulis ke sheet (timpa penuh — anti duplikat). */
function syncReports() {
  const url = SUPABASE_URL + "/rest/v1/reports"
    + "?select=tahun,bulan,numerator,denominator,hasil,status,updated_at,indicators(nomor,nama),units(nama)"
    + "&status=eq." + FILTER_STATUS
    + "&order=tahun.desc,bulan.desc";

  const res = UrlFetchApp.fetch(url, {
    method: "get",
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY },
    muteHttpExceptions: true,
  });

  if (res.getResponseCode() !== 200) {
    throw new Error("Gagal ambil data Supabase (" + res.getResponseCode() + "): " + res.getContentText());
  }

  const data = JSON.parse(res.getContentText());
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  sheet.clearContents();

  const header = ["Tahun", "Bulan", "No. Indikator", "Indikator", "Unit",
    "Numerator", "Denominator", "Hasil (%)", "Status", "Terakhir Update"];

  const rows = data.map(function (r) {
    return [
      r.tahun,
      NAMA_BULAN[r.bulan] || r.bulan,
      r.indicators ? r.indicators.nomor : "",
      r.indicators ? r.indicators.nama : "",
      r.units ? r.units.nama : "",
      Number(r.numerator),
      Number(r.denominator),
      Number(r.hasil),
      r.status,
      r.updated_at,
    ];
  });

  sheet.getRange(1, 1, 1, header.length).setValues([header])
    .setFontWeight("bold").setBackground("#0d9488").setFontColor("#ffffff");
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, header.length).setValues(rows);
  }
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, header.length);

  Logger.log("Sinkron selesai: " + rows.length + " baris.");
}

/** Pasang trigger otomatis: jalankan syncReports tiap 1 jam. */
function pasangTriggerOtomatis() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "syncReports") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("syncReports").timeBased().everyHours(1).create();
  Logger.log("Trigger otomatis dipasang (tiap 1 jam).");
}
