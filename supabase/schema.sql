-- =============================================================
-- SMART MUTU — Skema Database (Supabase / PostgreSQL)
-- RSU Sofifi — Sistem Pelaporan & Monitoring Indikator Mutu
-- =============================================================
-- Cara pakai:
--   1. Buka Supabase → SQL Editor → New query
--   2. Tempel SELURUH isi file ini → Run
--   3. Buat user lewat Authentication, lalu set role-nya di tabel profiles
-- =============================================================

-- ---------- ENUM ----------
create type user_role   as enum ('unit', 'mutu');           -- unit = kepala ruangan, mutu = admin
create type report_status as enum ('draft','submitted','approved','rejected');
create type indicator_kind as enum ('nasional','unit');

-- ---------- TABEL: profiles (perpanjangan auth.users) ----------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nama        text not null default '',
  role        user_role not null default 'unit',
  unit_id     bigint,                       -- diisi untuk role 'unit'
  created_at  timestamptz not null default now()
);

-- ---------- TABEL: units (master ruangan/unit) ----------
create table public.units (
  id     bigint generated always as identity primary key,
  nama   text not null unique,
  aktif  boolean not null default true
);

-- ---------- TABEL: indicators (18 indikator) ----------
create table public.indicators (
  id      bigint generated always as identity primary key,
  nomor   int,                              -- urutan tampil (1..18)
  nama    text not null,
  jenis   indicator_kind not null default 'nasional',
  satuan  text not null default '%',
  target  numeric,                          -- target capaian (mis. 85). isi sesuai standar
  aktif   boolean not null default true
);

-- ---------- TABEL: reports (inti — data per indikator × unit × bulan) ----------
create table public.reports (
  id            bigint generated always as identity primary key,
  indicator_id  bigint not null references public.indicators(id) on delete restrict,
  unit_id       bigint not null references public.units(id)      on delete restrict,
  tahun         int  not null,
  bulan         int  not null check (bulan between 1 and 12),
  numerator     numeric not null default 0,
  denominator   numeric not null default 0,
  -- hasil dihitung otomatis oleh database (numerator/denominator * 100)
  hasil         numeric generated always as (
                  case when denominator > 0
                       then round((numerator / denominator) * 100, 2)
                       else 0 end
                ) stored,
  analisa       text,                       -- alasan naik/turun
  rtl           text,                       -- rencana tindak lanjut
  bukti_url     text,                       -- link PDF bukti dukung (Supabase Storage)
  status        report_status not null default 'draft',
  created_by    uuid references auth.users(id),
  reviewed_by   uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (indicator_id, unit_id, tahun, bulan)   -- 1 laporan per indikator/unit/bulan
);

create index on public.reports (tahun, bulan);
create index on public.reports (status);
create index on public.reports (indicator_id);
create index on public.reports (unit_id);

-- ---------- FUNGSI BANTU (hindari rekursi RLS) ----------
create or replace function public.current_role()
returns user_role language sql security definer stable
set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_unit()
returns bigint language sql security definer stable
set search_path = public as $$
  select unit_id from public.profiles where id = auth.uid();
$$;

-- auto-update updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger trg_reports_touch before update on public.reports
  for each row execute function public.touch_updated_at();

-- auto-buat profile saat user baru daftar (default role 'unit')
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nama) values (new.id, coalesce(new.raw_user_meta_data->>'nama',''));
  return new;
end; $$;
create trigger trg_on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================
alter table public.profiles   enable row level security;
alter table public.units      enable row level security;
alter table public.indicators enable row level security;
alter table public.reports    enable row level security;

-- ---- profiles ----
create policy "profil sendiri / mutu lihat semua" on public.profiles
  for select using ( id = auth.uid() or public.current_role() = 'mutu' );
create policy "mutu kelola profil" on public.profiles
  for all using ( public.current_role() = 'mutu' ) with check ( public.current_role() = 'mutu' );

-- ---- units & indicators: SEMUA ORANG boleh baca (homepage publik) ----
create policy "units publik baca" on public.units for select using ( true );
create policy "units mutu kelola" on public.units for all
  using ( public.current_role() = 'mutu' ) with check ( public.current_role() = 'mutu' );

