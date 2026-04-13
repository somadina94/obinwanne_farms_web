import type { Metadata } from "next";

import { PageTransition } from "@/components/molecules/page-transition";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description: `Terms of use and sale for ${SITE_NAME} customers.`,
};

export default function TermsPage() {
  return (
    <PageTransition className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight">Terms &amp; conditions</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: April 2026</p>
      <div className="mt-8 space-y-4 text-muted-foreground leading-relaxed">
        <p>
          By accessing {SITE_NAME} and placing orders, you agree to these terms. If you do not
          agree, please do not use our services.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Orders &amp; payment</h2>
        <p>
          Prices are shown in Nigerian Naira (NGN). Payment is processed securely via Paystack. A
          contract is formed when we accept your order and payment succeeds.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Digital products</h2>
        <p>
          Digital downloads are licensed for your personal use unless otherwise stated. Sharing or
          redistribution of files is not permitted.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Physical products &amp; delivery</h2>
        <p>
          Delivery timelines are estimates. We will update order status as your shipment moves.
          Risk passes to you upon delivery as described in your order confirmation.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Limitation of liability</h2>
        <p>
          To the extent permitted by law, our liability is limited to the amount you paid for the
          relevant order. We are not liable for indirect or consequential losses.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Changes</h2>
        <p>We may update these terms; continued use of the site constitutes acceptance of changes.</p>
      </div>
    </PageTransition>
  );
}
