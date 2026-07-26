// app/[locale]/reseller/flights/multi-city/page.tsx
"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    Search,
    X,
    Calendar,
    Users,
    Filter,
    PlaneTakeoff,
    Sparkles,
    ShieldCheck,
    Building2,
    ArrowRight
} from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FlightSearchForm } from "@/components/search/flight-search-form";
import { FlightResultsList } from "@/components/search/flight-results";
import { FlightFilters } from "@/components/search/flight-filters";
import { useMultiCityFlightSearch } from "@/hooks/use-search";
import {
    flightSearchParamsToQuery,
    multiCitySearchParamsToQuery, parseMultiCitySearchParams,

} from "@/lib/search-params";
import { DEFAULT_FLIGHT_FILTERS, computeFlightFilterOptions, filterFlightOffers } from "@/lib/filters";
import type {FlightSearchParams, HarmonizedFlightOffer, MultiCityFlightSearchParams} from "@/lib/api/types";
import DynamicFlightLoader from "@/components/search/dynamic-flight-loader";

export default function ResellerMultiCityFlightsPage() {
    return (
        <Suspense
            fallback={
                <div className="mx-auto max-w-7xl px-4 py-8 space-y-4">
                    <Skeleton className="h-12 w-full max-w-2xl mx-auto rounded-full" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Skeleton className="h-44 w-full rounded-2xl" />
                        <Skeleton className="h-44 w-full rounded-2xl" />
                        <Skeleton className="h-44 w-full rounded-2xl" />
                    </div>
                </div>
            }
        >
            <ResellerMultiCityFlightsContent />
        </Suspense>
    );
}

