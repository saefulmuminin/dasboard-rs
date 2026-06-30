import { requireUser } from "@/lib/auth";
import ProfilForm from "@/components/ProfilForm";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const { supabase, user, profile } = await requireUser();

  let unitNama: string | null = null;
  if (profile?.unit_id) {
    const { data } = await supabase.from("units").select("nama").eq("id", profile.unit_id).maybeSingle();
    unitNama = (data as { nama: string } | null)?.nama ?? null;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Profil Saya</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Perbarui nama tampilan dan ganti kata sandi akun Anda.
        </p>
      </div>
      <ProfilForm
        userId={user!.id}
        initialNama={profile?.nama ?? ""}
        email={user!.email ?? ""}
        role={profile?.role ?? "unit"}
        unitNama={unitNama}
      />
    </div>
  );
}
