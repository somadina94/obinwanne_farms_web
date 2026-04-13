"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMyOrders } from "@/lib/api/services";
import type { Order } from "@/lib/types";

function statusVariant(s: Order["paymentStatus"]) {
  if (s === "paid") return "default" as const;
  if (s === "pending") return "secondary" as const;
  return "outline" as const;
}

export default function OrdersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", "me"],
    queryFn: getMyOrders,
  });

  const orders = data?.data.orders ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-destructive">Could not load orders. Try refreshing.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="mt-2 text-muted-foreground">Your payment and delivery history.</p>
      </div>
      {orders.length === 0 ? (
        <p className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No orders yet.{" "}
          <Link href="/products" className="text-primary underline-offset-4 hover:underline">
            Start shopping
          </Link>
        </p>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o._id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {o.createdAt
                      ? format(new Date(o.createdAt), "MMM d, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{o.paystackReference}</TableCell>
                  <TableCell>
                    ₦{o.totalNgn.toLocaleString("en-NG")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(o.paymentStatus)}>{o.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/orders/${o._id}`}>
                        Details
                        <ArrowRight className="ml-1 size-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
