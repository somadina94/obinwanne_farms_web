import type { Metadata } from "next";

import { UserDashboardShell } from "@/components/templates/user-dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <UserDashboardShell>{children}</UserDashboardShell>
    </div>
  );
}
