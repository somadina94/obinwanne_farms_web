"use client";

import { motion } from "framer-motion";
import { BookOpen, Loader2, Package, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch } from "@/lib/store/hooks";
import { getPrimaryImageUrl } from "@/lib/product-images";
import { addItem } from "@/lib/store/cart-slice";
import type { Product } from "@/lib/types";

function formatNgn(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

export function ProductCard({
  product,
  index = 0,
  /** First card in an above-the-fold grid — sets Next/Image `priority` for LCP. */
  priorityImage = false,
}: {
  product: Product;
  index?: number;
  priorityImage?: boolean;
}) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const img = getPrimaryImageUrl(product);
  const isDigital = product.type === "digital";

  const handleAdd = () => {
    setLoading(true);
    dispatch(
      addItem({
        productId: product._id,
        title: product.title,
        priceNgn: product.priceNgn,
        type: product.type,
        image: img,
        quantity: 1,
      }),
    );
    toast.success("Added to cart", { description: product.title });
    setTimeout(() => setLoading(false), 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Card className="group flex h-full flex-col overflow-hidden border-border/80 bg-card/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
        <Link
          href={`/products/${product._id}`}
          className="flex min-h-0 flex-1 flex-col focus:outline-none"
        >
          <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-muted">
            {img ? (
              <Image
                src={img}
                alt=""
                fill
                priority={priorityImage}
                loading={priorityImage ? "eager" : "lazy"}
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width:768px) 100vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                {isDigital ? (
                  <BookOpen className="size-12 opacity-40" />
                ) : (
                  <Package className="size-12 opacity-40" />
                )}
              </div>
            )}
            <div className="absolute left-3 top-3 flex gap-2">
              <Badge
                variant={isDigital ? "secondary" : "default"}
                className="backdrop-blur-md"
              >
                {isDigital ? "Digital" : "Physical"}
              </Badge>
            </div>
          </div>
          <CardHeader className="flex-shrink-0 pb-2">
            <CardTitle className="line-clamp-2 text-base font-semibold leading-snug">
              {product.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col pb-2">
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {product.description}
            </p>
          </CardContent>
        </Link>
        <CardFooter className="mt-auto flex min-h-14 items-center justify-between gap-2 border-t border-border/60 bg-muted/30 pt-3">
          <span className="text-lg font-bold text-primary">
            {formatNgn(product.priceNgn)}
          </span>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={(e) => {
              e.preventDefault();
              handleAdd();
            }}
            disabled={loading || (product.type === "physical" && product.stock === 0)}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShoppingBag className="size-4" />
            )}
            Add
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
