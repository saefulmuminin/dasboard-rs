import { requireUser } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireUser();

  return (
    <DashboardShell
      role={profile?.role ?? "unit"}
      nama={profile?.nama ?? ""}
      email={user!.email ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
