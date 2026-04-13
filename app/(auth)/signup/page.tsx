"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { SearchableSelect } from "@/components/molecules/searchable-select";
import { setAuthCookies } from "@/lib/auth-cookies";
import { ApiError } from "@/lib/api/client";
import { fetchCountryStates, fetchStateCities } from "@/lib/api/countries-locations";
import { signUp } from "@/lib/api/services";
import { LOCATIONS_API_COUNTRY_NAME } from "@/lib/constants/locations";
import {
  isValidNgMobileNational,
  normalizeNationalDigits,
  toE164Nigeria,
} from "@/lib/phone-ng";
import { SITE_NAME } from "@/lib/constants";
import { useAppDispatch } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/auth-slice";

const schema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    passwordConfirm: z.string(),
    phoneLocal: z.string().min(1, "Enter your mobile number"),
    address: z.string().min(3, "Address is required"),
    stateName: z.string().min(1, "Select your state"),
    city: z.string().min(1, "Select your city"),
    zip: z.string().min(3, "ZIP / postal code is required"),
    acceptTerms: z
      .boolean()
      .refine((v) => v === true, {
        message: "You must accept the terms and privacy policy",
      }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  })
  .refine((data) => isValidNgMobileNational(data.phoneLocal), {
    message: "Enter a valid Nigerian mobile (10 digits after +234, e.g. 8012345678)",
    path: ["phoneLocal"],
  });

type Form = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    data: stateRows = [],
    isLoading: statesLoading,
    isError: statesError,
    error: statesErr,
  } = useQuery({
    queryKey: ["country-states", LOCATIONS_API_COUNTRY_NAME],
    queryFn: () => fetchCountryStates(LOCATIONS_API_COUNTRY_NAME),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const stateOptions = stateRows.map((s) => ({
    value: s.name,
    label: s.name,
  }));

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { acceptTerms: false },
  });

  const stateName = watch("stateName");
  const acceptTerms = watch("acceptTerms");

  const {
    data: cityNames = [],
    isLoading: citiesLoading,
    isError: citiesError,
    error: citiesErr,
  } = useQuery({
    queryKey: ["state-cities", LOCATIONS_API_COUNTRY_NAME, stateName],
    queryFn: () => fetchStateCities(stateName, LOCATIONS_API_COUNTRY_NAME),
    enabled: Boolean(stateName),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const cityOptions = cityNames.map((c) => ({ value: c, label: c }));

  useEffect(() => {
    setValue("city", "");
  }, [stateName, setValue]);

  const onSubmit = async (data: Form) => {
    try {
      const phone = toE164Nigeria(data.phoneLocal);
      const res = await signUp({
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        phone,
        address: data.address,
        city: data.city,
        state: data.stateName,
        zip: data.zip,
      });
      setAuthCookies(res.token, res.data.user.role);
      dispatch(setUser(res.data.user));
      toast.success("Account created!");
      router.push("/dashboard");
      router.refresh();
    } catch (e: unknown) {
      const msg =
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Sign up failed";
      toast.error(msg);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-xl border-border/80 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Join {SITE_NAME} to shop and track orders.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 overflow-y-auto pr-1 pb-5 sm:max-h-[calc(100vh-12rem)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" autoComplete="given-name" {...register("firstName")} />
              {errors.firstName ? (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" autoComplete="family-name" {...register("lastName")} />
              {errors.lastName ? (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email ? (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Confirm password</Label>
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

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="phoneLocal">Mobile number</Label>
              <p className="text-xs text-muted-foreground">
                Nigerian numbers: country code is fixed. Enter 10 digits (e.g.{" "}
                <span className="font-mono text-foreground">8012345678</span>) — no leading{" "}
                <span className="font-mono">0</span>.
              </p>
              <div
                className="flex rounded-lg border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
                aria-invalid={errors.phoneLocal ? true : undefined}
              >
                <span className="flex shrink-0 items-center border-r border-input bg-muted/60 px-3 text-sm font-semibold tracking-tight text-muted-foreground">
                  +234
                </span>
                <Input
                  id="phoneLocal"
                  className="h-10 min-w-0 flex-1 border-0 bg-transparent px-3 py-2 shadow-none focus-visible:ring-0 md:text-sm"
                  placeholder="8012345678"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={10}
                  aria-invalid={errors.phoneLocal ? true : undefined}
                  {...register("phoneLocal", {
                    onChange: (e) => {
                      const v = normalizeNationalDigits(e.target.value);
                      e.target.value = v;
                    },
                  })}
                />
              </div>
              {errors.phoneLocal ? (
                <p className="text-xs text-destructive">{errors.phoneLocal.message}</p>
              ) : null}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Street address</Label>
              <Input id="address" autoComplete="street-address" {...register("address")} />
            </div>

            <div className="space-y-2">
              <Label id="state-label">State</Label>
              <Controller
                name="stateName"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    id="stateName"
                    value={field.value}
                    onChange={field.onChange}
                    options={stateOptions}
                    placeholder={statesLoading ? "Loading states…" : "Search states…"}
                    searchPlaceholder="Search states…"
                    emptyText="No state found."
                    disabled={statesLoading}
                    aria-invalid={!!errors.stateName}
                  />
                )}
              />
              {statesError ? (
                <p className="text-xs text-destructive">
                  {statesErr instanceof Error ? statesErr.message : "Could not load states."}
                </p>
              ) : null}
              {errors.stateName ? (
                <p className="text-xs text-destructive">{errors.stateName.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label id="city-label">City / LGA</Label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    id="city"
                    value={field.value}
                    onChange={field.onChange}
                    options={cityOptions}
                    placeholder={
                      !stateName
                        ? "Select state first"
                        : citiesLoading
                          ? "Loading cities…"
                          : "Search cities…"
                    }
                    searchPlaceholder="Search cities…"
                    emptyText="No city found."
                    disabled={!stateName || citiesLoading}
                    aria-invalid={!!errors.city}
                  />
                )}
              />
              {stateName && citiesError ? (
                <p className="text-xs text-destructive">
                  {citiesErr instanceof Error ? citiesErr.message : "Could not load cities."}
                </p>
              ) : null}
              {errors.city ? (
                <p className="text-xs text-destructive">{errors.city.message}</p>
              ) : null}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="zip">ZIP / postal code</Label>
              <Input id="zip" autoComplete="postal-code" {...register("zip")} />
              {errors.zip ? (
                <p className="text-xs text-destructive">{errors.zip.message}</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-4 sm:p-5">
            <div className="flex gap-4">
              <Checkbox
                id="accept"
                checked={!!acceptTerms}
                onCheckedChange={(c) =>
                  setValue("acceptTerms", c === true, { shouldValidate: true })
                }
                className="mt-0.5 shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-2">
                <Label
                  htmlFor="accept"
                  className="cursor-pointer text-sm font-semibold leading-snug text-foreground"
                >
                  Agree to terms &amp; privacy
                </Label>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  I confirm that I have read and understood the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline underline-offset-4 hover:text-primary/90"
                  >
                    Terms &amp; conditions
                  </Link>
                  <span className="text-muted-foreground"> and the </span>
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline underline-offset-4 hover:text-primary/90"
                  >
                    Privacy policy
                  </Link>
                  <span className="text-muted-foreground">.</span>
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground/90">
                  You must accept both documents to create an account. Links open in a new tab so you
                  can read them in full.
                </p>
              </div>
            </div>
          </div>
          {errors.acceptTerms ? (
            <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Create account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
