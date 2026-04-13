"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { ApiError } from "@/lib/api/client";
import { updateMe, updatePassword } from "@/lib/api/services";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/auth-slice";

const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(5),
  address: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2),
  zip: z.string().min(3),
});

const passSchema = z
  .object({
    passwordCurrent: z.string().min(1),
    password: z.string().min(8),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        zip: user.zip,
      });
    }
  }, [user, profileForm]);

  const passForm = useForm({
    resolver: zodResolver(passSchema),
    defaultValues: {
      passwordCurrent: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onProfile = async (data: z.infer<typeof profileSchema>) => {
    try {
      const res = await updateMe(data);
      dispatch(setUser(res.data.user));
      toast.success("Profile updated");
    } catch (e: unknown) {
      toast.error(e instanceof ApiError ? e.message : "Update failed");
    }
  };

  const onPass = async (data: z.infer<typeof passSchema>) => {
    try {
      const res = await updatePassword(data);
      dispatch(setUser(res.data.user));
      toast.success("Password changed");
      passForm.reset();
    } catch (e: unknown) {
      toast.error(e instanceof ApiError ? e.message : "Could not change password");
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-2 text-muted-foreground">{user.email}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Contact details</CardTitle>
          <CardDescription>Update how we reach you for deliveries.</CardDescription>
        </CardHeader>
        <form onSubmit={profileForm.handleSubmit(onProfile)}>
          <CardContent className="space-y-4 pb-5">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...profileForm.register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...profileForm.register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...profileForm.register("address")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...profileForm.register("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...profileForm.register("state")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP</Label>
              <Input id="zip" {...profileForm.register("zip")} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={profileForm.formState.isSubmitting} className="gap-2">
              {profileForm.formState.isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Save changes
            </Button>
          </CardFooter>
        </form>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your login password.</CardDescription>
        </CardHeader>
        <form onSubmit={passForm.handleSubmit(onPass)}>
          <CardContent className="space-y-4 pb-5">
            <div className="space-y-2">
              <Label htmlFor="passwordCurrent">Current password</Label>
              <Input
                id="passwordCurrent"
                type="password"
                {...passForm.register("passwordCurrent")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" {...passForm.register("password")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Confirm new password</Label>
              <Input
                id="passwordConfirm"
                type="password"
                {...passForm.register("passwordConfirm")}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={passForm.formState.isSubmitting} className="gap-2">
              {passForm.formState.isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Update password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
