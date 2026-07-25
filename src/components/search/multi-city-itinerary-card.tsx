// components/search/multi-city-itinerary-card.tsx
"use client";

import { useLocale, useTranslations } from "next-intl";
import { PlaneLanding, PlaneTakeoff, ArrowRight, ArrowDown, ChevronRight } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { airlineLabel, formatDateTime, formatMoney, providerLabel } from "@/lib/format";
import { checkoutUrlForMultiCityItinerary } from "@/lib/checkout-url";
import type { MultiCityItinerary } from "@/lib/api/types";

export function MultiCityItineraryCard({ itinerary }: { itinerary: MultiCityItinerary }) {
  const t = useTranslations("SearchResults");
  const router = useRouter();
  const locale = useLocale();

  function handleSelect() {
    router.push(checkoutUrlForMultiCityItinerary(itinerary));
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card hover:border-border/90 hover:shadow-md transition-all duration-300">
      
      {/* HEADER DE L'OFFRE */}
      <div className="flex flex-row items-center justify-between gap-4 p-5 sm:p-6 bg-slate-50/40 dark:bg-zinc-900/10 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Badge variant="outline" className="w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold border-border bg-background text-muted-foreground tracking-wider uppercase">
            {providerLabel(itinerary.providerType)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {formatMoney(itinerary.totalPrice, locale)}
          </span>
          <Button 
            size="sm" 
            onClick={handleSelect}
            className="rounded-xl font-bold gap-1.5 shadow-xs bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-5 transition-all duration-200 active:scale-97"
          >
            {t("selectOffer") ?? "Sélectionner"}
            <ChevronRight className="size-4 shrink-0" />
          </Button>
        </div>
      </div>

      {/* LISTE DES TRONÇONS (LEGS) */}
      <CardContent className="p-5 sm:p-6 space-y-5">
        {itinerary.legs.map((leg, index) => (
          <div key={leg.legIndex} className="relative">
            {/* Séparateur élégant entre les vols avec indicateur visuel de connexion */}
            {index > 0 && (
              <div className="flex items-center gap-4 my-5">
                <div className="h-[1px] flex-1 bg-dashed border-t border-border/80" />
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
                  Transit / Destination suivante
                </span>
                <div className="h-[1px] flex-1 bg-dashed border-t border-border/80" />
              </div>
            )}

            <div className="space-y-3.5">
              {/* Infos Compagnie & Vol */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="secondary" className="rounded-md px-1.5 py-0 font-bold font-mono tracking-wider text-[10px] bg-primary/5 text-primary border border-primary/10">
                  {leg.airline}{leg.flightNumber}
                </Badge>
                <span className="font-bold text-foreground/80">{airlineLabel(leg.airline)}</span>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-muted-foreground font-medium">{leg.cabinClass}</span>
              </div>

              {/* Trajet & Horaires */}
              <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] items-center bg-slate-50/20 dark:bg-zinc-900/5 p-4 rounded-xl border border-border/30">
                
                {/* Départ */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/5 text-primary shrink-0 mt-0.5">
                    <PlaneTakeoff className="size-4" />
                  </div>
                  <div className="grid gap-0.5">
                    <span className="text-sm font-black text-foreground tracking-wide uppercase">{leg.origin}</span>
                    <span className="text-xs text-muted-foreground leading-normal font-medium">
                      {formatDateTime(leg.departureTime, locale)}
                    </span>
                  </div>
                </div>

                {/* Transition visuelle */}
                <div className="hidden sm:flex items-center justify-center text-muted-foreground/40 px-2">
                  <ArrowRight className="size-5" />
                </div>
                <div className="flex sm:hidden items-center text-muted-foreground/40 pl-4 py-1">
                  <ArrowDown className="size-4" />
                </div>

                {/* Arrivée */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/5 text-primary shrink-0 mt-0.5">
                    <PlaneLanding className="size-4" />
                  </div>
                  <div className="grid gap-0.5">
                    <span className="text-sm font-black text-foreground tracking-wide uppercase">{leg.destination}</span>
                    <span className="text-xs text-muted-foreground leading-normal font-medium">
                      {formatDateTime(leg.arrivalTime, locale)}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}