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
import { adminListOrders } from "@/lib/api/services";
import { formatCustomerAddress } from "@/lib/format-customer-address";
import type { Order, User } from "@/lib/types";

function payVariant(s: Order["paymentStatus"]) {
  if (s === "paid") return "default" as const;
  if (s === "pending") return "secondary" as const;
  return "outline" as const;
}

export default function AdminOrdersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminListOrders(),
  });

  const orders = data?.data.orders ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">Failed to load orders.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="mt-2 text-muted-foreground">Fulfillment and payment overview.</p>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => {
              const u = o.user;
              const cu = typeof u === "object" && u !== null ? (u as User) : null;
              const addressLine = cu ? formatCustomerAddress(cu) : "—";
              return (
                <TableRow key={o._id}>
                  <TableCell className="max-w-[140px] truncate text-sm">
                    {cu?.name ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate text-sm">{cu?.email ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{cu?.phone ?? "—"}</TableCell>
                  <TableCell
                    className="max-w-[140px] truncate text-sm text-muted-foreground"
                    title={addressLine !== "—" ? addressLine : undefined}
                  >
                    {addressLine}
                  </TableCell>
                  <TableCell
                    className="max-w-[120px] truncate font-mono text-xs"
                    title={o.paystackReference}
                  >
                    {o.paystackReference}
                  </TableCell>
                  <TableCell>₦{o.totalNgn.toLocaleString("en-NG")}</TableCell>
                  <TableCell>
                    <Badge variant={payVariant(o.paymentStatus)}>{o.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {o.createdAt ? format(new Date(o.createdAt), "MMM d, HH:mm") : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/orders/${o._id}`}>
                        Manage
                        <ArrowRight className="ml-1 size-4" />
                      </Link>
                    </Button>
                  </TableCell>
                  </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
