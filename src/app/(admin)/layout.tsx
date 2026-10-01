import { RoleGuard } from "@/components/layout/RoleGuard";
import { Navbar } from "@/components/layout/Navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="ADMIN">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </RoleGuard>
  );
}
