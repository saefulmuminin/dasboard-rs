-- =============================================================
-- SIMPATI MUTU — tambah kolom "nama_pengisi" pada laporan
-- Jalankan di Supabase → SQL Editor. Aman & idempotent.
-- =============================================================
alter table public.reports add column if not exists nama_pengisi text;
