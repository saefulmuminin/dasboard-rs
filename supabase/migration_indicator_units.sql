-- =============================================================
-- SIMPATI MUTU — Penugasan indikator ke unit tertentu ("khusus")
-- Indikator yang punya entri di sini -> HANYA muncul untuk unit tsb.
-- Indikator tanpa entri -> umum (muncul untuk semua unit).
-- Jalankan di Supabase -> SQL Editor. Aman & idempotent.
-- =============================================================

-- 1) Tabel relasi indikator <-> unit
create table if not exists public.indicator_units (
  indicator_id bigint not null references public.indicators(id) on delete cascade,
  unit_id      bigint not null references public.units(id)      on delete cascade,
  primary key (indicator_id, unit_id)
);

alter table public.indicator_units enable row level security;
drop policy if exists "iu_publik_baca" on public.indicator_units;
drop policy if exists "iu_mutu_kelola" on public.indicator_units;
create policy "iu_publik_baca" on public.indicator_units for select using ( true );
create policy "iu_mutu_kelola" on public.indicator_units for all
  using ( public.current_role() = 'mutu' ) with check ( public.current_role() = 'mutu' );

-- 2) Unit baru: IPSRS
insert into public.units (nama)
select 'IPSRS'
where not exists (select 1 from public.units where nama = 'IPSRS');

-- 3) Indikator baru: Kecepatan Penanganan Kerusakan Alat (nomor 19)
insert into public.indicators (nomor, nama, jenis, satuan, target)
select 19, 'Kecepatan Penanganan Kerusakan Alat', 'nasional', '%', 80
where not exists (select 1 from public.indicators where nama = 'Kecepatan Penanganan Kerusakan Alat');

-- 4) Seed penugasan khusus dari Tim Mutu
insert into public.indicator_units (indicator_id, unit_id)
select i.id, u.id
from public.indicators i
join public.units u on (
     (i.nomor = 7  and u.nama = 'Farmasi')        -- Formularium Nasional
  or (i.nomor = 6  and u.nama = 'Laboratorium')   -- Pelaporan Hasil Kritis
  or (i.nomor = 10 and u.nama = 'PKRS')           -- Waktu Tanggap Komplain
  or (i.nomor = 19 and u.nama = 'IPSRS')          -- Kecepatan Penanganan Kerusakan Alat
)
on conflict (indicator_id, unit_id) do nothing;
