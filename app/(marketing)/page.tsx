import type { Metadata } from "next";

import { HomeHero } from "@/components/organisms/home-hero";
import { ProductCard } from "@/components/molecules/product-card";
import { API_URL, SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import type { Product } from "@/lib/types";

export const metadata: Metadata = {
  title: `${SITE_NAME} | Farm products & digital guides`,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

async function fetchProducts(type: "digital" | "physical"): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products?type=${type}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      data?: { products?: Product[] };
    };
    return json.data?.products ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [digitalAll, physicalAll] = await Promise.all([
    fetchProducts("digital"),
    fetchProducts("physical"),
  ]);
  const digital = digitalAll.slice(0, 3);
  const physical = physicalAll.slice(0, 3);

  return (
    <>
      <HomeHero />
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Featured digital</h2>
          <p className="mt-2 text-muted-foreground">E-books and guides you can download instantly</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {digital.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground">
              No digital products yet — check back soon.
            </p>
          ) : (
            digital.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} priorityImage={i === 0} />
            ))
          )}
        </div>
      </section>
      <section className="border-t border-border/60 bg-muted/20 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Featured physical</h2>
            <p className="mt-2 text-muted-foreground">
              Seedlings and farm goods we ship with care
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {physical.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground">
                No physical products listed yet.
              </p>
            ) : (
              physical.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} priorityImage={i === 0} />
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
