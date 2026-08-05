"use client";

import { Suspense, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { KeyRound, Loader2, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { z } from "zod";

import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";
import { normalizeApiError } from "@/lib/api/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
                    <Skeleton className="h-96 w-full max-w-[390px] rounded-2xl" />
                </div>
            }
        >
            <ResetPasswordPageContent />
        </Suspense>
    );
}

function ResetPasswordPageContent() {
    const t = useTranslations("Auth");
    const { resetPassword } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const schema = useMemo(
        () =>
            z
                .object({
                    newPassword: z.string().min(8, t("passwordMinLength")),
                    confirmPassword: z.string().min(1, t("passwordRequired")),
                })
                .refine((data) => data.newPassword === data.confirmPassword, {
                    message: t("passwordsDontMatch"),
                    path: ["confirmPassword"],
                }),
        [t]
    );

    type FormValues = z.infer<typeof schema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    async function onSubmit(values: FormValues) {
        if (!token) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await resetPassword(token, values.newPassword);
            setIsSuccess(true);
        } catch (err) {
            setError(normalizeApiError(err).message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-12 w-full">

            {/* COLONNE GAUCHE : VISUEL IMMERSIF (Masqué sur mobile) */}
            <div className="relative hidden lg:flex lg:col-span-5 xl:col-span-6 flex-col justify-between p-12 text-white overflow-hidden bg-gradient-to-br from-[#7bcd4f] to-[#15a4e6]">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
                <div className="absolute top-1/4 -right-20 size-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 -left-10 size-64 rounded-full bg-black/20 blur-2xl pointer-events-none" />

                <Link href="/" className="relative z-10 flex items-center gap-3 w-fit transition-transform hover:scale-102">
                    <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
                        <Image
                            src="/logo.png"
                            alt="Guen's Travel Logo"
                            width={32}
                            height={32}
                            className="size-8 object-contain"
                            priority
                        />
                    </div>
                    <span className="font-black text-base tracking-wider uppercase text-white drop-shadow-sm">
            Guen's Travel
          </span>
                </Link>

                <div className="relative z-10 space-y-4 max-w-md">
                    <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight">
                        {t("bannerTitle")}
                    </h2>
                    <p className="text-sm text-white/80 leading-relaxed font-medium">
                        {t("bannerDescription")}
                    </p>
                </div>

                <div className="relative z-10 flex flex-col gap-3 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500 border-2 border-slate-900 text-[10px] font-bold">✓</span>
                            <span className="flex size-7 items-center justify-center rounded-full bg-amber-500 border-2 border-slate-900 text-[10px] font-bold">★</span>
                        </div>
                        <p className="text-xs text-white/70 font-semibold">
                            {t("bannerStat")}
                        </p>
                    </div>
                </div>
            </div>

            {/* COLONNE DROITE : FORMULAIRE */}
            <div className="lg:col-span-7 xl:col-span-6 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-background">
                <div className="w-full max-w-[390px] space-y-8">

                    <div className="space-y-2">
                        <Link href="/" className="lg:hidden inline-flex items-center gap-2.5 mb-4 group">
                            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 p-2 transition-transform group-hover:scale-105">
                                <Image
                                    src="/logo.png"
                                    alt="Guen's Travel Logo"
                                    width={28}
                                    height={28}
                                    className="size-7 object-contain"
                                    priority
                                />
                            </div>
                            <span className="font-black text-sm tracking-wider uppercase text-foreground">
                Guen's Travel
              </span>
                        </Link>

                        {!isSuccess ? (
                            <>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                                    {t("resetPasswordTitle")}
                                </h1>
                                <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium">
                                    {t("resetPasswordSubtitle")}
                                </p>
                            </>
                        ) : (
                            <>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                                    {t("resetPasswordSuccessTitle")}
                                </h1>
                                <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium">
                                    {t("resetPasswordSuccessSubtitle")}
                                </p>
                            </>
                        )}
                    </div>

                    {!token ? (
                        <Alert className="rounded-xl border-destructive/20 bg-destructive/5 text-destructive py-3">
                            <ShieldAlert className="size-4 shrink-0" />
                            <AlertDescription className="text-xs font-semibold leading-relaxed">
                                {t("resetPasswordMissingToken")}
                            </AlertDescription>
                        </Alert>
                    ) : isSuccess ? (
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-muted/30 p-6 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                                <CheckCircle2 className="size-6" />
                            </div>
                            <Button
                                className="w-full rounded-xl font-bold text-xs"
                                onClick={() => router.push("/login")}
                            >
                                {t("resetPasswordGoToLogin")}
                            </Button>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <Alert className="rounded-xl border-destructive/20 bg-destructive/5 text-destructive py-3">
                                    <AlertDescription className="text-xs font-semibold leading-relaxed">
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4.5">

                                    <FormField
                                        control={form.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-xs font-bold text-muted-foreground/90 tracking-wide uppercase">
                                                    {t("newPassword")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        autoComplete="new-password"
                                                        placeholder="••••••••"
                                                        className="rounded-xl border-border/70 h-10 text-sm font-medium focus-visible:ring-primary/20 placeholder:text-muted-foreground/45 transition-all"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[11px] font-bold text-destructive" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-xs font-bold text-muted-foreground/90 tracking-wide uppercase">
                                                    {t("confirmPassword")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        autoComplete="new-password"
                                                        placeholder="••••••••"
                                                        className="rounded-xl border-border/70 h-10 text-sm font-medium focus-visible:ring-primary/20 placeholder:text-muted-foreground/45 transition-all"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[11px] font-bold text-destructive" />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full rounded-xl font-bold text-xs gap-1.5 h-10.5 py-4 shadow-2xs transition-all active:scale-98 mt-3"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin shrink-0" />
                                                {t("resetPasswordSubmitting")}
                                            </>
                                        ) : (
                                            <>
                                                <KeyRound className="size-3.5 stroke-[2.2]" />
                                                {t("resetPasswordSubmit")}
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </>
                    )}

                    <div className="text-center text-xs sm:text-sm text-muted-foreground/90 font-medium pt-2">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 font-bold text-primary underline-offset-4 hover:underline transition-all"
                        >
                            <ArrowLeft className="size-3.5" />
                            {t("backToLogin")}
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}