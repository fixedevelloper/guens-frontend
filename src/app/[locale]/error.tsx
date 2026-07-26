// app/[locale]/error.tsx
"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function GlobalError({
                                        error,
                                        reset,
                                    }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const t = useTranslations("ErrorPage");

    useEffect(() => {
        // Log de l'erreur vers un service de monitoring (ex: Sentry)
        console.error("Unhandled Application Error:", error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-destructive/10 text-destructive mb-2">
                    <AlertTriangle className="size-8" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                        {t("title") ?? "Une erreur est survenue"}
                    </h1>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        {t("description") ?? "Nous n'avons pas pu charger cette page. Un problème temporaire est survenu."}
                    </p>
                </div>

             {error.digest && (
    <p className="text-[11px] font-mono text-muted-foreground/60 bg-muted/50 py-1 px-3 rounded-md inline-block">
        {t("errorCode")}: {error.digest}
    </p>
)}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button
                        onClick={() => reset()}
                        variant="default"
                        className="w-full sm:w-auto rounded-xl font-bold gap-2 px-5"
                    >
                        <RefreshCw className="size-4" />
                        {t("retry") ?? "Réessayer"}
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        className="w-full sm:w-auto rounded-xl font-bold gap-2 px-5"
                    >
                        <Link href="/public">
                            <Home className="size-4" />
                            {t("goHome") ?? "Accueil"}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}