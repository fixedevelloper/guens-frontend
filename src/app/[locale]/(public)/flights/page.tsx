// app/[locale]/flights/page.tsx
"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Search,
  X,
  ArrowLeftRight,
  Calendar,
  Users,
  Filter,
  PlaneTakeoff
} from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FlightSearchForm } from "@/components/search/flight-search-form";
import { FlightResultsList } from "@/components/search/flight-results";
import { FlightFilters } from "@/components/search/flight-filters";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { useFlightSearch } from "@/hooks/use-search";
import { useFlightStore } from "@/store/useFlightStore";
import {
  flightSearchParamsToQuery,
  multiCitySearchParamsToQuery,
  parseFlightSearchParams,
} from "@/lib/search-params";
import {
  DEFAULT_FLIGHT_FILTERS,
  computeFlightFilterOptions,
  filterFlightOffers,
} from "@/lib/filters";
import type {
  FlightSearchParams,
  MultiCityFlightSearchParams,
} from "@/lib/api/types";
import DynamicFlightLoader from "@/components/search/dynamic-flight-loader";
import {MobileDialogSheet} from "@/app/[locale]/(public)/flights/MobileSheeet";

export default function FlightsPage() {
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

  // --- Synchronisation avec le store ---
  const setStoreSearchParams = useFlightStore((state) => state.setSearchParams);
  const setStoreSearchResults = useFlightStore((state) => state.setSearchResults);
  const setStoreLoading = useFlightStore((state) => state.setLoading);
  const setStoreError = useFlightStore((state) => state.setError);

  useEffect(() => {
    if (params) {
      setStoreSearchParams(params);
    }
  }, [params, setStoreSearchParams]);

  useEffect(() => {
    setStoreLoading(query.isLoading);
  }, [query.isLoading, setStoreLoading]);

  useEffect(() => {
    if (query.isError) {
      setStoreError(t("noResults") ?? "Impossible de charger les résultats de vol.");
    }
  }, [query.isError, setStoreError, t]);

  useEffect(() => {
    if (query.data) {
      setStoreSearchResults(query.data);
    }
  }, [query.data, setStoreSearchResults]);
  // --- Fin synchronisation ---

  const filterOptions = useMemo(
      () => computeFlightFilterOptions(query.data ?? []),
      [query.data]
  );

  const filteredOffers = useMemo(
      () => filterFlightOffers(query.data ?? [], filters),
      [query.data, filters]
  );

  const isResultsEmpty = (query.data?.length ?? 0) > 0 && filteredOffers.length === 0;
  const showMobileOverlay = editing || isMobileFilterOpen;

  useEffect(() => {
    if (!showMobileOverlay) return;

    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [showMobileOverlay]);

  function handleSearch(next: FlightSearchParams) {
    setEditing(false);
    setFilters(DEFAULT_FLIGHT_FILTERS);
    router.push(`/flights?${flightSearchParamsToQuery(next)}`);
  }

  function handleMultiCitySearch(next: MultiCityFlightSearchParams) {
    setEditing(false);
    router.push(`/flights/multi-city?${multiCitySearchParamsToQuery(next)}`);
  }

  function closePanels() {
    setEditing(false);
    setIsMobileFilterOpen(false);
  }

  return (
      <div className="min-h-screen overflow-x-hidden bg-slate-50/50 pb-24 dark:bg-zinc-950/30 lg:pb-12">
        <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border/50 bg-background/90 p-1.5 shadow-xl backdrop-blur-lg lg:hidden">
          <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
              className="rounded-full px-4 py-2.5 text-xs font-bold gap-2"
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

        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/60 bg-gradient-to-r from-background via-background/95 to-primary/5 p-4 shadow-xs backdrop-blur-sm sm:flex-row sm:rounded-full sm:py-2.5 sm:pl-6 sm:pr-2.5">
            {params && (
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm sm:justify-start">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-primary">
                  {params.origin}
                </span>
                    <ArrowLeftRight className="size-3 text-muted-foreground shrink-0" />
                    <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-primary">
                  {params.destination}
                </span>
                  </div>

                  <div className="hidden h-4 w-px bg-border/80 sm:block" />

                  <div className="flex items-center gap-1 rounded-lg bg-muted/50 px-2 py-0.5 text-muted-foreground">
                    <Calendar className="size-3.5 text-primary shrink-0" />
                    <span>{params.departureDate}</span>
                  </div>

                  <div className="hidden h-4 w-px bg-border/80 sm:block" />

                  <div className="flex items-center gap-1 rounded-lg bg-muted/50 px-2 py-0.5 text-muted-foreground">
                    <Users className="size-3.5 text-primary shrink-0" />
                    <span>{(params.adults ?? 1) + (params.children ?? 0)}</span>
                  </div>
                </div>
            )}

            <Button
                onClick={() => setEditing((v) => !v)}
                size="sm"
                className="w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow-xs transition-all active:scale-95 sm:w-auto sm:rounded-full"
            >
              <Search className="mr-2 size-3.5" />
              Modifier la recherche
            </Button>
          </div>

          {editing && (
              <div className="mb-8 hidden lg:block animate-in fade-in slide-in-from-top-3 duration-200">
                <Card className="rounded-3xl border-border/60 bg-background/95 shadow-lg backdrop-blur-md">
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

          {query.isLoading ? (
              <DynamicFlightLoader isPending />
          ) : (
              <div className="grid items-start gap-8 lg:grid-cols-[280px_1fr]">
                <aside className="hidden max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-3xl border border-border/60 bg-background/90 p-5 shadow-xs backdrop-blur-sm lg:sticky lg:top-24 lg:block">
                  <FlightFilters options={filterOptions} value={filters} onChange={setFilters} />
                </aside>

                <main className="min-w-0 space-y-4">
                  {isResultsEmpty ? (
                      <EmptyResults onReset={() => setFilters(DEFAULT_FLIGHT_FILTERS)} />
                  ) : (
                      <FlightResultsList offers={filteredOffers} isReseller={false} />
                  )}
                </main>
              </div>
          )}

          <NewsletterSignup source="FLIGHT_PAGE" variant="flights" />
        </div>

        {isMobileFilterOpen && (
            <MobileDialogSheet title="Filtres" onOpenChange={setIsMobileFilterOpen} open={isMobileFilterOpen}>
              <div className="flex-1 max-h-[54dvh] overflow-y-auto p-5 pb-20">
                <FlightFilters options={filterOptions} value={filters} onChange={setFilters} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 border-t bg-background/95 p-4 backdrop-blur-md">
                <Button className="w-full rounded-full font-bold" onClick={closePanels}>
                  Afficher les résultats ({filteredOffers.length})
                </Button>
              </div>
            </MobileDialogSheet>
        )}

        {editing && (
            <MobileDialogSheet title="Modifier la recherche"  open={editing} onOpenChange={setEditing}>
              <div className="flex-1 max-h-[54dvh] overflow-y-auto p-5 pb-18">
                <FlightSearchForm
                    defaultValues={params ?? undefined}
                    onSearch={handleSearch}
                    onMultiCitySearch={handleMultiCitySearch}
                />
              </div>
            </MobileDialogSheet>
        )}
      </div>
  );
}

function MobileSheet({
                       title,
                       onClose,
                       children,
                     }: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
      <div className="relative z-50 lg:hidden">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

        <div className="relative mt-4 flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-background shadow-2xl">
          <div className="flex h-14 shrink-0 items-center justify-between border-b bg-muted/30 px-5">
          <span className="text-sm font-bold uppercase tracking-wider text-foreground">
            {title}
          </span>
            <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>

          <div className="overflow-y-auto overscroll-contain">
            {children}
          </div>
        </div>
      </div>
  );
}

function EmptyResults({ onReset }: { onReset: () => void }) {
  return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-background/50 p-8 text-center backdrop-blur-xs">
        <div className="relative mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PlaneTakeoff className="size-8 animate-bounce" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          Aucun vol ne correspond à vos filtres
        </h3>
        <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">
          Essayez d'élargir vos critères de recherche.
        </p>
        <Button onClick={onReset} className="mt-6 rounded-full px-6 font-semibold">
          Réinitialiser les filtres
        </Button>
      </div>
  );
}