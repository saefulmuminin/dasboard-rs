-- =============================================================
-- SMART MUTU — Migrasi untuk Grup C (Area Internal)
-- Jalankan SETELAH schema.sql, di Supabase → SQL Editor.
-- Aman dijalankan ulang (idempotent).
-- =============================================================

-- 1) Kolom email di profiles (untuk halaman Kelola Pengguna)
alter table public.profiles add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and (p.email is null or p.email = '');

-- trigger baru: ikut simpan email saat user dibuat
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nama, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nama',''), new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

-- 2) Bucket Storage untuk Bukti Dukung (PDF) — privat
insert into storage.buckets (id, name, public)
values ('bukti', 'bukti', false)
on conflict (id) do nothing;

-- 3) Policy Storage (drop dulu biar idempotent)
drop policy if exists "bukti_read_auth"   on storage.objects;
drop policy if exists "bukti_insert_auth" on storage.objects;
drop policy if exists "bukti_update_own"  on storage.objects;
drop policy if exists "bukti_delete_own"  on storage.objects;

-- semua user login boleh baca & upload ke bucket 'bukti'
create policy "bukti_read_auth" on storage.objects
  for select to authenticated using (bucket_id = 'bukti');
create policy "bukti_insert_auth" on storage.objects
  for insert to authenticated with check (bucket_id = 'bukti');
-- hanya pemilik file yang boleh ubah/hapus
create policy "bukti_update_own" on storage.objects
  for update to authenticated using (bucket_id = 'bukti' and owner = auth.uid());
create policy "bukti_delete_own" on storage.objects
  for delete to authenticated using (bucket_id = 'bukti' and owner = auth.uid());
