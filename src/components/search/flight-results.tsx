"use client";

import { memo, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Plane,
  Users,
  Clock,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Info,
  Luggage,
  Lock,
  AlertTriangle,
} from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { airlineLabel, formatDuration, formatMoney, formatTime } from "@/lib/format";
import { offerStopCount } from "@/lib/filters";
import { useRenderCap } from "@/hooks/use-render-cap";
import { useFlightStore } from "@/store/useFlightStore";
import type { HarmonizedFlightOffer } from "@/lib/api/types";
import { checkoutUrlForFlight, resellerCheckoutUrlForFlight } from "@/lib/checkout-url";

/** Shown when the search request itself failed (timeout, network error, 5xx) - distinct from a
 *  successful search that found zero offers (see FlightResultsList's own empty state below). */
export function FlightSearchErrorState({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("SearchResults");

  return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-destructive/40 bg-destructive/5 p-8 text-center backdrop-blur-xs">
        <div className="relative mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-8" />
        </div>
        <h3 className="text-base font-bold text-foreground">{t("searchFailedTitle")}</h3>
        <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">{t("searchFailedMessage")}</p>
        <Button onClick={onRetry} className="mt-6 rounded-full px-6 font-semibold">
          {t("retrySearch")}
        </Button>
      </div>
  );
}

export function FlightResultsList({
                                    offers,
                                    isReseller = false,
                                  }: {
  offers: HarmonizedFlightOffer[];
  isReseller: boolean;
}) {
  const t = useTranslations("Filters");
  const locale = useLocale();
  const { visible, hasMore, showMore } = useRenderCap(offers);

  if (offers.length === 0) {
    return (
        <Alert className="rounded-3xl border-dashed border-border/80 bg-background/50 p-6 sm:p-8 text-center shadow-xs">
          <AlertDescription className="text-center font-medium text-muted-foreground">
            {t("noMatch")}
          </AlertDescription>
        </Alert>
    );
  }

  return (
      <div className="grid gap-4">
        {visible.map((offer, index) => (
            <FlightOfferCard
                key={`${offer.airline}-${offer.flightNumber}-${index}`}
                offer={offer}
                locale={locale}
                isReseller={isReseller}
            />
        ))}
        {hasMore && (
            <Button variant="outline" onClick={showMore} className="mx-auto rounded-full px-6">
              {t("showMoreResults")}
            </Button>
        )}
      </div>
  );
}

