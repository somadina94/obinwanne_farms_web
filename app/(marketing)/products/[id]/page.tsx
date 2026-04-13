"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Minus, Package, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getProduct } from "@/lib/api/services";
import { getPrimaryImageUrl } from "@/lib/product-images";
import { useAppDispatch } from "@/lib/store/hooks";
import { addItem } from "@/lib/store/cart-slice";
import type { Product } from "@/lib/types";

function formatNgn(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

function initialGalleryIndex(product: Product) {
  const images = product.images ?? [];
  if (images.length === 0) return 0;
  const p = product.primaryImageIndex ?? 0;
  return Math.max(0, Math.min(Math.floor(p), images.length - 1));
}

function ProductGallery({ product }: { product: Product }) {
  const images = product.images ?? [];
  const [galleryIndex, setGalleryIndex] = useState(() => initialGalleryIndex(product));
  const mainSrc = images[galleryIndex];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
        {mainSrc ? (
          <>
            <Image
              src={mainSrc}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 50vw"
              priority
              loading="eager"
            />
            {images.length > 1 ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full shadow-md"
                  onClick={() =>
                    setGalleryIndex((i) => (i - 1 + images.length) % images.length)
                  }
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full shadow-md"
                  onClick={() => setGalleryIndex((i) => (i + 1) % images.length)}
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </>
            ) : null}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Package className="size-20 opacity-30" />
          </div>
        )}
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setGalleryIndex(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition-colors ${
                galleryIndex === i ? "border-primary ring-2 ring-primary/25" : "border-transparent"
              }`}
            >
              <Image src={url} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [qty, setQty] = useState(1);
  const dispatch = useAppDispatch();
  const { data, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });

  const product = data?.data.product;

  const handleAdd = () => {
    if (!product) return;
    dispatch(
      addItem({
        productId: product._id,
        title: product.title,
        priceNgn: product.priceNgn,
        type: product.type,
        image: getPrimaryImageUrl(product),
        quantity: qty,
      }),
    );
    toast.success("Added to cart", { description: `${qty}× ${product.title}` });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
        <Skeleton className="mt-6 h-10 w-2/3" />
        <Skeleton className="mt-4 h-24 w-full" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
        Product not found.
      </div>
    );
  }

  const outOfStock = product.type === "physical" && product.stock === 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery
          key={`${product._id}-${product.updatedAt ?? ""}-${(product.images ?? []).length}-${product.primaryImageIndex ?? 0}`}
          product={product}
        />
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge>{product.type === "digital" ? "Digital" : "Physical"}</Badge>
            {product.type === "physical" && product.stock !== null ? (
              <Badge variant="outline">{product.stock} in stock</Badge>
            ) : null}
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">{product.title}</h1>
          <p className="mt-4 text-3xl font-bold text-primary">{formatNgn(product.priceNgn)}</p>
          <Separator className="my-6" />
          <p className="leading-relaxed text-muted-foreground">{product.description}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 rounded-xl border px-2 py-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center font-medium">{qty}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setQty((q) =>
                    product.type === "physical" && product.stock !== null
                      ? Math.min(product.stock, q + 1)
                      : q + 1,
                  )
                }
                disabled={
                  product.type === "physical" &&
                  product.stock !== null &&
                  qty >= product.stock
                }
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <Button
              size="lg"
              className="gap-2"
              disabled={outOfStock}
              onClick={handleAdd}
            >
              <ShoppingBag className="size-5" />
              Add to cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
