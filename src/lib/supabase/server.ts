import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase client untuk Server Component / Server Action / Route Handler.
// Di Next.js 15, cookies() bersifat async — maka fungsi ini async.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Record<string, never>),
            );
          } catch {
            // Dipanggil dari Server Component — diabaikan; refresh sesi
            // sudah ditangani oleh middleware.
          }
        },
      },
    },
  );
}
