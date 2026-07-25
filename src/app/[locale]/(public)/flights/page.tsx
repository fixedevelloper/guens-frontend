// app/[locale]/flights/page.tsx
"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, X, ArrowLeftRight, Calendar, Users, Filter, PlaneTakeoff, Sparkles } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FlightSearchForm } from "@/components/search/flight-search-form";
import { FlightResultsList } from "@/components/search/flight-results";
import { FlightFilters } from "@/components/search/flight-filters";
import { useFlightSearch } from "@/hooks/use-search";
import { flightSearchParamsToQuery, multiCitySearchParamsToQuery, parseFlightSearchParams } from "@/lib/search-params";
import { DEFAULT_FLIGHT_FILTERS, computeFlightFilterOptions, filterFlightOffers } from "@/lib/filters";
import type { FlightSearchParams, MultiCityFlightSearchParams } from "@/lib/api/types";

export default function FlightsPage() {
  return (
      <Suspense fallback={
        <div className="mx-auto max-w-6xl px-4 py-8 space-y-4">
          <Skeleton className="h-12 w-3/4 rounded-full" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        </div>
      }>
        <FlightsPageContent />
      </Suspense>
  );
}

function FlightsPageContent() {
  const t = useTranslations("SearchResults");
  const searchParams = useSearchParams();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FLIGHT_FILTERS);

  const params = useMemo(() => parseFlightSearchParams(searchParams), [searchParams]);
  const query = useFlightSearch(params);

  const filterOptions = useMemo(() => computeFlightFilterOptions(query.data ?? []), [query.data]);
  const filteredOffers = useMemo(
      () => filterFlightOffers(query.data ?? [], filters),
      [query.data, filters]
  );

  function handleSearch(next: FlightSearchParams) {
    setEditing(false);
    setFilters(DEFAULT_FLIGHT_FILTERS);
    router.push(`/flights?${flightSearchParamsToQuery(next)}`);
  }

  function handleMultiCitySearch(next: MultiCityFlightSearchParams) {
    router.push(`/flights/multi-city?${multiCitySearchParamsToQuery(next)}`);
  }

  const isFilteredOut = (query.data?.length ?? 0) > 0 && filteredOffers.length === 0;

  return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/30 pb-20 sm:pb-8">

        {/* 1. BARRE DE NAVIGATION MOBILE POSITIONNÉE AU DÉBUT ET FLOTTANTE */}
        <div className="fixed bottom-18 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-1 rounded-full border border-border/40 bg-background/95 p-1.5 shadow-lg backdrop-blur-md pointer-events-auto sm:hidden mb-[env(safe-area-inset-bottom,0px)]">
          <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
              className="rounded-full px-5 py-5 text-xs font-bold gap-2 text-foreground active:bg-muted"
          >
            <Search className="size-4 text-primary" />
            <span>Modifier</span>
          </Button>
          <div className="h-5 w-px bg-border/80" />
          <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileFilterOpen(true)}
              className="rounded-full px-5 py-5 text-xs font-bold gap-2 text-foreground active:bg-muted"
          >
            <Filter className="size-4 text-primary" />
            <span>Filtres</span>
          </Button>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">

          {/* Résumé de recherche ultra-stylé */}

              <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-border/60 bg-gradient-to-r from-background via-background/90 to-primary/5 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:rounded-full sm:py-3 sm:pl-6 sm:pr-3">
                {params && (
                    <div className="flex flex-wrap items-center justify-center gap-3 text-sm sm:justify-start">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <span className="rounded-xl bg-primary/10 px-3 py-1 text-xs font-bold text-primary shadow-2xs">{params.origin}</span>
                    <div className="flex size-7 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-transform hover:rotate-180 duration-300">
                      <ArrowLeftRight className="size-3.5" />
                    </div>
                    <span className="rounded-xl bg-primary/10 px-3 py-1 text-xs font-bold text-primary shadow-2xs">{params.destination}</span>
                  </div>
                  <div className="hidden h-4 w-px bg-border/80 sm:block" />
                  <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Calendar className="size-3.5 text-primary" />
                    <span>{params.departureDate}</span>
                  </div>
                  <div className="hidden h-4 w-px bg-border/80 sm:block" />
                  <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Users className="size-3.5 text-primary" />
<span>
  {((params.adults ?? 1) + (params.children ?? 0))} {t("passenger", { count: (params.adults ?? 1) + (params.children ?? 0) })}
</span>                  </div>
                </div>
                )}
                <Button
                    onClick={() => setEditing((v) => !v)}
                    size="sm"
                    className="w-full rounded-2xl sm:w-auto sm:rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all duration-200 active:scale-95"
                >
                  <Search className="mr-2 size-4" />
                  Modifier
                </Button>
              </div>


          {/* Formulaire rétractable Desktop */}
          {editing && (
              <div className="mb-8 hidden sm:block animate-in fade-in slide-in-from-top-4 duration-300">
                <Card className="border-border/60 shadow-xl rounded-3xl bg-background/95 backdrop-blur-md">
                  <CardContent className="p-6">
                    <FlightSearchForm
                        defaultValues={params ?? undefined}
                        onSearch={handleSearch}
                        onMultiCitySearch={handleMultiCitySearch}
                    />
                  </CardContent>
                </Card>
              </div>
          )}

          {/* Grille Principale */}
          {query.isLoading ? (
              <div className="grid gap-8 lg:grid-cols-[290px_1fr]">
                <aside className="hidden lg:block space-y-4">
                  <Skeleton className="h-[450px] w-full rounded-3xl" />
                </aside>
                <div className="grid gap-4">
                  {[1, 2, 3].map((n) => (
                      <Skeleton key={n} className="h-48 w-full rounded-3xl" />
                  ))}
                </div>
              </div>
          ) : (
              <div className="grid gap-8 lg:grid-cols-[290px_1fr]">
                {/* Panneau de filtres Desktop - Positionné à gauche */}
                <aside className="hidden lg:block">
                  <div className="lg:sticky lg:top-24 rounded-3xl border border-border/60 bg-background/90 p-5 shadow-sm backdrop-blur-sm">
                    <FlightFilters options={filterOptions} value={filters} onChange={setFilters} />
                  </div>
                </aside>

                {/* Résultats de recherche ou Empty State moderne */}
                <div className="space-y-4">
                  {isFilteredOut ? (
                      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-background/50 p-12 text-center shadow-xs backdrop-blur-xs animate-in fade-in zoom-in-95 duration-300">
                        <div className="relative mb-5 flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
                          <PlaneTakeoff className="size-9 animate-bounce" />
                          <div className="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full bg-background border shadow-xs text-primary">
                            <Sparkles className="size-3.5" />
                          </div>
                        </div>
                        <h3 className="text-lg font-bold tracking-tight text-foreground">Aucun vol ne correspond à vos filtres</h3>
                        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">
                          Essayez d'élargir votre budget maximal ou de modifier vos critères d'escales et de compagnies pour voir plus d'options.
                        </p>
                        <Button
                            onClick={() => setFilters(DEFAULT_FLIGHT_FILTERS)}
                            className="mt-6 rounded-full px-6 font-semibold shadow-sm transition-all duration-200 active:scale-95"
                        >
                          Réinitialiser les filtres
                        </Button>
                      </div>
                  ) : (
                      <FlightResultsList offers={filteredOffers} />
                  )}
                </div>
              </div>
          )}
        </div>

        {/* Tiroir coulissant de Filtres Mobile */}
        <div className={`fixed inset-0 z-50 sm:hidden transition-all duration-300 ${isMobileFilterOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"}`}>
          <div
              className={`absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-350 ${isMobileFilterOpen ? "opacity-100" : "opacity-0"}`}
              onClick={() => setIsMobileFilterOpen(false)}
          />

          <div className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-background shadow-2xl transition-transform duration-300 flex flex-col rounded-l-3xl overflow-hidden ${isMobileFilterOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex h-16 items-center justify-between border-b px-6 bg-muted/20">
              <span className="font-bold text-sm tracking-wider uppercase text-foreground">Filtres</span>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900" onClick={() => setIsMobileFilterOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {query.isLoading ? (
                  <div className="space-y-6">
                    <Skeleton className="h-16 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                  </div>
              ) : (
                  <FlightFilters options={filterOptions} value={filters} onChange={setFilters} />
              )}
            </div>
          </div>
        </div>

        {/* Tiroir de Modification de Recherche Mobile */}
        <div className={`fixed inset-0 z-50 sm:hidden transition-all duration-300 ${editing ? "visible pointer-events-auto" : "invisible pointer-events-none"}`}>
          <div
              className={`absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-350 ${editing ? "opacity-100" : "opacity-0"}`}
              onClick={() => setEditing(false)}
          />

          <div className={`absolute right-0 top-0 bottom-0 w-[90%] bg-background shadow-2xl transition-transform duration-300 flex flex-col rounded-l-3xl overflow-hidden ${editing ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex h-16 items-center justify-between border-b px-6 bg-muted/20">
              <span className="font-bold text-sm tracking-wider uppercase text-foreground">Votre vol</span>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900" onClick={() => setEditing(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <FlightSearchForm defaultValues={params ?? undefined} onSearch={handleSearch} onMultiCitySearch={handleMultiCitySearch} />
            </div>
          </div>
        </div>
      </div>
  );
}