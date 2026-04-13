"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { ProductCard } from "@/components/molecules/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listProducts } from "@/lib/api/services";
import type { Product } from "@/lib/types";

export default function ProductsPage() {
  const digital = useQuery({
    queryKey: ["products", "digital"],
    queryFn: () => listProducts({ type: "digital" }),
  });
  const physical = useQuery({
    queryKey: ["products", "physical"],
    queryFn: () => listProducts({ type: "physical" }),
  });

  const renderGrid = (data: Product[] | undefined, loading: boolean) => {
    if (loading) {
      return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[360px] rounded-xl" />
          ))}
        </div>
      );
    }
    if (!data?.length) {
      return (
        <p className="py-16 text-center text-muted-foreground">No products in this category yet.</p>
      );
    }
    return (
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.06 } },
        }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {data.map((p, i) => (
          <ProductCard key={p._id} product={p} index={i} priorityImage={i === 0} />
        ))}
      </motion.div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Shop</h1>
        <p className="mt-2 text-muted-foreground">
          Digital guides and physical farm products in one place.
        </p>
      </div>
      <Tabs defaultValue="physical" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="physical">Physical</TabsTrigger>
          <TabsTrigger value="digital">Digital</TabsTrigger>
        </TabsList>
        <TabsContent value="physical">
          {renderGrid(physical.data?.data.products, physical.isLoading)}
        </TabsContent>
        <TabsContent value="digital">
          {renderGrid(digital.data?.data.products, digital.isLoading)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
