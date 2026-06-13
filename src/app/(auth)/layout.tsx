// Layout passthrough — tiap halaman auth mengatur tampilannya sendiri
// (login: split 2 kolom; lupa/reset: AuthCard).
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
