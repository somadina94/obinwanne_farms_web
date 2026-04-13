import Link from "next/link";
import { Mail, MapPin, MapPinned, Phone } from "lucide-react";

import { Logo } from "@/components/atoms/logo";
import {
  COMPANY_ADDRESS,
  COMPANY_EMAIL,
  COMPANY_MAP_URL,
  COMPANY_PHONE,
  SITE_NAME,
} from "@/lib/constants";

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
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 text-primary" />
            <span>
              <span className="font-medium text-foreground">Address:</span> {COMPANY_ADDRESS}
            </span>
          </p>
          <p className="mt-1 flex items-center gap-2">
            <Phone className="size-4 text-primary" />
            <span>
              <span className="font-medium text-foreground">Phone:</span>{" "}
              <a href={`tel:${COMPANY_PHONE}`} className="text-primary hover:underline">
                {COMPANY_PHONE}
              </a>
            </span>
          </p>
          <p className="mt-1 flex items-center gap-2">
            <Mail className="size-4 text-primary" />
            <span>
              <span className="font-medium text-foreground">Email:</span>{" "}
              <a href={`mailto:${COMPANY_EMAIL}`} className="text-primary hover:underline">
                {COMPANY_EMAIL}
              </a>
            </span>
          </p>
          <p className="mt-2">
            <a
              href={COMPANY_MAP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <MapPinned className="size-4" />
              View address on map
            </a>
          </p>
        </div>
        <div className="mt-6 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-background to-primary/5 px-5 py-4 text-center">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-primary/90">
            MADE BY JAHBYTE TECHNOLOGIES
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            <a href="mailto:support@jahbyte.com" className="font-medium text-primary hover:underline">
              support@jahbyte.com
            </a>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            <a
              href="https://www.jahbyte.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              www.jahbyte.com
            </a>
          </p>
        </div>
        <div className="mt-10 border-t border-border/60 pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
