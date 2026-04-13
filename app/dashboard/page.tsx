"use client";

import { ArrowRight, Package } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppSelector } from "@/lib/store/hooks";

export default function DashboardHomePage() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Hello, {user?.name?.split(" ")[0] ?? "friend"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage orders, downloads, and your profile from here.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-5 text-primary" />
              Orders
            </CardTitle>
            <CardDescription>Track status and download digital purchases.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="gap-2">
              <Link href="/dashboard/orders">
                View orders
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update contact details and password.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/dashboard/profile">
                Edit profile
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
