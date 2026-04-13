"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-accent/20" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Badge variant="secondary" className="gap-1 px-3 py-1">
            <Sparkles className="size-3.5" />
            Farm-fresh &amp; digital excellence
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Grow with{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
              nature&apos;s best
            </span>
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            Seedlings, harvests, and expert e-guides — curated for growers and readers who care about
            quality.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" asChild>
              <Link href="/products">
                Shop now
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">Our story</Link>
            </Button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="relative aspect-[4/3] w-full max-w-xl justify-self-end overflow-hidden rounded-3xl border border-border/50 bg-muted shadow-2xl shadow-primary/10"
        >
          <Image
            src="/assets/hero.jpg"
            alt="Lush farmland at golden hour"
            fill
            priority
            loading="eager"
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
