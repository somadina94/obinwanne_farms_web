import type { Metadata } from "next";

import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Set new password",
  description: `Choose a new password for your ${SITE_NAME} account.`,
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
