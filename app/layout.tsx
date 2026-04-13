import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { AuthHydrator } from "@/components/organisms/auth-hydrator";
import { Providers } from "@/app/providers";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${jakarta.variable} min-h-screen font-sans antialiased`}
      >
        <Providers>
          <AuthHydrator />
          {children}
        </Providers>
      </body>
    </html>
  );
}
