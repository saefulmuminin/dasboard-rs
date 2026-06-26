/**
 * =============================================================
 * SMART MUTU — Sinkronisasi data laporan ke Google Sheet
 * Versi LENGKAP: service_role (semua status) + REAL-TIME (webhook)
 * =============================================================
 * - Menarik SEMUA laporan unit (draft, submitted, approved, rejected).
 * - Tetap TIDAK menyertakan akun pengguna.
 * - Bisa otomatis tiap jam (trigger) DAN/ATAU real-time (Supabase Webhook).
 *
 * LANGKAH (ringkas, detail ada di chat):
 *  A. Apps Script: tempel file ini, isi SERVICE_ROLE_KEY & WEBHOOK_SECRET,
 *     jalankan `syncReports` sekali (authorize).
 *  B. (opsi backup) jalankan `pasangTriggerOtomatis` → sync tiap jam.
 *  C. Deploy → New deployment → Web app (Execute as: Me, Access: Anyone) → salin URL.
 *  D. Supabase → Database → Webhooks → buat hook tabel `reports`
 *     (Insert/Update/Delete) → POST ke:  <URL_WEBAPP>?token=WEBHOOK_SECRET
 * =============================================================
 */

// ====== KONFIGURASI ======
const SUPABASE_URL = "https://yxirjhixzywquxweqzdv.supabase.co";
// service_role key (dari .env: SUPABASE_SERVICE_ROLE_KEY). Bypass RLS → semua status terbaca.
const SERVICE_ROLE_KEY = "TEMPEL_SERVICE_ROLE_KEY_DI_SINI";
// Kata sandi rahasia untuk mengamankan web app (samakan di URL webhook). Ganti bebas.
const WEBHOOK_SECRET = "GANTI-DENGAN-RAHASIA-PANJANG-123";
const SHEET_NAME = "Data Mutu";

const NAMA_BULAN = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

/**
 * TES AMAN — hanya cek koneksi & hitung jumlah data.
 * TIDAK menulis ke Sheet. TIDAK mengubah database sama sekali.
 * Jalankan ini DULU, lalu lihat hasilnya di: View → Executions / Logs.
 */
function testKoneksi() {
  const url = SUPABASE_URL + "/rest/v1/reports?select=id";
  const res = UrlFetchApp.fetch(url, {
    method: "get",
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: "Bearer " + SERVICE_ROLE_KEY },
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() === 200) {
    const n = JSON.parse(res.getContentText()).length;
    Logger.log("✅ Koneksi OK. Total data laporan: " + n + " baris. (Sheet & database TIDAK diubah.)");
  } else {
    Logger.log("❌ Gagal (" + res.getResponseCode() + "): " + res.getContentText());
  }
}

/** Tarik SEMUA laporan dari Supabase lalu timpa penuh ke sheet (anti duplikat). */
function syncReports() {
  const url = SUPABASE_URL + "/rest/v1/reports"
    + "?select=tahun,bulan,numerator,denominator,hasil,status,updated_at,indicators(nomor,nama),units(nama)"
    + "&order=tahun.desc,bulan.desc,status.asc";

  const res = UrlFetchApp.fetch(url, {
    method: "get",
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: "Bearer " + SERVICE_ROLE_KEY },
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
  if (rows.length) sheet.getRange(2, 1, rows.length, header.length).setValues(rows);
  sheet.setFrozenRows(1);

  Logger.log("Sinkron selesai: " + rows.length + " baris.");
  return rows.length;
}

/** Backup: sync otomatis tiap 1 jam (jalankan sekali untuk memasang). */
function pasangTriggerOtomatis() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "syncReports") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("syncReports").timeBased().everyHours(1).create();
  Logger.log("Trigger backup dipasang (tiap 1 jam).");
}

/** REAL-TIME: dipanggil Supabase Webhook setiap ada perubahan data. */
function doPost(e) {
  return handle(e);
}
function doGet(e) {
  return handle(e);
}
function handle(e) {
  const token = e && e.parameter ? e.parameter.token : "";
  if (token !== WEBHOOK_SECRET) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "unauthorized" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  try {
    const n = syncReports();
    return ContentService.createTextOutput(JSON.stringify({ ok: true, rows: n }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
