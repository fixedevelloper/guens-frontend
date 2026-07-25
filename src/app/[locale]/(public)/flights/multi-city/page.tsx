// app/[locale]/flights/multi-city/page.tsx
"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, X, ArrowRight, Calendar, Users } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { FlightSearchForm } from "@/components/search/flight-search-form";
import { MultiCityItineraryCard } from "@/components/search/multi-city-itinerary-card";
import { useMultiCityFlightSearch } from "@/hooks/use-search";
import { flightSearchParamsToQuery, multiCitySearchParamsToQuery, parseMultiCitySearchParams } from "@/lib/search-params";
import type { FlightSearchParams, MultiCityFlightSearchParams } from "@/lib/api/types";

export default function MultiCityFlightsPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        <Skeleton className="h-12 w-3/4 rounded-full" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    }>
      <MultiCityFlightsPageContent />
    </Suspense>
  );
}

function MultiCityFlightsPageContent() {
  const t = useTranslations("SearchResults");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  const params = useMemo(() => parseMultiCitySearchParams(searchParams), [searchParams]);
  const query = useMultiCityFlightSearch(params);

  function handleMultiCitySearch(next: MultiCityFlightSearchParams) {
    setEditing(false);
    router.push(`/flights/multi-city?${multiCitySearchParamsToQuery(next)}`);
  }

  function handleFlightSearch(next: FlightSearchParams) {
    router.push(`/flights?${flightSearchParamsToQuery(next)}`);
  }

  // Calcul du nombre total de passagers pour le résumé
  const totalPassengers = params?.legs?.[0]?.passengers ?? 1;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/30 pb-20 sm:pb-8">
      
      {/* 1. BARRE DE NAVIGATION MOBILE AU DÉBUT (Flottante au milieu en bas) */}
      <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-1 rounded-full border border-border/40 bg-background/95 p-1.5 shadow-lg backdrop-blur-md pointer-events-auto sm:hidden mb-[env(safe-area-inset-bottom,0px)]">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setEditing(true)} 
          className="rounded-full px-6 py-5 text-xs font-bold gap-2 text-foreground active:bg-muted"
        >
          <Search className="size-4 text-primary" />
          <span>Modifier la recherche</span>
        </Button>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        
        {/* Résumé de recherche Desktop & Mobile */}
        {params && params.legs && params.legs.length > 0 && (
          <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background p-4 shadow-sm sm:flex-row sm:rounded-full sm:py-3 sm:pl-6 sm:pr-3">
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm sm:justify-start">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  Multi-destinations ({params.legs.length} vols)
                </span>
              </div>
              <div className="hidden h-4 w-px bg-border sm:block" />
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="size-4" />
                <span>{params.legs[0]?.departureDate}</span>
              </div>
              <div className="hidden h-4 w-px bg-border sm:block" />
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="size-4" />
                <span>{totalPassengers} {t("passenger", { count: totalPassengers })}</span>
              </div>
            </div>

            <Button 
              onClick={() => setEditing((v) => !v)}
              size="sm"
              className="w-full rounded-xl sm:w-auto sm:rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/95 shadow-sm"
            >
              <Search className="mr-2 size-4" />
              Modifier
            </Button>
          </div>
        )}

        {/* Formulaire de recherche rétractable (Desktop uniquement) */}
        {editing && (
          <div className="mb-8 hidden sm:block animate-in fade-in duration-200">
            <Card className="border-border/60 shadow-md rounded-2xl">
              <CardContent className="p-6">
                <FlightSearchForm
                  defaultLegs={params?.legs}
                  onSearch={handleFlightSearch}
                  onMultiCitySearch={handleMultiCitySearch}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Titre de la page et Compteur de résultats */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            {t("multiCityTitle")}
          </h1>
          {!query.isLoading && query.data && query.data.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {t("resultsCount", { count: query.data.length })}
            </p>
          )}
        </div>

        {/* Résultats ou Squelettes de chargement */}
        {query.isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-44 w-full rounded-2xl" />
            ))}
          </div>
        ) : query.isError ? (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertTitle>{t("noResults")}</AlertTitle>
          </Alert>
        ) : !query.data || query.data.length === 0 ? (
          <Alert className="rounded-2xl">
            <AlertTitle>{t("noResults")}</AlertTitle>
          </Alert>
        ) : (
          <div className="grid gap-4">
            {query.data.map((itinerary, index) => (
              <MultiCityItineraryCard 
                key={`${itinerary.providerType}-${index}`} 
                itinerary={itinerary} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Tiroir de Modification de Recherche Mobile (Slide-in de droite à gauche, ultra fluide) */}
      <div className={`fixed inset-0 z-50 sm:hidden transition-all duration-300 ${editing ? "visible pointer-events-auto" : "invisible pointer-events-none"}`}>
        {/* Voile d'arrière-plan tactile */}
        <div 
          className={`absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-350 ${editing ? "opacity-100" : "opacity-0"}`} 
          onClick={() => setEditing(false)} 
        />
        
        {/* Contenu du tiroir */}
        <div className={`absolute right-0 top-0 bottom-0 w-[92%] bg-background shadow-2xl transition-transform duration-300 flex flex-col ${editing ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex h-16 items-center justify-between border-b px-5">
            <span className="font-bold text-sm tracking-wide uppercase text-foreground">Votre voyage</span>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900" onClick={() => setEditing(false)}>
              <X className="size-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <FlightSearchForm 
              defaultLegs={params?.legs} 
              onSearch={handleFlightSearch} 
              onMultiCitySearch={handleMultiCitySearch} 
            />
          </div>
        </div>
      </div>

    </div>
  );
}