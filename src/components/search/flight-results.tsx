"use client";

import { useLocale, useTranslations } from "next-intl";
import {Plane, Users, Clock, ShieldCheck, ChevronRight, ExternalLink, ChevronDown, Info, Luggage} from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { airlineLabel, formatDuration, formatMoney, formatTime, providerLabel } from "@/lib/format";
import type { HarmonizedFlightOffer } from "@/lib/api/types";
import { checkoutUrlForFlight } from "@/lib/checkout-url";
import {useState} from "react";

export function FlightResultsList({ offers }: { offers: HarmonizedFlightOffer[] }) {
  const t = useTranslations("Filters");
  const locale = useLocale();

  if (offers.length === 0) {
    return (
        <Alert className="rounded-3xl border-dashed border-border/80 bg-background/50 p-8 text-center shadow-xs">
          <AlertDescription className="text-center text-muted-foreground font-medium">
            {t("noMatch")}
          </AlertDescription>
        </Alert>
    );
  }

  return (
      <div className="grid gap-4">
        {offers.map((offer, index) => (
            <FlightOfferCard key={`${offer.airline}-${offer.flightNumber}-${index}`} offer={offer} locale={locale} />
        ))}
      </div>
  );
}

export function FlightOfferCard({ offer, locale }: { offer: HarmonizedFlightOffer; locale: string }) {
  const t = useTranslations("SearchResults");
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  // Tri des offres par prix croissant
  const sortedQuotes = [...offer.quotes].sort((a, b) => Number(a.price.amount) - Number(b.price.amount));
  const cheapestQuote = sortedQuotes[0];

  function handleSelect(offerId: string) {
    router.push(checkoutUrlForFlight(offer, offerId));
  }

  return (
      <Card className="group overflow-hidden border-border/60 bg-background/90 hover:bg-background shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 rounded-3xl backdrop-blur-sm">
        <div className="grid lg:grid-cols-[1fr_260px]">

          {/* SECTION GAUCHE : DÉTAILS DU VOL */}
          <div className="p-5 sm:p-6 flex flex-col justify-between gap-6 border-b lg:border-b-0 lg:border-r border-border/50">

            {/* Header : Compagnie & Cabine */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Badge Logo Compagnie */}
                <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 text-xs font-black tracking-wider text-primary shadow-2xs group-hover:scale-105 transition-transform duration-300">
                  {offer.airline.substring(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-base text-foreground leading-snug">
                    {airlineLabel(offer.airline)}
                  </h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>{offer.airline} {offer.flightNumber}</span>
                    <span className="size-1 rounded-full bg-border" />
                    <span className="font-semibold text-primary">{offer.cabinClass}</span>
                  </p>
                </div>
              </div>

              {/* Alerte places restantes si critique */}
              {offer.seatsAvailable <= 5 && (
                  <Badge variant="destructive" className="rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-3 py-1 text-[11px] font-bold shadow-2xs">
                    <Users className="mr-1.5 size-3" />
                    {t("seatsLeft", { count: offer.seatsAvailable })}
                  </Badge>
              )}
            </div>

            {/* Ligne graphique de vol */}
            <div className="flex items-center justify-between gap-4 py-1">
              {/* Départ */}
              <div className="flex flex-col min-w-[75px]">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {formatTime(offer.departureTime, locale)}
              </span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide mt-0.5">{offer.origin}</span>
              </div>

              {/* Connecteur de vol central */}
              <div className="relative flex-1 flex flex-col items-center justify-center px-2 max-w-[240px]">
              <span className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1 bg-muted/40 px-2.5 py-0.5 rounded-full">
                <Clock className="size-3 text-primary" />
                {formatDuration(offer.departureTime, offer.arrivalTime)}
              </span>

                {/* Ligne de vol */}
                <div className="relative w-full h-[2px] bg-border/80 rounded-full flex items-center justify-center my-1">
                  <div className="absolute size-2 rounded-full bg-primary/80 -left-0.5 ring-4 ring-background" />
                  <div className="flex size-7 items-center justify-center rounded-full bg-background border border-primary/30 text-primary shadow-xs z-10 transition-transform group-hover:scale-110 duration-300">
                    <Plane className="size-3.5 rotate-90" />
                  </div>
                  <div className="absolute size-2 rounded-full bg-primary/80 -right-0.5 ring-4 ring-background" />
                </div>

                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase mt-1">
                {t("nonstop")}
              </span>
              </div>

              {/* Arrivée */}
              <div className="flex flex-col text-right min-w-[75px]">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {formatTime(offer.arrivalTime, locale)}
              </span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide mt-0.5">{offer.destination}</span>
              </div>
            </div>

            {/* Assurance & Bouton Détails */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full text-[11px]">
              <ShieldCheck className="size-3.5" />
              Billet modifiable ou remboursable
            </span>

              {/* BOUTON DÉTAILS */}
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails((v) => !v)}
                  className="rounded-full text-xs font-bold text-primary hover:bg-primary/10 hover:text-primary gap-1 px-3 h-7 ml-auto transition-colors"
              >
                <span>{showDetails ? "Masquer les détails" : "Détails du vol"}</span>
                <ChevronDown className={`size-3.5 transition-transform duration-300 ${showDetails ? "rotate-180" : ""}`} />
              </Button>
            </div>
          </div>

          {/* SECTION DROITE : ESPACE DE RÉSERVATION DE TYPE PORTAIL */}
          <div className="bg-slate-50/60 dark:bg-zinc-900/30 p-5 sm:p-6 flex flex-col justify-between gap-6">

            {/* Bloc Prix d'Appel (Le moins cher) */}
            <div className="flex lg:flex-col justify-between items-end lg:items-stretch gap-3">
              <div>
              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block mb-0.5">
                Meilleur prix
              </span>
                <p className="text-3xl font-black text-foreground tracking-tight leading-none">
                  {cheapestQuote && formatMoney(cheapestQuote.price, locale)}
                </p>
                {/* APPRÈS */}
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block mt-1">
  Offre 1 • Tarif conseillé
</span>
              </div>

              {/* BOUTON SELECTIONNER PRINCIPAL ULTRA-MODERNE */}
              {cheapestQuote && (
                  <Button
                      onClick={() => handleSelect(cheapestQuote.offerId)}
                      className="w-auto lg:w-full py-5 rounded-2xl text-xs font-extrabold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 group/btn"
                  >
                    Voir l'offre
                    <ChevronRight className="size-4 transition-transform group-hover/btn:translate-x-0.5 duration-200" />
                  </Button>
              )}
            </div>

            {/* Alternatives de prestataires (si + de 1) */}
            {sortedQuotes.length > 1 && (
                <div className="space-y-2.5">
                  <Separator className="bg-border/60" />
                  <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                    Autres options ({sortedQuotes.length - 1})
                  </p>

                  <div className="grid gap-1.5">
                    {sortedQuotes.slice(1).map((quote, index) => (
                        <div
                            key={quote.offerId}
                            onClick={() => handleSelect(quote.offerId)}
                            className="flex items-center justify-between p-2 rounded-xl bg-background/60 hover:bg-background hover:shadow-xs cursor-pointer transition-all duration-200 border border-border/40 hover:border-primary/30 group/option"
                        >
          <span className="text-xs font-semibold text-muted-foreground group-hover/option:text-foreground transition-colors">
            Offre {index + 2}
          </span>
                          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-foreground">
              {formatMoney(quote.price, locale)}
            </span>
                            <ChevronRight className="size-3.5 text-muted-foreground/70 group-hover/option:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
            )}
          </div>

        </div>

        {/* PANNEAU DÉPLIANT : DÉTAILS DE L'ITINÉRAIRE */}
        {showDetails && (
            <div className="border-t border-border/50 bg-slate-50/80 dark:bg-zinc-900/50 p-5 sm:p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
              <h5 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Info className="size-3.5 text-primary" />
                Itinéraire détaillé
              </h5>

              {/* Chronologie du trajet */}
              <div className="p-4 rounded-2xl bg-background border border-border/60 shadow-xs flex items-start gap-4">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <div className="size-3 rounded-full bg-primary ring-4 ring-primary/10" />
                  <div className="w-0.5 h-14 bg-gradient-to-b from-primary via-border to-primary" />
                  <div className="size-3 rounded-full border-2 border-primary bg-background ring-4 ring-primary/10" />
                </div>

                <div className="flex-1 space-y-4 text-xs">
                  {/* Départ */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-foreground">{formatTime(offer.departureTime, locale)}</span>
                      <span className="font-bold text-foreground uppercase">{offer.origin}</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">Aéroport de départ ({offer.origin})</p>
                  </div>

                  {/* Vol central */}
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/30 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground font-medium">
                    <div className="flex items-center gap-2">
                      <Plane className="size-3.5 text-primary" />
                      <span>{airlineLabel(offer.airline)} • Vol {offer.flightNumber}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="size-3 text-primary" />
                      <span>Durée : {formatDuration(offer.departureTime, offer.arrivalTime)}</span>
                    </div>
                  </div>

                  {/* Arrivée */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-foreground">{formatTime(offer.arrivalTime, locale)}</span>
                      <span className="font-bold text-foreground uppercase">{offer.destination}</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">Aéroport d'arrivée ({offer.destination})</p>
                  </div>
                </div>
              </div>

              {/* Grille d'informations pratiques */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-background border border-border/50 space-y-1">
                  <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Classe</span>
                  <p className="font-bold text-foreground">{offer.cabinClass}</p>
                </div>
                <div className="p-3 rounded-2xl bg-background border border-border/50 space-y-1">
                  <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Bagages</span>
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    <Luggage className="size-3.5 text-primary" />
                    1 bagage à main incl.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-background border border-border/50 space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider block">Places disponibles</span>
                  <p className="font-bold text-foreground">{offer.seatsAvailable} sièges restants</p>
                </div>
              </div>
            </div>
        )}
      </Card>
  );
}