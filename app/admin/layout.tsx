import type { Metadata } from "next";

import { AdminDashboardShell } from "@/components/templates/admin-dashboard-shell";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <AdminDashboardShell>{children}</AdminDashboardShell>
    </div>
  );
}