function ResellerMultiCityFlightsContent() {
    const t = useTranslations("SearchResults");
    const searchParams = useSearchParams();
    const router = useRouter();

    const [editing, setEditing] = useState(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [filters, setFilters] = useState(DEFAULT_FLIGHT_FILTERS);

    const params = useMemo(() => parseMultiCitySearchParams(searchParams), [searchParams]);
    const query = useMultiCityFlightSearch(params);

    const filterOptions = useMemo(
        () => computeFlightFilterOptions((query.data as unknown as HarmonizedFlightOffer[]) ?? []),
        [query.data]
    );

    const filteredOffers = useMemo(
        () => filterFlightOffers((query.data as unknown as HarmonizedFlightOffer[]) ?? [], filters),
        [query.data, filters]
    );

    // Verrouillage du scroll en arrière-plan pendant l'ouverture des tirroirs mobiles
    useEffect(() => {
        if (editing || isMobileFilterOpen) {
            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none";
        } else {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        }
        return () => {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        };
    }, [editing, isMobileFilterOpen]);

    function handleSearch(next: FlightSearchParams) {
        setEditing(false);
        router.push(`/dashboard/reseller/flights?${flightSearchParamsToQuery(next)}`);
    }

    function handleMultiCitySearch(next: MultiCityFlightSearchParams) {
        setEditing(false);
        setFilters(DEFAULT_FLIGHT_FILTERS);
        router.push(`/dashboard/reseller/flights/multi-city?${multiCitySearchParamsToQuery(next)}`);
    }

    const isFilteredOut = (query.data?.length ?? 0) > 0 && filteredOffers.length === 0;

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/30 pb-28 lg:pb-12 overflow-x-hidden">

            {/* BARRE DE NAVIGATION FLOTTANTE MOBILE */}
            <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border/50 bg-background/90 p-1.5 shadow-xl backdrop-blur-lg pointer-events-auto lg:hidden mb-[env(safe-area-inset-bottom,0px)]">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="rounded-full px-4 py-2.5 text-xs font-bold gap-2 text-foreground active:bg-muted"
                >
                    <Search className="size-4 text-primary shrink-0" />
                    <span>Modifier</span>
                </Button>
                <div className="h-4 w-px bg-border/80" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="rounded-full px-4 py-2.5 text-xs font-bold gap-2 text-foreground active:bg-muted"
                >
                    <Filter className="size-4 text-primary shrink-0" />
                    <span>Filtres</span>
                </Button>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-4 sm:py-8">

                {/* Header Espace Revendeur */}
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            <Building2 className="size-3.5" />
                            <span>Espace B2B / Multi-Destinations</span>
                        </div>
                        <h1 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            Réservation Vol Multi-City Revendeur
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="size-4 text-emerald-600" />
                        <span>Tarifs d'agences B2B appliqués</span>
                    </div>
                </div>

                {/* Résumé Multi-City */}
                <div className="mb-6 sm:mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl sm:rounded-3xl border border-border/60 bg-gradient-to-r from-background via-background/95 to-primary/5 p-4 shadow-xs backdrop-blur-sm sm:flex-row sm:p-5">
                    {params?.legs && params.legs.length > 0 ? (
                        <div className="flex flex-col gap-2 text-xs sm:text-sm w-full sm:w-auto">
                            <div className="flex flex-wrap items-center gap-2">
                                {params.legs.map((leg, i) => (
                                    <div key={i} className="flex items-center gap-1.5 font-bold text-foreground bg-muted/60 px-2.5 py-1 rounded-lg border border-border/40">
                                        <span className="text-primary">{leg.origin}</span>
                                        <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                                        <span className="text-primary">{leg.destination}</span>
                                        <span className="text-[10px] font-normal text-muted-foreground ml-1">
                      ({leg.departureDate})
                    </span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Users className="size-3.5 text-primary" />
                    {((params.adults ?? 1) + (params.children ?? 0))} Voyageurs
                </span>
                                <span>•</span>
                                <span className="font-medium text-foreground">{params.cabinClass}</span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground">Veuillez indiquer vos étapes de vol</span>
                    )}

                    <Button
                        onClick={() => setEditing((v) => !v)}
                        size="sm"
                        className="w-full sm:w-auto rounded-xl sm:rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90 shadow-xs transition-all shrink-0"
                    >
                        <Search className="mr-2 size-3.5" />
                        {editing ? "Fermer" : "Modifier l'itinéraire"}
                    </Button>
                </div>

                {/* Formulaire Rétractable Desktop */}
                {editing && (
                    <div className="mb-8 hidden lg:block animate-in fade-in slide-in-from-top-3 duration-200">
                        <Card className="border-border/60 shadow-lg rounded-3xl bg-background/95 backdrop-blur-md">
                            <CardContent className="p-6">
                                <FlightSearchForm
                                    defaultLegs={params?.legs}
                                    defaultValues={params ? {
                                        adults: params.adults,
                                        children: params.children,
                                        infants: params.infants,
                                        cabinClass: params.cabinClass,
                                        currency: params.currency,
                                    } : undefined}
                                    onSearch={handleSearch}
                                    onMultiCitySearch={handleMultiCitySearch}
                                    isSearching={query.isLoading}
                                />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Grille Principale */}
                {query.isLoading ? (
                    <DynamicFlightLoader isPending={true} />
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[280px_1fr] items-start">

                        <aside className="hidden lg:block sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-3xl border border-border/60 bg-background/90 p-5 shadow-xs backdrop-blur-sm">
                            <FlightFilters options={filterOptions} value={filters} onChange={setFilters} />
                        </aside>

                        <main className="min-w-0 space-y-4">
                            {isFilteredOut ? (
                                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-background/50 p-8 text-center backdrop-blur-xs">
                                    <div className="relative mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <PlaneTakeoff className="size-8 animate-bounce" />
                                        <div className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-background border shadow-xs text-primary">
                                            <Sparkles className="size-3" />
                                        </div>
                                    </div>
                                    <h3 className="text-base font-bold text-foreground">
                                        Aucun vol ne correspond à ces critères
                                    </h3>
                                    <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">
                                        Ajustez vos filtres pour voir davantage d'itinéraires multi-destinations.
                                    </p>
                                    <Button
                                        onClick={() => setFilters(DEFAULT_FLIGHT_FILTERS)}
                                        className="mt-6 rounded-full px-6 font-semibold"
                                    >
                                        Réinitialiser les filtres
                                    </Button>
                                </div>
                            ) : (
                                <FlightResultsList offers={filteredOffers}  isReseller={true}/>
                            )}
                        </main>
                    </div>
                )}
            </div>

            {/* TIROIR MOBILE FILTRES */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end sm:justify-center items-end">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />

                    <div className="relative z-10 w-full sm:w-[420px] h-[85dvh] sm:h-[90dvh] bg-background shadow-2xl rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-300">
                        <div className="flex h-14 items-center justify-between border-b px-5 bg-muted/30 shrink-0">
                            <span className="font-bold text-sm tracking-wider uppercase text-foreground">Filtres</span>
                            <Button variant="ghost" size="icon" className="rounded-full size-8" onClick={() => setIsMobileFilterOpen(false)}>
                                <X className="size-4" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 pb-20 overscroll-contain">
                            <FlightFilters options={filterOptions} value={filters} onChange={setFilters} />
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background/95 backdrop-blur-md">
                            <Button className="w-full rounded-full font-bold" onClick={() => setIsMobileFilterOpen(false)}>
                                Afficher les résultats ({filteredOffers.length})
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* TIROIR MOBILE FORMULAIRE */}
            {editing && (
                <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end sm:justify-center items-end">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                        onClick={() => setEditing(false)}
                    />

                    <div className="relative z-10 w-full sm:w-[480px] h-[92dvh] sm:h-[90dvh] bg-background shadow-2xl rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-300">
                        <div className="flex h-14 items-center justify-between border-b px-5 bg-muted/30 shrink-0">
                            <span className="font-bold text-sm tracking-wider uppercase text-foreground">Multi-Destinations B2B</span>
                            <Button variant="ghost" size="icon" className="rounded-full size-8" onClick={() => setEditing(false)}>
                                <X className="size-4" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 pb-12 overscroll-contain">
                            <FlightSearchForm
                                defaultLegs={params?.legs}
                                defaultValues={params ? {
                                    adults: params.adults,
                                    children: params.children,
                                    infants: params.infants,
                                    cabinClass: params.cabinClass,
                                    currency: params.currency,
                                } : undefined}
                                onSearch={handleSearch}
                                onMultiCitySearch={handleMultiCitySearch}
                                isSearching={query.isLoading}
                            />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}