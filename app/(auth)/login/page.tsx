"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { setAuthCookies } from "@/lib/auth-cookies";
import { ApiError } from "@/lib/api/client";
import { login } from "@/lib/api/services";
import { useAppDispatch } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/auth-slice";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const fromParam = params.get("from");
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      const res = await login(data);
      setAuthCookies(res.token, res.data.user.role);
      dispatch(setUser(res.data.user));
      toast.success("Welcome back!");

      const role = res.data.user.role;
      let destination = fromParam ?? "/dashboard";
      if (role === "admin") {
        if (fromParam == null || fromParam === "/dashboard") {
          destination = "/admin";
        }
      } else if (fromParam?.startsWith("/admin")) {
        destination = "/dashboard";
      }

      router.push(destination);
      router.refresh();
    } catch (e: unknown) {
      const msg =
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Login failed";
      toast.error(msg);
    }
  };

  return (
    <Card className="border-border/80 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Log in</CardTitle>
        <CardDescription>Enter your email and password to continue.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pb-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Log in
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
