# Smart Mutu — RSUD Sofifi

Sistem Pelaporan & Monitoring Indikator Mutu RSUD Sofifi.

**Stack:** Next.js 15 (App Router, TypeScript) · Tailwind CSS · Supabase (DB + Auth + Storage) · deploy ke Vercel.

## Menjalankan secara lokal

1. Install dependency:
   ```bash
   npm install
   ```
2. Siapkan environment:
   ```bash
   cp .env.local.example .env.local
   ```
   Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key)
   dari Supabase → Settings → API.
3. Pastikan skema database sudah dijalankan: jalankan isi `supabase/schema.sql`
   di Supabase → SQL Editor.
4. Jalankan dev server:
   ```bash
   npm run dev
   ```
   Buka http://localhost:3000

## Struktur

- `src/app/` — halaman (App Router)
- `src/lib/supabase/client.ts` — Supabase client untuk Client Component
- `src/lib/supabase/server.ts` — Supabase client untuk Server Component/Action
- `middleware.ts` — refresh sesi auth
- `supabase/schema.sql` — skema database + RLS + seed (18 indikator & unit)

## Keamanan

- **Publishable key** (`sb_publishable_...`) → aman di browser (RLS aktif).
- **Secret key** (`sb_secret_...`) → JANGAN di-commit / JANGAN pakai prefix `NEXT_PUBLIC_`.

## Deploy ke Vercel

1. Push ke GitHub.
2. Import repo di Vercel.
3. Tambahkan Environment Variables yang sama (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Deploy.