export const FlightOfferCard = memo(function FlightOfferCard({
                                  offer,
                                  locale,
                                  isReseller,
                                }: {
  offer: HarmonizedFlightOffer;
  locale: string;
  isReseller: boolean;
}) {
  const t = useTranslations("SearchResults");
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  const selectOffer = useFlightStore((state) => state.selectOffer);

  // Tri des offres par prix croissant - recalculé seulement quand les quotes changent, pas à
  // chaque re-render (ex: toggle de showDetails, qui ne touche pas offer.quotes).
  const sortedQuotes = useMemo(
      () => [...offer.quotes].sort((a, b) => Number(a.price.amount) - Number(b.price.amount)),
      [offer.quotes]
  );
  const cheapestQuote = sortedQuotes[0];
  // Stops/baggage/hold detail is per-provider (a fare's inventory, not the shared physical-flight
  // summary) - shown for the recommended (cheapest) quote, the one already highlighted at the top
  // of this card. Null for providers that don't surface it (only TravelTerminus does today).
  const detail = cheapestQuote?.detail ?? null;
  const segments = detail?.segments ?? [];
  const stopCount = offerStopCount(offer);
  const firstSegmentCabinBaggage =
      segments[0]?.cabinBaggage.find((b) => b.paxType === "Adult") ?? segments[0]?.cabinBaggage[0] ?? null;
  const firstSegmentCheckedBaggage =
      segments[0]?.checkedBaggage.find((b) => b.paxType === "Adult") ?? segments[0]?.checkedBaggage[0] ?? null;
  const displayAirlineName = offer.airlineName ?? airlineLabel(offer.airline);

  function handleSelect(offerId: string) {
    selectOffer(offer);
    if (isReseller) {
      router.push(resellerCheckoutUrlForFlight(offer, offerId));
    } else {
      router.push(checkoutUrlForFlight(offer, offerId));
    }
  }

  return (
      <Card className="group overflow-hidden rounded-3xl border-border/60 bg-background/90 shadow-xs backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-background hover:shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px]">
          {/* SECTION GAUCHE : DÉTAILS DU VOL */}
          <div className="flex flex-col justify-between gap-5 border-b border-border/50 p-4 sm:p-6 lg:border-b-0 lg:border-r">
            {/* Header : Compagnie & Cabine */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Badge Logo Compagnie */}
                <div className="flex size-10 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent text-xs font-black tracking-wider text-primary shadow-2xs transition-transform duration-300 group-hover:scale-105 sm:size-11">
                  {offer.airline.substring(0, 2)}
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-snug text-foreground sm:text-base">
                    {displayAirlineName}
                  </h4>
                  <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground sm:gap-2">
                  <span>
                    {offer.airline} {offer.flightNumber}
                  </span>
                    <span className="size-1 rounded-full bg-border" />
                    <span className="font-semibold text-primary">{offer.cabinClass}</span>
                  </p>
                </div>
              </div>

              {/* Alerte places restantes */}
              {offer.seatsAvailable <= 5 && (
                  <Badge
                      variant="destructive"
                      className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold text-rose-600 shadow-2xs dark:text-rose-400 sm:px-3 sm:text-[11px]"
                  >
                    <Users className="mr-1 size-3" />
                    {t("seatsLeft", { count: offer.seatsAvailable })}
                  </Badge>
              )}
            </div>

            {/* Ligne graphique de vol */}
            <div className="flex items-center justify-between gap-2 py-1 sm:gap-4">
              {/* Départ */}
              <div className="flex min-w-[65px] flex-col sm:min-w-[75px]">
              <span className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                {formatTime(offer.departureTime, locale)}
              </span>
                <span className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground sm:text-xs">
                {offer.origin}
              </span>
              </div>

              {/* Connecteur de vol central */}
              <div className="relative flex max-w-[240px] flex-1 flex-col items-center justify-center px-1 sm:px-2">
              <span className="mb-1 flex items-center gap-1 rounded-full bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:mb-1.5 sm:px-2.5 sm:text-[11px]">
                <Clock className="size-3 text-primary" />
                {formatDuration(offer.departureTime, offer.arrivalTime)}
              </span>

                {/* Ligne de vol */}
                <div className="relative my-1 flex h-[2px] w-full items-center justify-center rounded-full bg-border/80">
                  <div className="absolute -left-0.5 size-2 rounded-full bg-primary/80 ring-4 ring-background" />
                  <div className="z-10 flex size-6 items-center justify-center rounded-full border border-primary/30 bg-background text-primary shadow-xs transition-transform duration-300 group-hover:scale-110 sm:size-7">
                    <Plane className="size-3 rotate-90 sm:size-3.5" />
                  </div>
                  <div className="absolute -right-0.5 size-2 rounded-full bg-primary/80 ring-4 ring-background" />
                </div>

                <span
                    className={`mt-1 text-[9px] font-bold uppercase tracking-wider sm:text-[10px] ${
                        stopCount > 0
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400"
                    }`}
                >
                {stopCount > 0 ? t("stopsCount", { count: stopCount }) : t("nonstop")}
              </span>
              </div>

              {/* Arrivée */}
              <div className="flex min-w-[65px] flex-col text-right sm:min-w-[75px]">
              <span className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                {formatTime(offer.arrivalTime, locale)}
              </span>
                <span className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground sm:text-xs">
                {offer.destination}
              </span>
              </div>
            </div>

            {/* Assurance & Bouton Détails */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3.5 text-xs text-muted-foreground sm:pt-4">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 sm:text-[11px]">
              <ShieldCheck className="size-3.5 shrink-0" />
              {t("refundableTicket")}
            </span>

              {detail?.holdAvailable === true && (
                  <span className="flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-[10px] font-semibold text-sky-600 dark:text-sky-400 sm:text-[11px]">
                    <Lock className="size-3.5 shrink-0" />
                    {t("holdAvailableBadge")}
                  </span>
              )}

              {/* BOUTON DÉTAILS */}
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails((v) => !v)}
                  className="ml-auto h-7 gap-1 rounded-full px-2.5 text-xs font-bold text-primary hover:bg-primary/10 hover:text-primary sm:px-3"
              >
                <span>{showDetails ? t("hideDetailsAction") : t("showDetailsAction")}</span>
                <ChevronDown
                    className={`size-3.5 transition-transform duration-300 ${
                        showDetails ? "rotate-180" : ""
                    }`}
                />
              </Button>
            </div>
          </div>

          {/* SECTION DROITE : ESPACE DE RÉSERVATION */}
          <div className="flex flex-col justify-between gap-4 bg-slate-50/60 p-4 dark:bg-zinc-900/30 sm:gap-6 sm:p-6">
            {/* Bloc Prix d'Appel (Le moins cher) */}
            <div className="flex flex-row items-center justify-between gap-3 lg:flex-col lg:items-stretch lg:justify-start">
              <div>
              <span className="mb-0.5 block text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                {t("bestPrice")}
              </span>
                <p className="text-2xl font-black leading-none tracking-tight text-foreground sm:text-3xl">
                  {cheapestQuote && formatMoney(cheapestQuote.price, locale)}
                </p>
                <span className="mt-1 block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 sm:text-[11px]">
                {t("offerNumber", { index: 1 })} • {t("recommendedFare")}
              </span>
              </div>

              {/* BOUTON SELECTIONNER PRINCIPAL */}
              {cheapestQuote && (
                  <Button
                      onClick={() => handleSelect(cheapestQuote.offerId)}
                      className="group/btn flex h-11 w-auto items-center justify-center gap-1.5 rounded-2xl bg-primary px-5 text-xs font-extrabold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary/90 active:scale-95 lg:w-full"
                  >
                    {t("viewOffer")}
                    <ChevronRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                  </Button>
              )}
            </div>

            {/* Alternatives de prestataires (si + de 1) */}
            {sortedQuotes.length > 1 && (
                <div className="space-y-2">
                  <Separator className="bg-border/60" />
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    {t("otherOptions", { count: sortedQuotes.length - 1 })}
                  </p>

                  <div className="grid gap-1.5">
                    {sortedQuotes.slice(1).map((quote, index) => (
                        <div
                            key={quote.offerId}
                            onClick={() => handleSelect(quote.offerId)}
                            className="group/option flex cursor-pointer items-center justify-between rounded-xl border border-border/40 bg-background/60 p-2 transition-all duration-200 hover:border-primary/30 hover:bg-background hover:shadow-xs"
                        >
                    <span className="text-xs font-semibold text-muted-foreground transition-colors group-hover/option:text-foreground">
                      {t("offerNumber", { index: index + 2 })}
                    </span>
                          <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground">
                        {formatMoney(quote.price, locale)}
                      </span>
                            <ChevronRight className="size-3.5 text-muted-foreground/70 transition-transform group-hover/option:translate-x-0.5" />
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
            <div className="animate-in fade-in slide-in-from-top-2 space-y-4 border-t border-border/50 bg-slate-50/80 p-4 duration-200 dark:bg-zinc-900/50 sm:space-y-5 sm:p-6">
              <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Info className="size-3.5 text-primary" />
                {t("detailedItinerary")}
              </h5>

              {/* Chronologie du trajet */}
              <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background p-3.5 shadow-xs sm:gap-4 sm:p-4">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <div className="size-2.5 rounded-full bg-primary ring-4 ring-primary/10 sm:size-3" />
                  <div className="h-14 w-0.5 bg-gradient-to-b from-primary via-border to-primary" />
                  <div className="size-2.5 rounded-full border-2 border-primary bg-background ring-4 ring-primary/10 sm:size-3" />
                </div>

                <div className="flex-1 space-y-3 text-xs sm:space-y-4">
                  {segments.length > 0 ? (
                      segments.map((segment, index) => (
                          <div key={`${segment.flightNumber}-${index}`} className="space-y-3 sm:space-y-4">
                            {/* Départ du segment */}
                            <div>
                              <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-foreground sm:text-sm">
                              {formatTime(segment.departureTime, locale)}
                            </span>
                                <span className="font-bold uppercase text-foreground">
                              {segment.departure.code}
                            </span>
                              </div>
                              <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                                {segment.departure.city ?? t("departureAirport", { code: segment.departure.code })}
                              </p>
                            </div>

                            {/* Segment de vol */}
                            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/30 bg-muted/40 p-2 text-[11px] font-medium text-muted-foreground sm:p-2.5">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Plane className="size-3.5 text-primary" />
                                <span>
                              {segment.airlineName ?? airlineLabel(segment.airlineCode)} • {t("flightPrefix")} {segment.flightNumber}
                            </span>
                              </div>
                              {segment.duration && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="size-3 text-primary" />
                                    <span>{t("durationLabel", { duration: segment.duration })}</span>
                                  </div>
                              )}
                            </div>

                            {/* Arrivée du segment */}
                            <div>
                              <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-foreground sm:text-sm">
                              {formatTime(segment.arrivalTime, locale)}
                            </span>
                                <span className="font-bold uppercase text-foreground">
                              {segment.arrival.code}
                            </span>
                              </div>
                              <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                                {segment.arrival.city ?? t("arrivalAirport", { code: segment.arrival.code })}
                              </p>
                            </div>

                            {/* Escale avant le segment suivant */}
                            {index < segments.length - 1 && (
                                <div className="flex items-center gap-2 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                                  <Clock className="size-3.5 shrink-0" />
                                  {t("layoverAt", {
                                    city: segment.arrival.city ?? segment.arrival.code,
                                    duration: segment.layoverAfter ?? "",
                                  })}
                                </div>
                            )}
                          </div>
                      ))
                  ) : (
                      <>
                        {/* Départ */}
                        <div>
                          <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-foreground sm:text-sm">
                          {formatTime(offer.departureTime, locale)}
                        </span>
                            <span className="font-bold uppercase text-foreground">
                          {offer.origin}
                        </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                            {t("departureAirport", { code: offer.origin })}
                          </p>
                        </div>

                        {/* Vol central */}
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/30 bg-muted/40 p-2 text-[11px] font-medium text-muted-foreground sm:p-2.5">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Plane className="size-3.5 text-primary" />
                            <span>
                          {displayAirlineName} • {t("flightPrefix")} {offer.flightNumber}
                        </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="size-3 text-primary" />
                            <span>
                          {t("durationLabel", { duration: formatDuration(offer.departureTime, offer.arrivalTime) })}
                        </span>
                          </div>
                        </div>

                        {/* Arrivée */}
                        <div>
                          <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-foreground sm:text-sm">
                          {formatTime(offer.arrivalTime, locale)}
                        </span>
                            <span className="font-bold uppercase text-foreground">
                          {offer.destination}
                        </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                            {t("arrivalAirport", { code: offer.destination })}
                          </p>
                        </div>
                      </>
                  )}
                </div>
              </div>

              {/* Grille d'informations pratiques */}
              <div className="grid grid-cols-1 gap-2.5 text-xs xs:grid-cols-2 sm:grid-cols-3 sm:gap-3">
                <div className="space-y-1 rounded-2xl border border-border/50 bg-background p-3">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                {t("cabinClassLabel")}
              </span>
                  <p className="font-bold text-foreground">{offer.cabinClass}</p>
                </div>
                <div className="space-y-1 rounded-2xl border border-border/50 bg-background p-3">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                {firstSegmentCabinBaggage ? t("cabinBaggageLabel") : t("baggageLabel")}
              </span>
                  <p className="flex items-center gap-1.5 font-bold text-foreground">
                    <Luggage className="size-3.5 text-primary" />
                    {firstSegmentCabinBaggage ? firstSegmentCabinBaggage.rule : t("carryOnIncluded")}
                  </p>
                </div>
                {firstSegmentCheckedBaggage && (
                    <div className="space-y-1 rounded-2xl border border-border/50 bg-background p-3">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    {t("checkedBaggageLabel")}
                  </span>
                      <p className="flex items-center gap-1.5 font-bold text-foreground">
                        <Luggage className="size-3.5 text-primary" />
                        {firstSegmentCheckedBaggage.rule}
                      </p>
                    </div>
                )}
                <div className="space-y-1 rounded-2xl border border-border/50 bg-background p-3 xs:col-span-2 sm:col-span-1">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                {t("availableSeatsLabel")}
              </span>
                  <p className="font-bold text-foreground">
                    {t("seatsRemaining", { count: offer.seatsAvailable })}
                  </p>
                </div>
              </div>
            </div>
        )}
      </Card>
  );
});