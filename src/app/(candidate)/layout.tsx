import { RoleGuard } from "@/components/layout/RoleGuard";
import { Navbar } from "@/components/layout/Navbar";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="CANDIDATE">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </RoleGuard>
  );
}
