-- =============================================================
-- SIMPATI MUTU — Izinkan user mengubah PROFIL SENDIRI (nama)
-- role & unit_id tetap TERKUNCI (tidak bisa dinaikkan sendiri),
-- karena current_role()/current_unit() membaca nilai LAMA saat update.
-- Ganti kata sandi ditangani Supabase Auth (tak butuh policy ini).
-- Jalankan di Supabase -> SQL Editor. Idempotent.
-- =============================================================

drop policy if exists "profil sendiri update" on public.profiles;
create policy "profil sendiri update" on public.profiles
  for update
  using ( id = auth.uid() )
  with check (
    id = auth.uid()
    and role = public.current_role()
    and unit_id is not distinct from public.current_unit()
  );
