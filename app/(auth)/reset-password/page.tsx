"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
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
import { resetPassword as resetPasswordApi } from "@/lib/api/services";
import { useAppDispatch } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/auth-slice";

const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

type Form = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    if (!token) {
      toast.error("Invalid or missing reset link. Request a new one from forgot password.");
      return;
    }
    try {
      const res = await resetPasswordApi({
        token,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      });
      setAuthCookies(res.token, res.data.user.role);
      dispatch(setUser(res.data.user));
      toast.success(res.message ?? "Password updated. You are logged in.");
      const dest = res.data.user.role === "admin" ? "/admin" : "/dashboard";
      router.push(dest);
      router.refresh();
    } catch (e: unknown) {
      const msg =
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Could not reset password";
      toast.error(msg);
    }
  };

  if (!token) {
    return (
      <Card className="border-border/80 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Invalid link</CardTitle>
          <CardDescription>
            This reset link is missing or incomplete. Request a new password reset email.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/forgot-password">Forgot password</Link>
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/login">Back to log in</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Set new password</CardTitle>
        <CardDescription>Choose a strong password for your account.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pb-5">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">Confirm new password</Label>
            <Input
              id="passwordConfirm"
              type="password"
              autoComplete="new-password"
              {...register("passwordConfirm")}
            />
            {errors.passwordConfirm ? (
              <p className="text-xs text-destructive">{errors.passwordConfirm.message}</p>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Update password
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Back to log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Card className="border-border/80 shadow-lg">
          <CardContent className="flex justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
