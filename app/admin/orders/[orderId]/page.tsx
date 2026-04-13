"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  adminUpdateDelivery,
  adminUpdateFulfillmentNotes,
  getOrder,
} from "@/lib/api/services";
import { formatCustomerAddress } from "@/lib/format-customer-address";
import type { OrderItem, PhysicalDeliveryStatus, User } from "@/lib/types";

const statuses: PhysicalDeliveryStatus[] = [
  "pending_payment",
  "awaiting_fulfillment",
  "processing",
  "out_for_delivery",
  "delivered",
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = typeof params.orderId === "string" ? params.orderId : "";
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["order", orderId, "admin"],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
  });

  const order = data?.data.order;

  const notesMutation = useMutation({
    mutationFn: (notes: string) => adminUpdateFulfillmentNotes(orderId, notes),
    onSuccess: () => {
      toast.success("Notes saved");
      qc.invalidateQueries({ queryKey: ["order", orderId] });
    },
    onError: () => toast.error("Could not save notes"),
  });

  const deliveryMutation = useMutation({
    mutationFn: ({
      itemId,
      deliveryStatus,
    }: {
      itemId: string;
      deliveryStatus: string;
    }) => adminUpdateDelivery(orderId, itemId, deliveryStatus),
    onSuccess: () => {
      toast.success("Delivery updated");
      qc.invalidateQueries({ queryKey: ["order", orderId] });
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: () => toast.error("Update failed"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <p className="text-destructive">
        Order not found.{" "}
        <Link href="/admin/orders" className="underline">
          Back
        </Link>
      </p>
    );
  }

  const cu =
    typeof order.user === "object" && order.user !== null
      ? (order.user as User)
      : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link href="/admin/orders" className="text-sm text-muted-foreground hover:text-primary">
          ← Orders
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Order</h1>
        <p className="font-mono text-sm text-muted-foreground">{order.paystackReference}</p>
      </div>
      {cu ? (
        <div className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Customer</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{cu.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd>
                <a href={`mailto:${cu.email}`} className="font-medium text-primary underline">
                  {cu.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium">{cu.phone || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Shipping address</dt>
              <dd className="font-medium">{formatCustomerAddress(cu)}</dd>
            </div>
          </dl>
        </div>
      ) : null}
      <div className="rounded-xl border p-6">
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Payment</p>
            <Badge>{order.paymentStatus}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold">₦{order.totalNgn.toLocaleString("en-NG")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="text-sm">
              {order.createdAt ? format(new Date(order.createdAt), "PPpp") : "—"}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Fulfillment notes (internal)</Label>
        <Textarea
          id="notes"
          key={order.fulfillmentNotes ?? "empty"}
          defaultValue={order.fulfillmentNotes ?? ""}
          rows={3}
          className="resize-none"
        />
        <Button
          type="button"
          size="sm"
          disabled={notesMutation.isPending}
          onClick={() => {
            const el = document.getElementById("notes") as HTMLTextAreaElement | null;
            if (el) notesMutation.mutate(el.value);
          }}
        >
          {notesMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Save notes"
          )}
        </Button>
      </div>
      <div>
        <h2 className="text-lg font-semibold">Line items</h2>
        <Separator className="my-4" />
        <ul className="space-y-6">
          {order.items.map((item: OrderItem) => {
            const pid =
              typeof item.product === "string" ? item.product : item.product._id;
            return (
              <li key={item._id ?? `${pid}-${item.title}`} className="rounded-lg border p-4">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {item.productType} × {item.quantity}
                </p>
                {item.productType === "physical" && order.paymentStatus === "paid" ? (
                  <div className="mt-4 max-w-xs">
                    <Label className="text-xs">Delivery status</Label>
                    <Select
                      value={item.deliveryStatus ?? "awaiting_fulfillment"}
                      onValueChange={(v) =>
                        item._id &&
                        deliveryMutation.mutate({
                          itemId: item._id,
                          deliveryStatus: v,
                        })
                      }
                      disabled={deliveryMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
