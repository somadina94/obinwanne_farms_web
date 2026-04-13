import Link from "next/link";

import { Logo } from "@/components/atoms/logo";
import { COMPANY_ADDRESS, COMPANY_PHONE, SITE_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo className="mb-4" />
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              {SITE_NAME} brings you quality seedlings, farm products, and expert digital guides —
              grown with care and delivered with trust.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products" className="hover:text-primary">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Legal
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary">
                  Terms &amp; conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Address:</span> {COMPANY_ADDRESS}
          </p>
          <p className="mt-1">
            <span className="font-medium text-foreground">Phone:</span> {COMPANY_PHONE}
          </p>
        </div>
        <div className="mt-10 border-t border-border/60 pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
