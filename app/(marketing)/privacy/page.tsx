import type { Metadata } from "next";

import { PageTransition } from "@/components/molecules/page-transition";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${SITE_NAME} collects, uses, and protects your personal information.`,
};

export default function PrivacyPage() {
  return (
    <PageTransition className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight">Privacy policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: April 2026</p>
      <div className="mt-8 space-y-4 text-muted-foreground leading-relaxed">
        <p>
          {SITE_NAME} (&quot;we&quot;, &quot;our&quot;) respects your privacy. This policy describes
          how we handle personal data when you use our website, create an account, or make a
          purchase.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Data we collect</h2>
        <p>
          We collect information you provide (name, email, phone, address, payment references) and
          technical data such as cookies necessary for authentication and cart functionality.
        </p>
        <h2 className="mt-8 text-xl font-semibold">How we use data</h2>
        <p>
          To process orders, arrange delivery, send transactional messages, improve our services,
          and comply with legal obligations. Payment card data is processed by Paystack; we do not
          store full card numbers on our servers.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Retention &amp; security</h2>
        <p>
          We retain data as long as needed for the purposes above and apply appropriate technical
          and organizational measures to protect it.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Your rights</h2>
        <p>
          Depending on your jurisdiction, you may request access, correction, or deletion of your
          personal data. Contact us using the details on our site.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Contact</h2>
        <p>For privacy questions, reach out through our support channels.</p>
      </div>
    </PageTransition>
  );
}