create policy "indikator publik baca" on public.indicators for select using ( true );
create policy "indikator mutu kelola" on public.indicators for all
  using ( public.current_role() = 'mutu' ) with check ( public.current_role() = 'mutu' );

-- ---- reports ----
-- Publik (tanpa login) HANYA boleh lihat data yang sudah APPROVED
create policy "publik lihat approved" on public.reports
  for select using ( status = 'approved' );
-- Unit lihat semua data unit-nya sendiri (semua status)
create policy "unit lihat data sendiri" on public.reports
  for select using ( public.current_role() = 'unit' and unit_id = public.current_unit() );
-- Mutu lihat semua
create policy "mutu lihat semua" on public.reports
  for select using ( public.current_role() = 'mutu' );

-- Unit input data untuk unit-nya sendiri
create policy "unit input" on public.reports
  for insert with check (
    public.current_role() = 'unit'
    and unit_id = public.current_unit()
    and created_by = auth.uid()
    and status in ('draft','submitted')
  );
-- Unit edit data sendiri SELAMA belum approved
create policy "unit edit sebelum approve" on public.reports
  for update using (
    public.current_role() = 'unit'
    and unit_id = public.current_unit()
    and status in ('draft','submitted','rejected')
  ) with check ( status in ('draft','submitted') );

-- Mutu boleh edit semua (termasuk approve/reject) & hapus
create policy "mutu edit semua" on public.reports
  for update using ( public.current_role() = 'mutu' ) with check ( true );
create policy "mutu hapus" on public.reports
  for delete using ( public.current_role() = 'mutu' );
-- Unit boleh hapus draft sendiri
create policy "unit hapus draft" on public.reports
  for delete using (
    public.current_role() = 'unit' and unit_id = public.current_unit() and status = 'draft'
  );

-- =============================================================
-- SEED DATA
-- =============================================================
-- 18 Indikator Mutu Nasional (urutan dari file mutu mei 2026.xlsx)
insert into public.indicators (nomor, nama, jenis, satuan) values
 (1 ,'Kepatuhan Cuci Tangan','nasional','%'),
 (2 ,'Kepatuhan Penggunaan APD','nasional','%'),
 (3 ,'Kepatuhan Identifikasi Pasien','nasional','%'),
 (4 ,'Waktu Tunggu Rawat Jalan','nasional','%'),
 (5 ,'Kepatuhan Waktu Visite Dokter','nasional','%'),
 (6 ,'Pelaporan Hasil Kritis Laboratorium','nasional','%'),
 (7 ,'Kepatuhan Penggunaan Formularium Nasional','nasional','%'),
 (8 ,'Kepatuhan Terhadap Alur Klinis','nasional','%'),
 (9 ,'Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh','nasional','%'),
 (10,'Kecepatan Waktu Tanggap Komplain','nasional','%'),
 (11,'Assesmen Medis','nasional','%'),
 (12,'Kepatuhan Double Check Obat','nasional','%'),
 (13,'Kepatuhan Penggunaan SBAR/TBAK','nasional','%'),
 (14,'Pulang Atas Permintaan Sendiri','nasional','%'),
 (15,'Kepatuhan Pengisian Rekam Medik','nasional','%'),
 (16,'Waktu Tunggu Rekam Medis','nasional','%'),
 (17,'Kepatuhan Pengembalian BRM Rawat Jalan','nasional','%'),
 (18,'Kepatuhan Pengembalian BRM Rawat Inap','nasional','%');

-- Master unit (dari Excel — sesuaikan/hapus yang tidak perlu)
insert into public.units (nama) values
 ('Amarilis'),('Mawar'),('Daisy'),('IGD'),('HCU'),('Isolasi'),
 ('Lavender'),('Lily'),('Violet'),('Laboratorium'),('Farmasi'),
 ('Jiwa'),('Fisioterapi'),('Gigi'),('Krisan'),('Interna'),('PKRS'),
 ('Poli PD'),('Poli Anak'),('Poli Obgyn'),('Poli Bedah'),('Poli Jiwa'),
 ('Poli MCU'),('Poli Rehab'),('Poli VCT'),('Poli Gigi');
