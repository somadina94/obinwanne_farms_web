"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import { adminGetProduct, updateProduct } from "@/lib/api/services";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(4),
  priceNgn: z.string().min(1),
  stock: z.string().min(1),
  slug: z.string().optional(),
});

type Form = z.infer<typeof schema>;

function PhysicalEditForm({ product, id }: { product: Product; id: string }) {
  const router = useRouter();
  const [imageUrls] = useState(() => [...product.images]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState(product.primaryImageIndex ?? 0);

  const pendingPreviews = useMemo(
    () => pendingFiles.map((f) => URL.createObjectURL(f)),
    [pendingFiles],
  );

  useEffect(() => {
    return () => {
      pendingPreviews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [pendingPreviews]);

  const totalSlots = imageUrls.length + pendingFiles.length;
  const effectivePrimary =
    totalSlots === 0 ? 0 : Math.min(primaryIndex, totalSlots - 1);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: product.title,
      description: product.description,
      priceNgn: String(product.priceNgn),
      stock: String(product.stock ?? 0),
      slug: product.slug ?? "",
    },
  });

  const onAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list?.length) return;
    const added = Array.from(list);
    setPendingFiles((prev) => {
      const next = [...prev, ...added];
      setPrimaryIndex((pi) => Math.min(pi, imageUrls.length + next.length - 1));
      return next;
    });
    e.target.value = "";
  };

  const onSubmit = async (form: Form) => {
    const price = Number.parseFloat(form.priceNgn);
    const stock = Number.parseInt(form.stock, 10);
    if (Number.isNaN(price) || price < 0) {
      toast.error("Invalid price");
      return;
    }
    if (Number.isNaN(stock) || stock < 0) {
      toast.error("Invalid stock");
      return;
    }

    try {
      if (pendingFiles.length > 0) {
        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("description", form.description);
        fd.append("priceNgn", String(price));
        fd.append("stock", String(stock));
        if (form.slug?.trim()) fd.append("slug", form.slug.trim());
        fd.append("existingImages", JSON.stringify(imageUrls));
        fd.append("primaryImageIndex", String(effectivePrimary));
        for (const f of pendingFiles) {
          fd.append("images", f);
        }
        await updateProduct(id, fd);
      } else {
        await updateProduct(id, {
          title: form.title,
          description: form.description,
          priceNgn: price,
          stock,
          slug: form.slug?.trim() || undefined,
          primaryImageIndex: effectivePrimary,
        });
      }
      toast.success("Product updated");
      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Update failed");
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Edit physical product</CardTitle>
          <CardDescription>
            Update details, add images, and choose which photo is primary for cards and the gallery.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col">
          <CardContent className="flex-1 space-y-4 pb-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={5} {...register("description")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="priceNgn">Price (NGN)</Label>
                <Input id="priceNgn" type="number" step="0.01" {...register("priceNgn")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" {...register("stock")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input id="slug" {...register("slug")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="more-images">Add images</Label>
              <Input id="more-images" type="file" accept="image/*" multiple onChange={onAddFiles} />
              <p className="text-xs text-muted-foreground">
                New uploads are appended. Click any thumbnail to set the primary image.
              </p>
            </div>

            {totalSlots > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {imageUrls.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setPrimaryIndex(i)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-colors",
                      effectivePrimary === i
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent",
                    )}
                  >
                    <Image src={url} alt="" fill className="object-cover" sizes="120px" />
                    {effectivePrimary === i ? (
                      <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        Primary
                      </span>
                    ) : null}
                  </button>
                ))}
                {pendingPreviews.map((src, j) => {
                  const i = imageUrls.length + j;
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setPrimaryIndex(i)}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-colors",
                        effectivePrimary === i
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-transparent",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- local preview blob URLs */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      {effectivePrimary === i ? (
                        <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                          Primary
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="mt-auto flex min-h-14 flex-wrap items-center justify-center gap-2 border-t sm:justify-end">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/products">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Save changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function EditPhysicalProductPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: () => adminGetProduct(id),
    enabled: !!id,
  });

  const product = data?.data.product;

  if (!id) {
    return (
      <div className="text-center text-muted-foreground">
        Invalid product.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center text-muted-foreground">
        Product not found.{" "}
        <Link href="/admin/products" className="text-primary underline">
          Back to products
        </Link>
      </div>
    );
  }

  if (product.type === "digital") {
    return (
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Digital product</CardTitle>
            <CardDescription>
              Digital listings are not edited on this page. Use the products table to deactivate or
              remove them.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex min-h-14 items-center justify-center border-t sm:justify-end">
            <Button asChild>
              <Link href="/admin/products">Back to products</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <PhysicalEditForm key={product._id} product={product} id={id} />;
}
