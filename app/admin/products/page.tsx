"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  adminListProducts,
  deactivateProduct,
  deleteProductPermanent,
  updateProduct,
} from "@/lib/api/services";
import { cn } from "@/lib/utils";

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(
    null,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: adminListProducts,
  });

  const products = data?.data.products ?? [];

  const removeFromCatalog = async (id: string) => {
    try {
      await deactivateProduct(id);
      toast.success("Removed from catalog (deactivated)");
      await qc.invalidateQueries({ queryKey: ["admin", "products"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const reactivate = async (id: string) => {
    try {
      await updateProduct(id, { isActive: true });
      toast.success("Product is active again");
      await qc.invalidateQueries({ queryKey: ["admin", "products"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const confirmDeleteForever = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProductPermanent(deleteTarget.id);
      toast.success("Product deleted permanently");
      await qc.invalidateQueries({ queryKey: ["admin", "products"] });
      setDeleteTarget(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="mt-2 text-muted-foreground">Manage catalog and uploads.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 size-4" />
              Physical
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/admin/products/digital">
              <Plus className="mr-2 size-4" />
              Digital
            </Link>
          </Button>
        </div>
      </div>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-12 text-right align-middle" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p._id}>
                <TableCell className="align-middle font-medium">{p.title}</TableCell>
                <TableCell className="align-middle">
                  <Badge variant="outline">{p.type}</Badge>
                </TableCell>
                <TableCell className="align-middle">
                  ₦{p.priceNgn.toLocaleString("en-NG")}
                </TableCell>
                <TableCell className="align-middle">
                  {p.type === "physical" ? (p.stock ?? "—") : "—"}
                </TableCell>
                <TableCell className="align-middle">{p.isActive ? "Yes" : "No"}</TableCell>
                <TableCell className="align-middle text-sm text-muted-foreground">
                  {p.updatedAt
                    ? format(new Date(p.updatedAt), "MMM d, yyyy")
                    : "—"}
                </TableCell>
                <TableCell className="align-middle text-right">
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/products/${p._id}`} target="_blank">
                            View on site
                          </Link>
                        </DropdownMenuItem>
                        {p.type === "physical" ? (
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/products/${p._id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                        ) : null}
                        {p.isActive ? (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => removeFromCatalog(p._id)}
                          >
                            Remove from catalog
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => reactivate(p._id)}>
                            Reactivate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={cn(
                            "text-destructive focus:text-destructive",
                            "[&_svg]:pointer-events-none [&_svg]:shrink-0",
                          )}
                          onSelect={(e) => {
                            e.preventDefault();
                            setDeleteTarget({ id: p._id, title: p.title });
                          }}
                        >
                          Delete permanently…
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. If{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.title ?? "this product"}
              </span>{" "}
              appears on any order, deletion will be blocked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void confirmDeleteForever()}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
