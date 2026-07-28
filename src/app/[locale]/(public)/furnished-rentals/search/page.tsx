// app/[locale]/furnished-rentals/search/page.tsx
"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {usePropertySearch, useVehicleSearch} from "@/hooks/use-search"; // ⚠️ placeholder, remplacer par usePropertySearch (voir note)
import { usePropertyStore } from "@/store/use-property-store";
import { parsePropertySearchParams } from "@/lib/search-params";
import { PropertyResultsList } from "@/components/search/property-results";

export default function FurnishedRentalsSearchPage() {
    return (
        <Suspense
            fallback={
                <div className="mx-auto max-w-6xl px-4 py-8 space-y-4">
                    <Skeleton className="h-12 w-full max-w-2xl mx-auto rounded-full" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Skeleton className="h-44 w-full rounded-2xl" />
                        <Skeleton className="h-44 w-full rounded-2xl" />
                        <Skeleton className="h-44 w-full rounded-2xl" />
                    </div>
                </div>
            }
        >
            <FurnishedRentalsSearchPageContent />
        </Suspense>
    );
}

function FurnishedRentalsSearchPageContent() {
    const t = useTranslations("FurnishedRentalSearch");
    const searchParams = useSearchParams();

    const params = useMemo(() => parsePropertySearchParams(searchParams), [searchParams]);
    const query = usePropertySearch(params);

    const setStoreSearchParams = usePropertyStore((state) => state.setSearchParams);
    const setStoreSearchResults = usePropertyStore((state) => state.setSearchResults);
    const setStoreLoading = usePropertyStore((state) => state.setLoading);
    const setStoreError = usePropertyStore((state) => state.setError);

    useEffect(() => {
        if (params) setStoreSearchParams(params);
    }, [params, setStoreSearchParams]);

    useEffect(() => {
        setStoreLoading(query.isLoading);
    }, [query.isLoading, setStoreLoading]);

    useEffect(() => {
        if (query.isError) {
            setStoreError(t("error") ?? "Impossible de charger les logements disponibles.");
        }
    }, [query.isError, setStoreError, t]);

    useEffect(() => {
        setStoreSearchResults(query.data ?? []);
    }, [query.data, setStoreSearchResults]);

    if (!params) {
        return (
            <div className="mx-auto max-w-xl px-4 py-12 text-center">
                <Alert className="rounded-2xl border-dashed border-border/80 bg-background/50 p-6">
                    <AlertDescription className="text-sm text-muted-foreground font-medium">
                        {t("missingParams") ?? "Recherche invalide. Merci de relancer une recherche."}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/30 pb-16">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
                <div className="mb-6 flex items-center gap-2.5">
                    <Home className="size-5 text-primary" />
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                        {t("title") ?? "Logements disponibles"}
                    </h1>
                </div>

                {query.isLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((n) => (
                            <Skeleton key={n} className="h-56 w-full rounded-2xl" />
                        ))}
                    </div>
                ) : (
                    <PropertyResultsList offers={query.data ?? []} />
                )}
            </div>
        </div>
    );
}