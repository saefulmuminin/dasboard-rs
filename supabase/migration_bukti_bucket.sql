-- =============================================================
-- SIMPATI MUTU — Perbaiki "Bucket not found" saat upload bukti
-- Membuat bucket Storage 'bukti' (privat) + policy upload & baca.
-- Jalankan di Supabase -> SQL Editor. Aman & idempotent.
-- =============================================================

-- 1) Bucket privat 'bukti'
insert into storage.buckets (id, name, public)
values ('bukti', 'bukti', false)
on conflict (id) do nothing;

-- 2) Policy storage.objects untuk bucket 'bukti'
drop policy if exists "bukti_read_auth"   on storage.objects;
drop policy if exists "bukti_insert_auth" on storage.objects;
drop policy if exists "bukti_update_auth" on storage.objects;
drop policy if exists "bukti_delete_auth" on storage.objects;

-- semua user login boleh baca & upload ke bucket 'bukti'
create policy "bukti_read_auth" on storage.objects
  for select to authenticated using ( bucket_id = 'bukti' );
create policy "bukti_insert_auth" on storage.objects
  for insert to authenticated with check ( bucket_id = 'bukti' );
create policy "bukti_update_auth" on storage.objects
  for update to authenticated using ( bucket_id = 'bukti' ) with check ( bucket_id = 'bukti' );
create policy "bukti_delete_auth" on storage.objects
  for delete to authenticated using ( bucket_id = 'bukti' );
