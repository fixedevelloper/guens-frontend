// app/[locale]/car-rental/search/page.tsx
"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Car } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useVehicleSearch } from "@/hooks/use-search";
import { useVehicleStore } from "@/store/use-vehicle-store";
import { parseVehicleSearchParams } from "@/lib/search-params";
import { VehicleResultsList } from "@/components/search/vehicle-results";

export default function CarRentalSearchPage() {
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
            <CarRentalSearchPageContent />
        </Suspense>
    );
}

function CarRentalSearchPageContent() {
    const t = useTranslations("CarRentalSearch");
    const searchParams = useSearchParams();
    const router = useRouter();

    const params = useMemo(() => parseVehicleSearchParams(searchParams), [searchParams]);
    const query = useVehicleSearch(params);

    const setStoreSearchParams = useVehicleStore((state) => state.setSearchParams);
    const setStoreSearchResults = useVehicleStore((state) => state.setSearchResults);
    const setStoreLoading = useVehicleStore((state) => state.setLoading);
    const setStoreError = useVehicleStore((state) => state.setError);

    useEffect(() => {
        if (params) setStoreSearchParams(params);
    }, [params, setStoreSearchParams]);

    useEffect(() => {
        setStoreLoading(query.isLoading);
    }, [query.isLoading, setStoreLoading]);

    useEffect(() => {
        if (query.isError) {
            setStoreError(t("error") ?? "Impossible de charger les véhicules disponibles.");
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
                    <Car className="size-5 text-primary" />
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                        {t("title") ?? "Véhicules disponibles"}
                    </h1>
                </div>

                {query.isLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((n) => (
                            <Skeleton key={n} className="h-56 w-full rounded-2xl" />
                        ))}
                    </div>
                ) : (
                    <VehicleResultsList offers={query.data ?? []} />
                )}
            </div>
        </div>
    );
}