import { Leaf } from "lucide-react";
import Link from "next/link";

import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90",
        className,
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Leaf className="size-5" aria-hidden />
      </span>
      <span className="hidden sm:inline text-lg">{SITE_NAME}</span>
    </Link>
  );
}
