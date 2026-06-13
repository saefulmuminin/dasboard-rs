import { requireMutu } from "@/lib/auth";
import PenggunaManager, {
  type Pengguna,
  type UnitOpt,
} from "@/components/PenggunaManager";

export const dynamic = "force-dynamic";

export default async function KelolaPenggunaPage() {
  const { supabase } = await requireMutu();

  const [{ data: profs, error }, { data: units }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nama, email, role, unit_id")
      .order("email", { ascending: true }),
    supabase.from("units").select("id, nama").eq("aktif", true).order("nama"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Kelola Pengguna</h1>
        <p className="mt-1 text-sm text-slate-500">
          Atur hak akses peran akun petugas (Petugas Unit / Tim Mutu) beserta penetapan ruangan unit kerjanya.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 text-sm text-amber-800 shadow-sm leading-relaxed">
          <p className="font-semibold text-amber-900">Gagal Memuat Data Pengguna</p>
          <p className="mt-1">
            {error.message}. Silakan pastikan bahwa database migrasi relasi profil dan autentikasi telah terkonfigurasi dengan benar.
          </p>
        </div>
      ) : (
        <PenggunaManager
          initial={(profs as Pengguna[]) ?? []}
          units={(units as UnitOpt[]) ?? []}
        />
      )}
    </div>
  );
}
