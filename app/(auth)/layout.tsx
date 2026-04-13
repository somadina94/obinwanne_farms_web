import Link from "next/link";

import { Logo } from "@/components/atoms/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-muted/40 to-background">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        {children}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
