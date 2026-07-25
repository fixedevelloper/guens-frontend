// app/[locale]/hotels/page.tsx
"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { SlidersHorizontal, Map, Search, Sparkles, X } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { HotelSearchForm } from "@/components/search/hotel-search-form";
import { HotelResultsList } from "@/components/search/hotel-results";
import { HotelFilters } from "@/components/search/hotel-filters";
import { HotelMap } from "@/components/search/hotel-map";
import { useHotelSearch } from "@/hooks/use-search";
import { hotelSearchParamsToQuery, parseHotelSearchParams } from "@/lib/search-params";
import { DEFAULT_HOTEL_FILTERS, computeHotelFilterOptions, filterHotelOffers } from "@/lib/filters";
import type { HotelSearchParams } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export default function HotelsPage() {
  return (
    <Suspense 
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10 space-y-6">
          <Skeleton className="h-10 w-1/4 rounded-xl" />
          <Skeleton className="h-[500px] w-full rounded-2xl" />
        </div>
      }
    >
      <HotelsPageContent />
    </Suspense>
  );
}

function HotelsPageContent() {
  const t = useTranslations("SearchResults");
  const tFilters = useTranslations("Filters");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [editing, setEditing] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_HOTEL_FILTERS);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // États pour contrôler l'ouverture des tiroirs mobiles
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const params = useMemo(() => parseHotelSearchParams(searchParams), [searchParams]);
  const query = useHotelSearch(params);

  const filterOptions = useMemo(() => computeHotelFilterOptions(query.data ?? []), [query.data]);
  const filteredOffers = useMemo(
    () => filterHotelOffers(query.data ?? [], filters),
    [query.data, filters]
  );

  const nights = params
    ? Math.max(1, Math.round((new Date(params.checkOut).getTime() - new Date(params.checkIn).getTime()) / 86_400_000))
    : 1;

  function handleSearch(next: HotelSearchParams) {
    setEditing(false);
    setFilters(DEFAULT_HOTEL_FILTERS);
    router.push(`/hotels?${hotelSearchParamsToQuery(next)}`);
  }

  function handlePinSelect(key: string) {
    setHoveredKey(key);
    setIsMapOpen(false); // Ferme la map sur mobile si on sélectionne un hôtel
    document.getElementById(key)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      
      {/* HEADER DE RECHERCHE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
            {t("hotelsTitle") ?? "Hébergements disponibles"}
          </h1>
          {params && (
            <p className="text-xs text-muted-foreground font-medium">
              Du {new Date(params.checkIn).toLocaleDateString(locale, { day: 'numeric', month: 'short' })} au {new Date(params.checkOut).toLocaleDateString(locale, { day: 'numeric', month: 'short' })} • {nights} {nights > 1 ? "nuits" : "nuit"}
            </p>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setEditing((v) => !v)}
          className={cn(
            "rounded-xl gap-2 font-bold text-xs py-5 px-4 shadow-2xs border-border/80 transition-all duration-200 active:scale-97",
            editing ? "bg-primary/5 border-primary/30 text-primary" : "hover:bg-slate-50 dark:hover:bg-zinc-900/40"
          )}
        >
          {editing ? <Search className="size-3.5" /> : <SlidersHorizontal className="size-3.5" />}
          {editing ? (t("closeSearch") ?? "Fermer la recherche") : (t("backToSearch") ?? "Modifier la recherche")}
        </Button>
      </div>

      {/* FORMULAIRE DE RECHERCHE MODIFIABLE */}
      {editing && (
        <div className="overflow-hidden rounded-2xl border border-primary/10 bg-primary/[0.01] p-5 animate-in fade-in-50 slide-in-from-top-4 duration-300">
          <HotelSearchForm defaultValues={params ?? undefined} onSearch={handleSearch} />
        </div>
      )}

      {/* ÉTAT DE CHARGEMENT */}
      {query.isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr_280px]">
          <Skeleton className="h-[400px] rounded-2xl hidden lg:block" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-[220px] w-full rounded-2xl" />
            <Skeleton className="h-[220px] w-full rounded-2xl" />
          </div>
          <Skeleton className="h-[450px] rounded-2xl hidden lg:block" />
        </div>
      ) : query.isError ? (
        <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/[0.01]">
          <AlertTitle className="font-bold">{t("noResults") ?? "Erreur de chargement"}</AlertTitle>
          <AlertDescription>Une erreur est survenue lors de la récupération des offres d'hébergement. Veuillez réessayer.</AlertDescription>
        </Alert>
      ) : !query.data || query.data.length === 0 ? (
        <Alert className="rounded-2xl border-border/80 bg-slate-50/20 py-8 text-center flex flex-col items-center">
          <AlertTitle className="font-extrabold text-lg mb-1">{t("noResults") ?? "Aucun hébergement trouvé"}</AlertTitle>
          <AlertDescription className="text-muted-foreground text-sm max-w-sm">
            Nous n'avons pas trouvé de chambres libres pour vos dates de séjour. Essayez de modifier vos critères de recherche.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* BARRE D'ACTIONS RAPIDES MOBILE (FIXÉE EN BAS SUR MOBILE) */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-background/95 backdrop-blur-md px-3 py-2.5 rounded-full border border-border/80 shadow-lg lg:hidden">
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button size="sm" variant="ghost" className="rounded-full gap-1.5 font-bold text-xs">
                  <SlidersHorizontal className="size-3.5" />
                  Filtrer
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto px-5 pb-8 pt-5">
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-left font-black text-lg">Filtrer les résultats</SheetTitle>
                </SheetHeader>
                <HotelFilters options={filterOptions} value={filters} onChange={setFilters} />
              </SheetContent>
            </Sheet>

            <div className="w-[1px] h-4 bg-border" />

            <Sheet open={isMapOpen} onOpenChange={setIsMapOpen}>
              <SheetTrigger asChild>
                <Button size="sm" variant="ghost" className="rounded-full gap-1.5 font-bold text-xs text-primary">
                  <Map className="size-3.5" />
                  Carte
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl h-[80vh] p-0 overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between bg-background">
                  <span className="font-bold text-sm">Localisation des hôtels</span>
                  <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => setIsMapOpen(false)}>
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="h-full w-full pb-14">
                  <HotelMap
                    offers={filteredOffers}
                    hoveredKey={hoveredKey}
                    onHoverChange={setHoveredKey}
                    onSelect={handlePinSelect}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* GRILLE PRINCIPALE TRIPLE COLONNES (ASYNCHRONE & INTERVERTIE) */}
          <div className="grid gap-6 lg:grid-cols-[280px_1fr_280px]">
            
            {/* COLONNE GAUCHE (DESKTOP) : FILTRES */}
            <aside className="hidden lg:block">
              <div className="lg:sticky lg:top-24 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/80 tracking-wider uppercase px-0.5">
                  <SlidersHorizontal className="size-3.5" />
                  <span>Affiner ma recherche</span>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-2xs">
                  <HotelFilters options={filterOptions} value={filters} onChange={setFilters} />
                </div>
              </div>
            </aside>

            {/* COLONNE CENTRALE : RÉSULTATS DE RECHERCHE */}
            <main className="space-y-4">
              <div className="flex items-center justify-between px-0.5">
                <p className="text-xs font-bold text-muted-foreground/90 tracking-wide">
                  {filteredOffers.length === query.data.length
                    ? t("resultsCount", { count: query.data.length }) ?? `${query.data.length} hébergements disponibles`
                    : tFilters("resultsFiltered", { shown: filteredOffers.length, total: query.data.length }) ?? `${filteredOffers.length} sur ${query.data.length} filtrés`}
                </p>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>Trié par pertinence</span>
                </div>
              </div>

              <div className="space-y-4">
                <HotelResultsList
                  offers={filteredOffers}
                  nights={nights}
                  params={params as HotelSearchParams}
                  hoveredKey={hoveredKey}
                  onHoverChange={setHoveredKey}
                />
              </div>
            </main>

            {/* COLONNE DROITE (DESKTOP) : CARTE INTERACTIVE */}
            <aside className="hidden lg:block">
              <div className="lg:sticky lg:top-24 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/80 tracking-wider uppercase px-0.5">
                  <Map className="size-3.5" />
                  <span>Localisation</span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card h-[450px] shadow-sm">
                  <HotelMap
                    offers={filteredOffers}
                    hoveredKey={hoveredKey}
                    onHoverChange={setHoveredKey}
                    onSelect={handlePinSelect}
                  />
                </div>
              </div>
            </aside>

          </div>
        </>
      )}
    </div>
  );
}