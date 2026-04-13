"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import { createPhysicalProductMultipart } from "@/lib/api/services";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(4),
  priceNgn: z.string().min(1),
  stock: z.string().min(1),
  slug: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export default function NewPhysicalProductPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

  useEffect(() => {
    return () => {
      previews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previews]);

  const effectivePrimary =
    files.length === 0 ? 0 : Math.min(primaryIndex, files.length - 1);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list?.length) {
      setFiles([]);
      setPrimaryIndex(0);
      return;
    }
    const next = Array.from(list);
    setFiles(next);
    setPrimaryIndex((prev) => Math.min(prev, next.length - 1));
  };

  const onSubmit = async (data: Form) => {
    const price = Number.parseFloat(data.priceNgn);
    const stock = Number.parseInt(data.stock, 10);
    if (Number.isNaN(price) || price < 0) {
      toast.error("Invalid price");
      return;
    }
    if (Number.isNaN(stock) || stock < 0) {
      toast.error("Invalid stock");
      return;
    }

    const fd = new FormData();
    fd.append("title", data.title);
    fd.append("description", data.description);
    fd.append("priceNgn", String(price));
    fd.append("stock", String(stock));
    if (data.slug?.trim()) fd.append("slug", data.slug.trim());
    if (files.length > 0) {
      fd.append("primaryImageIndex", String(effectivePrimary));
      for (let i = 0; i < files.length; i++) {
        fd.append("images", files[i]);
      }
    }

    try {
      await createPhysicalProductMultipart(fd);
      toast.success("Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Could not create product");
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>New physical product</CardTitle>
          <CardDescription>
            Upload multiple images, pick which one is primary for the catalog, then set stock.
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
              <Textarea
                id="description"
                rows={5}
                placeholder="Product details for customers…"
                {...register("description")}
              />
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
              <Label htmlFor="images">Images</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={onFilesChange}
              />
              {files.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Click a thumbnail to set the primary image (used on product cards and as the first
                  gallery slide).
                </p>
              ) : null}
            </div>
            {previews.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {previews.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setPrimaryIndex(i)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-colors",
                      effectivePrimary === i ? "border-primary ring-2 ring-primary/30" : "border-transparent",
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
                ))}
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="mt-auto flex min-h-14 items-center justify-center border-t sm:justify-end">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Create product
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
