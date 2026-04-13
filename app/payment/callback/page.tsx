"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { verifyPayment } from "@/lib/api/services";

export default function PaymentCallbackPage() {
  const params = useSearchParams();
  const reference =
    params.get("reference") ?? params.get("trxref") ?? "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["verify", reference],
    queryFn: () => verifyPayment(reference),
    enabled: !!reference,
    retry: 1,
  });

  const payload = data as
    | {
        data?: { transactionStatus?: string };
      }
    | undefined;
  const ok = payload?.data?.transactionStatus === "success";

  if (!reference) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-muted-foreground">Missing payment reference.</p>
        <Button className="mt-6" asChild>
          <Link href="/dashboard/orders">Go to orders</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Confirming payment…</p>
      </div>
    );
  }

  if (isError || !ok) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <XCircle className="mx-auto size-14 text-destructive" />
        <h1 className="mt-6 text-2xl font-bold">Payment not confirmed</h1>
        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t verify this payment yet. If you were charged, check your orders or contact
          support.
        </p>
        <Button className="mt-8" asChild>
          <Link href="/dashboard/orders">View orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <CheckCircle2 className="mx-auto size-14 text-primary" />
      <h1 className="mt-6 text-2xl font-bold">Payment successful</h1>
      <p className="mt-2 text-muted-foreground">
        Thank you! Your order is being processed. Digital items are ready to download from your order
        page.
      </p>
      <Button className="mt-8" asChild>
        <Link href="/dashboard/orders">View orders</Link>
      </Button>
    </div>
  );
}
