"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { LogIn, Loader2 } from "lucide-react";
import { z } from "zod";

import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";
import { normalizeApiError } from "@/lib/api/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const PARTNER_ROLES = [
    "PARTNER_AIRLINE",
    "PARTNER_HOTEL",
    "PARTNER_CAR_RENTAL",
    "PARTNER_FURNISHED_RENTAL",
] as const;

export default function LoginPage() {
    const t = useTranslations("Auth");
    const { login } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Schéma de validation localisé
    const schema = useMemo(
        () =>
            z.object({
                email: z.string().trim().email(t("emailInvalid")),
                password: z.string().min(1, t("passwordRequired")),
            }),
        [t]
    );

    type FormValues = z.infer<typeof schema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: "", password: "" },
    });

    async function onSubmit(values: FormValues) {
        setIsSubmitting(true);
        setError(null);
        try {
            const profile = await login(values);

            if (profile.role === "ADMIN") {
                router.push("/admin");
            } else if (
                PARTNER_ROLES.includes(profile.role as (typeof PARTNER_ROLES)[number])
            ) {
                router.push("/partner");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError(normalizeApiError(err).message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="grid min-h-[calc(100vh-4rem)] w-full grid-cols-1 lg:grid-cols-12">
            {/* COLONNE GAUCHE : VISUEL IMMERSIF (Masqué sur mobile) */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#7bcd4f] to-[#15a4e6] p-8 text-white lg:col-span-5 lg:flex xl:col-span-6 xl:p-12">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-10 [background-size:20px_20px]" />
                <div className="pointer-events-none absolute top-1/4 -right-20 size-72 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-10 -left-10 size-64 rounded-full bg-black/20 blur-2xl" />

                {/* LOGO OU BRANDING DESKTOP */}
                <Link
                    href="/"
                    className="relative z-10 flex w-fit items-center gap-3 transition-transform hover:scale-102"
                >
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-md shadow-sm">
                        <Image
                            src="/logo.png"
                            alt="Guen's Travel Logo"
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                            priority
                        />
                    </div>
                    <span className="font-black text-base uppercase tracking-wider text-white drop-shadow-sm">
            Guen's Travel
          </span>
                </Link>

                {/* CONTENU TEXTUEL CENTRAL */}
                <div className="relative z-10 space-y-4 max-w-md">
                    <h2 className="text-3xl font-black leading-tight tracking-tight xl:text-4xl">
                        {t("bannerTitle")}
                    </h2>
                    <p className="text-sm font-medium leading-relaxed text-white/80">
                        {t("bannerDescription")}
                    </p>
                </div>

                {/* PIED DE PAGE / STATS */}
                <div className="relative z-10 flex flex-col gap-3 border-t border-white/10 pt-6">
                    <div className="flex items-center gap-3">
                        <div className="-space-x-2 flex">
              <span className="flex size-7 items-center justify-center rounded-full border-2 border-slate-900 bg-emerald-500 text-[10px] font-bold">
                ✓
              </span>
                            <span className="flex size-7 items-center justify-center rounded-full border-2 border-slate-900 bg-amber-500 text-[10px] font-bold">
                ★
              </span>
                        </div>
                        <p className="text-xs font-semibold text-white/70">
                            {t("bannerStat")}
                        </p>
                    </div>
                </div>
            </div>

            {/* COLONNE DROITE : FORMULAIRE DE CONNEXION */}
            <div className="flex items-center justify-center bg-background p-4 sm:p-8 md:p-12 lg:col-span-7 xl:col-span-6">
                <div className="w-full max-w-sm space-y-6 sm:max-w-[390px] sm:space-y-8">
                    {/* EN-TÊTE ÉPURÉ & LOGO MOBILE */}
                    <div className="space-y-2">
                        <Link
                            href="/"
                            className="group mb-4 inline-flex items-center gap-2.5 lg:hidden"
                        >
                            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 p-2 transition-transform group-hover:scale-105">
                                <Image
                                    src="/logo.png"
                                    alt="Guen's Travel Logo"
                                    width={28}
                                    height={28}
                                    className="size-7 object-contain"
                                    priority
                                />
                            </div>
                            <span className="font-black text-xs uppercase tracking-wider text-foreground sm:text-sm">
                Guen's Travel
              </span>
                        </Link>

                        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                            {t("loginTitle")}
                        </h1>
                        <p className="text-xs font-medium text-muted-foreground/80 sm:text-sm">
                            {t("loginSubtitle")}
                        </p>
                    </div>

                    {error && (
                        <Alert className="rounded-xl border-destructive/20 bg-destructive/5 text-destructive py-3">
                            <AlertDescription className="text-xs font-semibold leading-relaxed">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4 sm:space-y-4.5"
                        >
                            {/* CHAMP : ADRESSE EMAIL */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs font-bold uppercase tracking-wide text-muted-foreground/90">
                                            {t("email")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                autoComplete="email"
                                                placeholder={t("emailPlaceholder")}
                                                className="h-10 rounded-xl border-border/70 text-sm font-medium transition-all placeholder:text-muted-foreground/45 focus-visible:ring-primary/20"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[11px] font-bold text-destructive" />
                                    </FormItem>
                                )}
                            />

                            {/* CHAMP : MOT DE PASSE */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-xs font-bold uppercase tracking-wide text-muted-foreground/90">
                                                {t("password")}
                                            </FormLabel>
                                            <Link
                                                href="/forgot-password"
                                                className="text-xs font-bold text-primary underline-offset-4 hover:underline transition-all"
                                            >
                                                {t("forgotPassword")}
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="h-10 rounded-xl border-border/70 text-sm font-medium transition-all placeholder:text-muted-foreground/45 focus-visible:ring-primary/20"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[11px] font-bold text-destructive" />
                                    </FormItem>
                                )}
                            />

                            {/* BOUTON DE CONNEXION */}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="mt-3 h-11 w-full gap-1.5 rounded-xl font-bold text-xs shadow-2xs transition-all active:scale-98"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="size-4 shrink-0 animate-spin" />
                                        {t("loggingIn")}
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="size-3.5 stroke-[2.2]" />
                                        {t("loginSubmit")}
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>

                    <SocialLoginButtons />

                    {/* LIEN D'INSCRIPTION */}
                    <div className="pt-2 text-center text-xs font-medium text-muted-foreground/90 sm:text-sm">
                        {t("noAccount")}{" "}
                        <Link
                            href="/register"
                            className="font-bold text-primary underline-offset-4 hover:underline transition-all"
                        >
                            {t("switchToRegister")}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}