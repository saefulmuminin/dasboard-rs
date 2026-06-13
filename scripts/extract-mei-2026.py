#!/usr/bin/env python3
# =============================================================
# Ekstrak data "mutu mei 2026.xlsx" -> data-mei-2026.csv (best-effort)
# Jalankan: python3 scripts/extract-mei-2026.py
#
# CSV hasil WAJIB direview manual sebelum diimpor:
#  - Isi kolom 'unit_db' untuk baris ber-flag UNIT_KOSONG (terutama kolom D).
#  - Periksa 'indikator_nomor' sudah benar.
#  - Indikator 8 (Alur Klinis) & 17 (BRM Rawat Jalan) berformat beda di Excel
#    -> TIDAK terbaca otomatis, tambahkan manual bila perlu.
# =============================================================
import zipfile, re, html, csv, os

XLSX = "mutu mei 2026.xlsx"
OUT = "data-mei-2026.csv"

# Pemetaan baris-Numerator -> nomor indikator (dipetakan manual dari struktur sheet1)
ROW_TO_IND = {
    8: 1, 14: 2, 20: 3, 26: 4, 32: 5, 38: 6, 44: 7,
    56: 9, 62: 10, 69: 11, 75: 12, 81: 13, 88: 14,
    95: 15, 102: 16, 120: 18,
}
IND_NAMA = {
    1: "Kepatuhan Cuci Tangan", 2: "Kepatuhan Penggunaan APD",
    3: "Kepatuhan Identifikasi Pasien", 4: "Waktu Tunggu Rawat Jalan",
    5: "Kepatuhan Waktu Visite Dokter", 6: "Pelaporan Hasil Kritis Laboratorium",
    7: "Kepatuhan Penggunaan Formularium Nasional", 9: "Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh",
    10: "Kecepatan Waktu Tanggap Komplain", 11: "Assesmen Medis",
    12: "Kepatuhan Double Check Obat", 13: "Kepatuhan Penggunaan SBAR/TBAK",
    14: "Pulang Atas Permintaan Sendiri", 15: "Kepatuhan Pengisian Rekam Medik",
    16: "Waktu Tunggu Rekam Medis", 18: "Kepatuhan Pengembalian BRM Rawat Inap",
}

z = zipfile.ZipFile(XLSX)
ss = z.read("xl/sharedStrings.xml").decode("utf-8")
def text_of(si): return "".join(re.findall(r"<t[^>]*>(.*?)</t>", si, re.S))
strings = [html.unescape(text_of(si)) for si in re.findall(r"<si>(.*?)</si>", ss, re.S)]
def col_to_idx(c):
    n = 0
    for ch in c: n = n * 26 + (ord(ch) - 64)
    return n

d = z.read("xl/worksheets/sheet1.xml").decode("utf-8")
cells = {}
for cm in re.finditer(r'<c r="([A-Z]+)(\d+)"([^>]*)>(.*?)</c>', d, re.S):
    col, row, attr, inner = cm.group(1), int(cm.group(2)), cm.group(3), cm.group(4)
    v = re.search(r"<v>(.*?)</v>", inner, re.S)
    if not v: continue
    val = v.group(1)
    if 't="s"' in attr: val = strings[int(val)]
    cells[(row, col_to_idx(col))] = val

db_units = ["Amarilis","Mawar","Daisy","IGD","HCU","Isolasi","Lavender","Lily","Violet",
            "Laboratorium","Farmasi","Jiwa","Fisioterapi","Gigi","Krisan","Interna","PKRS",
            "Poli PD","Poli Anak","Poli Obgyn","Poli Bedah","Poli Jiwa","Poli MCU","Poli Rehab","Poli VCT","Poli Gigi"]
alias = {"poli obgin":"Poli Obgyn","crisan":"Krisan","gigi":"Gigi"}
def map_unit(name):
    if not isinstance(name, str): return ""
    k = name.strip().lower()
    if k in alias: return alias[k]
    for u in db_units:
        if u.lower() == k: return u
    return ""
def is_num(s):
    try: float(s); return True
    except: return False

rows_out, ok, flagged = [], 0, 0
for (r, c), v in sorted(cells.items()):
    if c == 3 and v == "Numerator" and r in ROW_TO_IND:
        nomor = ROW_TO_IND[r]; nama = IND_NAMA.get(nomor, "")
        for col in range(4, 16):  # D..O
            num = cells.get((r, col)); den = cells.get((r + 1, col))
            if num is None and den is None: continue
            ux = cells.get((r - 1, col))
            udb = map_unit(ux)
            flag = []
            if ux is None or (isinstance(ux, str) and is_num(ux)): flag.append("UNIT_KOSONG")
            elif not udb: flag.append("UNIT_TAK_DIKENAL")
            if (isinstance(num, str) and "DIV" in num) or (isinstance(den, str) and "DIV" in den): flag.append("DIV0")
            if flag: flagged += 1
            else: ok += 1
            rows_out.append([nomor, nama, r, chr(64 + col), ux if ux is not None else "", udb, num, den, "|".join(flag)])

with open(OUT, "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["indikator_nomor","indikator_nama","baris_excel","kolom","unit_excel","unit_db","numerator","denominator","flag"])
    w.writerows(rows_out)

print(f"Total baris : {len(rows_out)}")
print(f"Bersih (siap impor) : {ok}")
print(f"Perlu diperbaiki    : {flagged}")
print(f"-> {OUT}")
print("\nCATATAN: Indikator 8 (Alur Klinis) & 17 (BRM Rawat Jalan) format beda -> tidak terbaca, tambah manual bila perlu.")
