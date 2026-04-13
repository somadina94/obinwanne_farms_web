"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ApiError } from "@/lib/api/client";
import { getDownloadUrl, getOrder } from "@/lib/api/services";
import type { OrderItem } from "@/lib/types";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = typeof params.orderId === "string" ? params.orderId : "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
  });

  const order = data?.data.order;

  const handleDownload = async (productId: string) => {
    try {
      const res = await getDownloadUrl(orderId, productId);
      window.open(res.data.downloadUrl, "_blank");
      toast.success("Download started");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Download failed";
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    const message =
      error instanceof ApiError && error.status === 403
        ? "You don't have access to this order."
        : error instanceof ApiError && error.message
          ? error.message
          : "Order not found.";
    return (
      <p className="text-destructive">
        {message}{" "}
        <Link href="/dashboard/orders" className="underline">
          Back to orders
        </Link>
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          href="/dashboard/orders"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ← All orders
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Order details</h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">{order.paystackReference}</p>
      </div>
      <div className="rounded-xl border p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Placed</p>
            <p className="font-medium">
              {order.createdAt
                ? format(new Date(order.createdAt), "PPpp")
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payment</p>
            <Badge>{order.paymentStatus}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-primary">
              ₦{order.totalNgn.toLocaleString("en-NG")}
            </p>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold">Items</h2>
        <Separator className="my-4" />
        <ul className="space-y-4">
          {order.items.map((item: OrderItem) => {
            const pid =
              typeof item.product === "string"
                ? item.product
                : item.product._id;
            return (
              <li
                key={item._id ?? `${pid}-${item.title}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.productType} × {item.quantity} · ₦
                    {(item.unitPriceNgn * item.quantity).toLocaleString("en-NG")}
                  </p>
                  {item.productType === "physical" && item.deliveryStatus ? (
                    <Badge variant="outline" className="mt-2">
                      {item.deliveryStatus.replace(/_/g, " ")}
                    </Badge>
                  ) : null}
                </div>
                {item.productType === "digital" && order.paymentStatus === "paid" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleDownload(pid)}
                  >
                    <Download className="size-4" />
                    Download
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
