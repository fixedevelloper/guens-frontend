// app/[locale]/checkout/page.tsx
"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Minus, Plus, Armchair, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OfferSummaryCard } from "@/components/checkout/offer-summary-card";
import { SeatMap } from "@/components/checkout/seat-map";
import { useCheckoutMultiCityMutation, useCheckoutMutation } from "@/hooks/use-booking";
import { normalizeApiError } from "@/lib/api/client";
import { parseOfferSummary } from "@/lib/offer-summary";
import type { CheckoutRequest } from "@/lib/api/types";

const MAX_SEATS = 9;

export default function CheckoutPage() {
  return (
      <Suspense
          fallback={
            <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10 space-y-6">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_360px]">
                <Skeleton className="h-[550px] w-full rounded-2xl" />
                <Skeleton className="h-80 w-full rounded-2xl" />
              </div>
            </div>
          }
      >
        <CheckoutPageContent />
      </Suspense>
  );
}

function CheckoutPageContent() {
  const t = useTranslations("Checkout");
  const tSeat = useTranslations("SeatSelection");
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkoutMutation = useCheckoutMutation();
  const multiCityCheckoutMutation = useCheckoutMultiCityMutation();

  const offer = useMemo(() => parseOfferSummary(searchParams), [searchParams]);
  const isSubmitting = checkoutMutation.isPending || multiCityCheckoutMutation.isPending;

  const needsSeatSelection = offer?.offerType === "FLIGHT";
  const [seatStepDone, setSeatStepDone] = useState(false);
  const [seatCount, setSeatCount] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  function changeSeatCount(next: number) {
    const clamped = Math.max(1, Math.min(MAX_SEATS, next));
    setSeatCount(clamped);
    setSelectedSeats((seats) => seats.slice(0, clamped));
  }

  function handleSubmit(partial: Omit<CheckoutRequest, "offerId" | "offerType">) {
    if (!offer) return;

    const callbacks = {
      onSuccess: (booking: { id: string }) => {
        router.push(`/payment/${booking.id}`);
      },
      onError: (error: unknown) => {
        toast.error(normalizeApiError(error).message);
      },
    };

    if (offer.offerType === "MULTI_CITY_FLIGHT") {
      multiCityCheckoutMutation.mutate(
          { ...partial, legOfferIds: offer.legs.map((leg) => leg.offerId) },
          callbacks
      );
    } else {
      checkoutMutation.mutate(
          { ...partial, offerId: offer.offerId, offerType: offer.offerType },
          callbacks
      );
    }
  }

  /* OFFRE EXPIRÉE OU INVALIDE */
  if (!offer) {
    return (
        <div className="mx-auto max-w-xl px-4 py-12 sm:py-20">
          <Alert variant="destructive" className="rounded-2xl p-5 shadow-sm border-destructive/30">
            <AlertTitle className="text-base font-bold mb-1.5">{t("priceExpired")}</AlertTitle>
            <AlertDescription className="space-y-4">
              <p className="text-sm opacity-90 leading-relaxed">
                L'offre sélectionnée n'est plus disponible ou votre session a expiré. Veuillez relancer une recherche.
              </p>
              <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl font-semibold bg-background border-destructive/20 hover:bg-destructive/10"
                  onClick={() => router.push("/")}
              >
                {t("submit") ?? "Retour à l'accueil"}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
    );
  }

  /* ÉTAPE 1 : SÉLECTION DES SIÈGES */
  if (needsSeatSelection && !seatStepDone && offer.offerType === "FLIGHT") {
    return (
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:py-10 grid-cols-1 lg:grid-cols-[1fr_360px]">
          {/* Résumé de l'offre (Mobile: Premier / Desktop: Colonne de droite) */}
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <OfferSummaryCard offer={offer} />
            </div>
          </div>

          {/* Sélection des sièges (Mobile: Second / Desktop: Colonne de gauche) */}
          <div className="order-2 lg:order-1 space-y-5 sm:space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                  Étape 1 sur 2
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
                <Armchair className="size-5 sm:size-6 text-primary shrink-0" />
                {tSeat("title") ?? "Choix des sièges"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Sélectionnez vos places préférées pour votre voyage.
              </p>
            </div>

            {/* Sélecteur du nombre de passagers */}
            <Card className="border-border/60 shadow-2xs rounded-2xl">
              <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold block">{tSeat("travelerCount") ?? "Nombre de passagers"}</span>
                  <span className="text-xs text-muted-foreground block">Maximum {MAX_SEATS} passagers</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-zinc-900/80 p-1 rounded-xl">
                  <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg hover:bg-background shadow-2xs active:scale-95 transition-all"
                      onClick={() => changeSeatCount(seatCount - 1)}
                      disabled={seatCount <= 1}
                      aria-label={tSeat("travelerCount")}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-6 text-center text-sm font-bold text-foreground">{seatCount}</span>
                  <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg hover:bg-background shadow-2xs active:scale-95 transition-all"
                      onClick={() => changeSeatCount(seatCount + 1)}
                      disabled={seatCount >= MAX_SEATS}
                      aria-label={tSeat("travelerCount")}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Plan de cabine interactif */}
            <div className="rounded-2xl border border-border/60 bg-background p-4 sm:p-6 shadow-2xs">
              <SeatMap
                  offerId={offer.offerId}
                  seatCount={seatCount}
                  selectedSeats={selectedSeats}
                  onChange={setSelectedSeats}
                  onContinue={() => setSeatStepDone(true)}
                  onSkip={() => {
                    setSelectedSeats([]);
                    setSeatStepDone(true);
                  }}
              />
            </div>
          </div>
        </div>
    );
  }

  /* ÉTAPE 2 : FORMULAIRE DE PAIEMENT & PASSAGERS */
  return (
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:py-10 grid-cols-1 lg:grid-cols-[1fr_360px]">
        {/* Résumé de l'offre */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-24">
            <OfferSummaryCard offer={offer} />
          </div>
        </div>

        {/* Formulaire de coordonnées */}
        <div className="order-2 lg:order-1 space-y-5 sm:space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                {needsSeatSelection ? "Étape 2 sur 2" : "Étape 1 sur 1"}
              </Badge>

              {/* Bouton pour revenir à la sélection des sièges si applicable */}
              {needsSeatSelection && (
                  <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSeatStepDone(false)}
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 rounded-lg"
                  >
                    <ArrowLeft className="size-3" />
                    Modifier les sièges
                  </Button>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Complétez vos coordonnées pour finaliser la réservation de votre voyage.
            </p>

            {/* Badge récapitulatif des sièges sélectionnés */}
            {selectedSeats.length > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  Sièges choisis : {selectedSeats.join(", ")}
                </div>
            )}
          </div>

          <div className="rounded-2xl border border-border/60 bg-background p-4 sm:p-6 shadow-2xs">
            <CheckoutForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                selectedSeats={selectedSeats}
            />
          </div>
        </div>
      </div>
  );
}