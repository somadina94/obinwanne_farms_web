"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MapPin, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PageTransition } from "@/components/molecules/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import { submitContact } from "@/lib/api/services";
import {
  COMPANY_ADDRESS,
  COMPANY_BUSINESS_HOURS,
  COMPANY_EMAIL,
  COMPANY_PHONE,
  SITE_NAME,
} from "@/lib/constants";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().min(7, "Please enter a valid phone number"),
  message: z
    .string()
    .trim()
    .min(20, "Message should be at least 20 characters")
    .max(1000, "Message should not exceed 1000 characters"),
});

type Form = z.infer<typeof schema>;

const defaultValues: Form = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues });

  const onSubmit = async (data: Form) => {
    try {
      const res = await submitContact(data);
      toast.success(res.message || "Message sent successfully.");
      reset(defaultValues);
    } catch (e: unknown) {
      const msg =
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Failed to send message";
      toast.error(msg);
    }
  };

  return (
    <PageTransition className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-5">
        <Card className="border-border/70 bg-card/70 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Get in touch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm text-muted-foreground">
            <p>
              We are always happy to hear from you. Share your request and our team at {SITE_NAME} will
              respond shortly.
            </p>
            <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 text-primary" />
                <span>{COMPANY_ADDRESS}</span>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="size-4 text-primary" />
                <span>{COMPANY_PHONE}</span>
              </p>
              <p>
                Email:{" "}
                <a href={`mailto:${COMPANY_EMAIL}`} className="font-medium text-primary hover:underline">
                  {COMPANY_EMAIL}
                </a>
              </p>
            </div>
            <p className="text-xs">Business hours: {COMPANY_BUSINESS_HOURS}.</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xl shadow-primary/10 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-2xl">Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" autoComplete="name" {...register("name")} />
                  {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" autoComplete="tel" {...register("phone")} />
                  {errors.phone ? (
                    <p className="text-xs text-destructive">{errors.phone.message}</p>
                  ) : null}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" autoComplete="email" {...register("email")} />
                {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={6}
                  placeholder="Tell us what you need, and we will get back to you."
                  {...register("message")}
                />
                {errors.message ? (
                  <p className="text-xs text-destructive">{errors.message.message}</p>
                ) : null}
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full gap-2 sm:w-auto">
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                Send message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
