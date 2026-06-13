-- =============================================================
-- Set TARGET indikator (default mengacu standar Indikator Mutu Nasional).
-- Jalankan di Supabase → SQL Editor. SESUAIKAN angka dengan ketetapan RS Anda.
-- =============================================================
-- Catatan arah:
--  - Mayoritas indikator: makin TINGGI makin baik (capaian >= target = tercapai).
--  - Indikator #14 "Pulang Atas Permintaan Sendiri" justru makin RENDAH makin baik;
--    sistem saat ini hanya membandingkan capaian >= target, jadi tafsirkan manual.

update public.indicators set target = 85  where nomor = 1;   -- Kebersihan/Cuci Tangan
update public.indicators set target = 100 where nomor = 2;   -- Penggunaan APD
update public.indicators set target = 100 where nomor = 3;   -- Identifikasi Pasien
update public.indicators set target = 80  where nomor = 4;   -- Waktu Tunggu Rawat Jalan
update public.indicators set target = 80  where nomor = 5;   -- Waktu Visite Dokter
update public.indicators set target = 100 where nomor = 6;   -- Pelaporan Hasil Kritis Lab
update public.indicators set target = 80  where nomor = 7;   -- Formularium Nasional
update public.indicators set target = 80  where nomor = 8;   -- Alur Klinis / Clinical Pathway
update public.indicators set target = 100 where nomor = 9;   -- Pencegahan Risiko Pasien Jatuh
update public.indicators set target = 80  where nomor = 10;  -- Waktu Tanggap Komplain
update public.indicators set target = 80  where nomor = 11;  -- Assesmen Medis
update public.indicators set target = 100 where nomor = 12;  -- Double Check Obat
update public.indicators set target = 100 where nomor = 13;  -- SBAR/TBAK
update public.indicators set target = 5   where nomor = 14;  -- Pulang Atas Permintaan Sendiri (makin kecil makin baik)
update public.indicators set target = 80  where nomor = 15;  -- Pengisian Rekam Medik
update public.indicators set target = 80  where nomor = 16;  -- Waktu Tunggu Rekam Medis
update public.indicators set target = 80  where nomor = 17;  -- Pengembalian BRM Rawat Jalan
update public.indicators set target = 80  where nomor = 18;  -- Pengembalian BRM Rawat Inap
