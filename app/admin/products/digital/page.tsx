"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
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
import { createDigitalProduct } from "@/lib/api/services";

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(4),
  priceNgn: z.string().min(1, "Price required"),
  slug: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export default function NewDigitalProductPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a file (PDF recommended)");
      return;
    }

    const fd = new FormData();
    fd.append("title", data.title);
    fd.append("description", data.description);
    const price = Number.parseFloat(data.priceNgn);
    if (Number.isNaN(price) || price < 0) {
      toast.error("Invalid price");
      return;
    }
    fd.append("priceNgn", String(price));
    if (data.slug?.trim()) fd.append("slug", data.slug.trim());
    fd.append("file", file);

    try {
      await createDigitalProduct(fd);
      toast.success("Digital product created");
      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>New digital product</CardTitle>
          <CardDescription>Upload the master file to Backblaze (e.g. PDF).</CardDescription>
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
                placeholder="What buyers get, format, etc."
                {...register("description")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceNgn">Price (NGN)</Label>
              <Input id="priceNgn" type="number" step="0.01" {...register("priceNgn")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input id="slug" {...register("slug")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">File</Label>
              <Input id="file" ref={fileRef} type="file" required />
            </div>
          </CardContent>
          <CardFooter className="flex min-h-14 items-center justify-center border-t sm:justify-end">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Publish
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
