// components/checkout/offer-summary-card.tsx
"use client";

import { useLocale, useTranslations } from "next-intl";
import { Building2, Plane, Calendar, CreditCard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { airlineLabel, formatDate, formatDateTime, formatMoney, providerLabel } from "@/lib/format";
import type { OfferSummary } from "@/lib/offer-summary";

export function OfferSummaryCard({ offer }: { offer: OfferSummary }) {
  const t = useTranslations("Checkout");
  const locale = useLocale();

  return (
    <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-zinc-900/30 backdrop-blur-xs">
      {/* En-tête de la carte */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border/40">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
          {t("summaryTitle") ?? "Récapitulatif"}
        </h3>
        <Badge variant="secondary" className="rounded-full font-medium px-2.5 py-0.5 text-[11px] border border-border/30">
          {providerLabel(offer.providerType)}
        </Badge>
      </div>

      <CardContent className="p-5 space-y-5">
        {/* CAS 1 : VOL UNIQUE (ALLER SIMPLE OU RETOUR) */}
        {offer.offerType === "FLIGHT" && (
          <div className="space-y-4">
            {/* Infos Compagnie & Classe */}
            <div className="flex items-center gap-2.5 text-xs">
              <span className="rounded-lg bg-primary/10 text-primary px-2 py-0.5 font-bold tracking-wide">
                {offer.airline} {offer.flightNumber}
              </span>
              <span className="font-semibold text-foreground/85">{airlineLabel(offer.airline)}</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-muted-foreground font-medium">{offer.cabinClass}</span>
            </div>

            {/* Visualisation de l'itinéraire (Timeline verticale) */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-primary/60 before:to-primary/20">
              {/* Départ */}
              <div className="relative">
                <span className="absolute -left-[23px] top-1 size-3.5 rounded-full border-2 border-primary bg-background" />
                <div className="grid gap-0.5">
                  <span className="text-sm font-extrabold text-foreground">{offer.origin}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(offer.departureTime, locale)}
                  </span>
                </div>
              </div>
              {/* Arrivée */}
              <div className="relative">
                <span className="absolute -left-[23px] top-1 size-3.5 rounded-full border-2 border-primary bg-background" />
                <div className="grid gap-0.5">
                  <span className="text-sm font-extrabold text-foreground">{offer.destination}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(offer.arrivalTime, locale)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CAS 2 : MULTI-DESTINATIONS */}
        {offer.offerType === "MULTI_CITY_FLIGHT" && (
          <div className="space-y-3">
            {offer.legs.map((leg, index) => (
              <div key={leg.legIndex} className="relative grid gap-2 rounded-xl border border-border/50 bg-background/60 p-3 shadow-2xs">
                {/* Badge d'ordre de vol */}
                <span className="absolute top-3 right-3 text-[10px] font-bold text-primary uppercase tracking-wider">
                  Vol {index + 1}
                </span>

                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-md bg-muted px-1.5 py-0.5 font-bold text-foreground">
                    {leg.airline} {leg.flightNumber}
                  </span>
                  <span className="font-medium text-muted-foreground truncate max-w-[120px]">
                    {airlineLabel(leg.airline)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Départ</span>
                    <span className="font-bold text-foreground">{leg.origin}</span>
                    <span className="text-[10px] text-muted-foreground block leading-tight">
                      {formatDateTime(leg.departureTime, locale)}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Arrivée</span>
                    <span className="font-bold text-foreground">{leg.destination}</span>
                    <span className="text-[10px] text-muted-foreground block leading-tight">
                      {formatDateTime(leg.arrivalTime, locale)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CAS 3 : HÔTEL */}
        {offer.offerType !== "FLIGHT" && offer.offerType !== "MULTI_CITY_FLIGHT" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <Building2 className="size-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-foreground leading-tight">{offer.hotelName}</h4>
                <p className="text-xs text-muted-foreground">
                  {offer.cityCode} • {offer.roomType}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-background/50 border border-border/40 p-2.5 rounded-xl text-xs text-muted-foreground">
              <Calendar className="size-3.5 text-primary shrink-0" />
              <span>
                Du <strong className="text-foreground">{formatDate(offer.checkIn, locale)}</strong> au <strong className="text-foreground">{formatDate(offer.checkOut, locale)}</strong>
              </span>
            </div>
          </div>
        )}

        <Separator className="bg-border/40" />

        {/* Pied de la carte - Prix Final */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <CreditCard className="size-3 text-emerald-600" /> Taxes & frais inclus
            </span>
          </div>
          <span className="text-2xl font-black text-foreground tracking-tight">
            {formatMoney({ amount: offer.amount, currency: offer.currency }, locale)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}