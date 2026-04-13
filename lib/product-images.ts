import type { Product } from "@/lib/types";

/** Resolves which image URL is the catalog primary (card, cart line, default gallery slide). */
export function getPrimaryImageUrl(
  product: Pick<Product, "images" | "primaryImageIndex">,
): string | undefined {
  const imgs = product.images ?? [];
  if (imgs.length === 0) return undefined;
  const raw = product.primaryImageIndex ?? 0;
  const i = Math.max(0, Math.min(Math.floor(raw), imgs.length - 1));
  return imgs[i];
}
