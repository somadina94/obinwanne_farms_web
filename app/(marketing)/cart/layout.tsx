import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your cart and checkout securely with Paystack.",
  robots: { index: false, follow: false },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
