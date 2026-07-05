-- =============================================================
-- SIMPATI MUTU — Catat WAKTU KIRIM laporan (submitted_at)
-- Kolom diisi OTOMATIS oleh trigger saat status menjadi 'submitted',
-- jadi aplikasi tak perlu mengirim kolom ini (aman walau kode sudah
-- ter-deploy sebelum migrasi dijalankan). Jalankan di Supabase -> SQL Editor.
-- Idempotent.
-- =============================================================

alter table public.reports add column if not exists submitted_at timestamptz;

-- Backfill: laporan yang sudah dikirim/disetujui -> pakai updated_at sebagai perkiraan.
update public.reports
set submitted_at = updated_at
where status in ('submitted', 'approved') and submitted_at is null;

-- Trigger: isi submitted_at saat laporan MENJADI 'submitted'.
create or replace function public.set_submitted_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'submitted' then
    if tg_op = 'INSERT' or old.status is distinct from 'submitted' then
      new.submitted_at = now();
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists trg_reports_submitted_at on public.reports;
create trigger trg_reports_submitted_at before insert or update on public.reports
  for each row execute function public.set_submitted_at();
