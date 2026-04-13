"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, Loader2, Package, ShoppingBag } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { adminListOrders, adminListProducts } from "@/lib/api/services";

export default function AdminStatsPage() {
  const ordersQ = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminListOrders(),
  });
  const productsQ = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => adminListProducts(),
  });

  const orders = ordersQ.data?.data.orders ?? [];
  const products = productsQ.data?.data.products ?? [];

  const paid = orders.filter((o) => o.paymentStatus === "paid");
  const revenue = paid.reduce((s, o) => s + o.totalNgn, 0);
  const pendingPay = orders.filter((o) => o.paymentStatus === "pending").length;

  const byDay = (() => {
    const map = new Map<string, number>();
    for (const o of paid) {
      const d = o.paidAt ?? o.createdAt;
      if (!d) continue;
      const day = d.slice(0, 10);
      map.set(day, (map.get(day) ?? 0) + o.totalNgn);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, total]) => ({ date, total }));
  })();

  const chartConfig = {
    total: { label: "Revenue (₦)", color: "var(--chart-1)" },
  };

  if (ordersQ.isLoading || productsQ.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
        <p className="mt-2 text-muted-foreground">
          Revenue and catalog snapshot from live data.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total revenue</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₦{revenue.toLocaleString("en-NG")}</p>
            <p className="text-xs text-muted-foreground">Paid orders only</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-xs text-muted-foreground">{pendingPay} pending payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{products.length}</p>
            <p className="text-xs text-muted-foreground">
              {products.filter((p) => p.type === "digital").length} digital ·{" "}
              {products.filter((p) => p.type === "physical").length} physical
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{paid.length}</p>
            <p className="text-xs text-muted-foreground">Successful checkouts</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Revenue by day</CardTitle>
          <CardDescription>Last 14 days with recorded payments</CardDescription>
        </CardHeader>
        <CardContent className="h-80 pt-2">
          {byDay.length === 0 ? (
            <p className="text-sm text-muted-foreground">No paid orders yet.</p>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-full min-h-0 w-full"
            >
              <BarChart data={byDay} accessibilityLayer margin={{ left: 4, right: 8 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  strokeOpacity={0.5}
                />
                <XAxis dataKey="date" tickLine={false} tickMargin={8} fontSize={12} />
                <YAxis
                  tickLine={false}
                  fontSize={12}
                  tickFormatter={(v) => {
                    if (typeof v !== "number") return String(v);
                    if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
                    if (v >= 10_000) return `₦${Math.round(v / 1000)}k`;
                    return `₦${v.toLocaleString("en-NG")}`;
                  }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={6} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
