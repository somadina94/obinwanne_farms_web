"use client";

import { motion } from "framer-motion";
import { Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { checkout } from "@/lib/api/services";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { clearCart, removeItem, setQty } from "@/lib/store/cart-slice";
import { getTokenFromCookie } from "@/lib/auth-cookies";

function formatNgn(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);
  const [paying, setPaying] = useState(false);

  const total = items.reduce((s, i) => s + i.priceNgn * i.quantity, 0);

  const handleCheckout = async () => {
    if (!items.length) return;
    if (!getTokenFromCookie()) {
      toast.error("Please log in to checkout");
      router.push("/login?from=/cart");
      return;
    }
    setPaying(true);
    try {
      const res = await checkout({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });
      dispatch(clearCart());
      const url = res.data.paystack.authorizationUrl;
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Could not start payment");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Checkout failed";
      toast.error(msg);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight">Your cart</h1>
      <p className="mt-2 text-muted-foreground">Review items before secure checkout with Paystack.</p>
      {items.length === 0 ? (
        <Card className="mt-10 border-dashed">
          <CardContent className="flex flex-col items-center py-16">
            <ShoppingCart className="mb-4 size-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button className="mt-6" asChild>
              <Link href="/products">Browse products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((item, lineIndex) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="flex gap-4 p-4">
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="96px"
                          priority={lineIndex === 0}
                          loading={lineIndex === 0 ? "eager" : "lazy"}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-snug">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatNgn(item.priceNgn)} each · {item.type}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() =>
                            dispatch(
                              setQty({
                                productId: item.productId,
                                quantity: item.quantity - 1,
                              }),
                            )
                          }
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() =>
                            dispatch(
                              setQty({
                                productId: item.productId,
                                quantity: item.quantity + 1,
                              }),
                            )
                          }
                        >
                          <Plus className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto text-destructive"
                          onClick={() => {
                            dispatch(removeItem(item.productId));
                            toast("Removed from cart");
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card className="h-fit lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-medium">{formatNgn(total)}</span>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatNgn(total)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleCheckout}
                disabled={paying}
              >
                {paying ? <Loader2 className="size-4 animate-spin" /> : null}
                Pay with Paystack
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                You&apos;ll complete payment on Paystack&apos;s secure page.
              </p>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
