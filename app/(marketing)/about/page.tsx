import type { Metadata } from "next";
import { Heart, Leaf, Users } from "lucide-react";

import { PageTransition } from "@/components/molecules/page-transition";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About us",
  description: `Learn about ${SITE_NAME} — our mission, our farm, and the people behind your produce.`,
};

export default function AboutPage() {
  return (
    <PageTransition className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight">About {SITE_NAME}</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        We are a farm-first business focused on healthy seedlings, honest harvests, and practical
        knowledge you can use — whether you&apos;re planting rows or reading on your tablet.
      </p>
      <ul className="mt-10 space-y-8">
        <li className="flex gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Leaf className="size-6" />
          </span>
          <div>
            <h2 className="text-xl font-semibold">Rooted in the soil</h2>
            <p className="mt-2 text-muted-foreground">
              Our physical products are nurtured with care — from palm seedlings to seasonal crops —
              ready for your field or garden.
            </p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Heart className="size-6" />
          </span>
          <div>
            <h2 className="text-xl font-semibold">Knowledge that travels</h2>
            <p className="mt-2 text-muted-foreground">
              Our digital guides bring agronomy and business insight to your screen — download
              after purchase and learn at your pace.
            </p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Users className="size-6" />
          </span>
          <div>
            <h2 className="text-xl font-semibold">People you can trust</h2>
            <p className="mt-2 text-muted-foreground">
              We answer messages, update delivery status honestly, and stand behind what we sell.
            </p>
          </div>
        </li>
      </ul>
    </PageTransition>
  );
}
