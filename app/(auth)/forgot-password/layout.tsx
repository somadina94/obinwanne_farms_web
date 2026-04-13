import type { Metadata } from "next";

import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Forgot password",
  description: `Reset your ${SITE_NAME} account password.`,
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
