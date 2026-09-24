// app/[locale]/checkout/page.tsx
"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AncillaryOptionsStep } from "@/components/checkout/ancillary-options-step";
import { TravelerIdentitiesCard } from "@/components/checkout/traveler-identities-card";
import { pricedPassengerTypes, resizeIdentities, type TravelerIdentity } from "@/lib/traveler-identities";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OfferSummaryCard } from "@/components/checkout/offer-summary-card";
import { useAncillaryOptionsQuery, useCheckoutMultiCityMutation, useCheckoutMutation } from "@/hooks/use-booking";
import { normalizeApiError } from "@/lib/api/client";
import { parseOfferSummary } from "@/lib/offer-summary";
import type { CheckoutRequest, TravelerRequest } from "@/lib/api/types";

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
  const tExtras = useTranslations("AncillaryOptions");
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkoutMutation = useCheckoutMutation();
  const multiCityCheckoutMutation = useCheckoutMultiCityMutation();

  const offer = useMemo(() => parseOfferSummary(searchParams), [searchParams]);
  const isSubmitting = checkoutMutation.isPending || multiCityCheckoutMutation.isPending;

  const needsSeatSelection = offer?.offerType === "FLIGHT";
  const totalSteps = needsSeatSelection ? 2 : 1;
  // Étape 1 : qui voyage (noms tels que sur le passeport, types) avant les options - certaines
  // compagnies n'accordent bagages/repas/sièges qu'à des passagers nommés. Quand le tarif couvre
  // exactement les passagers de la recherche (Travel Terminus), leur nombre et leurs types sont figés.
  const pricedTypes = useMemo(
      () => (offer?.offerType === "FLIGHT" ? pricedPassengerTypes(offer.detail) : null), [offer]);
  const [identities, setIdentities] = useState<TravelerIdentity[]>(
      () => resizeIdentities([], pricedTypes?.length ?? 1, pricedTypes));
  const [identitiesConfirmed, setIdentitiesConfirmed] = useState(false);
  const seatCount = identities.length;

  // Étape "options supplémentaires" (voyageurs, bagages/repas/sièges/assurance) - vols uniquement,
  // avant le formulaire de coordonnées. Le choix des sièges vit désormais ici (section dédiée de
  // AncillaryOptionsStep, alimentée par les vraies données du fournisseur) : l'ancien plan de
  // cabine séparé montrait un plan simulé, sans rapport avec les sièges réels/tarifés récupérés
  // ici, et n'avait donc plus lieu d'être. La quote est demandée avec les vrais noms et types des
  // voyageurs, saisis juste avant (TravelerIdentitiesCard) : certaines compagnies ne tarifent les
  // options que pour des passagers nommés, dans l'ordre T1, T2... repris ensuite par le formulaire.
  const [extrasStepDone, setExtrasStepDone] = useState(false);
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const ancillaryOptionsRequest = useMemo(() => {
      if (!offer || offer.offerType !== "FLIGHT" || !identitiesConfirmed) return null;
      return {
          offerId: offer.offerId,
          offerType: offer.offerType,
          travelers: identities.map((identity) => ({
              fullName: `${identity.firstName.trim()} ${identity.lastName.trim()}`,
              firstName: identity.firstName.trim(),
              lastName: identity.lastName.trim(),
              type: identity.type,
          })),
      };
  }, [offer, identities, identitiesConfirmed]);
  const ancillaryOptionsQuery = useAncillaryOptionsQuery(
      ancillaryOptionsRequest,
      needsSeatSelection && !extrasStepDone
  );
  const extrasTotalAmount = useMemo(() => {
    if (!ancillaryOptionsQuery.data) return 0;
    const byId = new Map(ancillaryOptionsQuery.data.map((option) => [option.id, option]));
    return selectedExtraIds.reduce((sum, id) => sum + Number(byId.get(id)?.price.amount ?? 0), 0);
  }, [selectedExtraIds, ancillaryOptionsQuery.data]);

  /** Real per-traveler seat code ("1A"), derived from whichever SEAT-type extra is selected for
   *  each traveler's paxRef - feeds CheckoutForm's traveler rows so the "Siège X" badge reflects
   *  the actual (priced, provider-forwarded) seat pick instead of the old simulated one. */
  const seatLabelsByTraveler = useMemo(() => {
    if (!ancillaryOptionsQuery.data) return [];
    const byId = new Map(ancillaryOptionsQuery.data.map((option) => [option.id, option]));
    return Array.from({ length: seatCount }, (_, i) => {
      const paxRef = `T${i + 1}`;
      const selected = selectedExtraIds
          .map((id) => byId.get(id))
          .find((option) => option?.type === "SEAT" && option.paxRef === paxRef);
      return selected?.code ?? undefined;
    });
  }, [selectedExtraIds, ancillaryOptionsQuery.data, seatCount]);

  // Vols (simple ou multi-villes) uniquement : rend date de naissance/nationalité obligatoires et
  // vérifie que le passeport couvre bien le voyage (voir CheckoutForm) - mêmes règles que
  // BookingService.validateFlightTravelers côté serveur.
  const isFlightCheckout = offer?.offerType === "FLIGHT" || offer?.offerType === "MULTI_CITY_FLIGHT";
  const travelDate = offer?.offerType === "FLIGHT"
      ? offer.departureTime
      : offer?.offerType === "MULTI_CITY_FLIGHT"
          ? offer.legs[offer.legs.length - 1]?.arrivalTime
          : undefined;

  /** Distributes selected extra ids onto the matching traveler by the option's paxRef ("T1" ->
   *  index 0, ...); a booking-level option (no paxRef, e.g. INSURANCE) is attached to the first
   *  traveler - the backend never forwards it to a provider, it only needs to be counted once. */
  function applySelectedExtras(travelers: TravelerRequest[]): TravelerRequest[] {
    if (selectedExtraIds.length === 0 || !ancillaryOptionsQuery.data) return travelers;
    const byId = new Map(ancillaryOptionsQuery.data.map((option) => [option.id, option]));
    const idsByTravelerIndex = new Map<number, string[]>();
    for (const id of selectedExtraIds) {
      const option = byId.get(id);
      if (!option) continue;
      const digits = option.paxRef?.replace(/\D/g, "");
      const travelerIndex = digits ? Math.max(0, Number(digits) - 1) : 0;
      const ids = idsByTravelerIndex.get(travelerIndex) ?? [];
      ids.push(id);
      idsByTravelerIndex.set(travelerIndex, ids);
    }
    return travelers.map((traveler, index) => {
      const ids = idsByTravelerIndex.get(index);
      return ids ? { ...traveler, selectedAncillaryIds: ids } : traveler;
    });
  }

  function handleSubmit(partial: Omit<CheckoutRequest, "offerId" | "offerType">) {
    if (!offer) return;

    const travelers = applySelectedExtras(partial.travelers);
    const callbacks = {
      onSuccess: (booking: { id: string }) => {
        // Checkout now returns immediately with the provider hold still in progress
        // (status PENDING_HOLD) - the tracking page shows a "finalizing..." state and
        // auto-redirects here to /payment once the hold completes.
        router.push(`/bookings/${booking.id}`);
      },
      onError: (error: unknown) => {
        toast.error(normalizeApiError(error).message);
      },
    };

    if (offer.offerType === "MULTI_CITY_FLIGHT") {
      multiCityCheckoutMutation.mutate(
          { ...partial, travelers, legOfferIds: offer.legs.map((leg) => leg.offerId) },
          callbacks
      );
    } else {
      checkoutMutation.mutate(
          {
            ...partial,
            travelers,
            offerId: offer.offerId,
            offerType: offer.offerType,
            quantity: offer.offerType === "HOTEL" ? offer.quantity : undefined,
          },
          callbacks
      );
    }
  }
  const [paymentPlan, setPaymentPlan] = useState<"PAY_NOW" | "PAY_LATER">("PAY_NOW");
  /* OFFRE EXPIRÉE OU INVALIDE */
  if (!offer) {
    return (
        <div className="mx-auto max-w-xl px-4 py-12 sm:py-20">
          <Alert variant="destructive" className="rounded-2xl p-5 shadow-sm border-destructive/30">
            <AlertTitle className="text-base font-bold mb-1.5">{t("priceExpired")}</AlertTitle>
            <AlertDescription className="space-y-4">
              <p className="text-sm opacity-90 leading-relaxed">
                L&apos;offre sélectionnée n&apos;est plus disponible ou votre session a expiré. Veuillez relancer une recherche.
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

  /* ÉTAPE 1 : VOYAGEURS & OPTIONS SUPPLÉMENTAIRES (bagages, repas, sièges payants, assurance) */
  if (needsSeatSelection && !extrasStepDone && offer.offerType === "FLIGHT") {
    return (
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:py-10 grid-cols-1 lg:grid-cols-[1fr_360px]">
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <OfferSummaryCard offer={offer} extrasTotal={extrasTotalAmount} />
            </div>
          </div>

          <div className="order-2 lg:order-1 space-y-5 sm:space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                  Étape 1 sur {totalSteps}
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
                <PackagePlus className="size-5 sm:size-6 text-primary shrink-0" />
                {tExtras("title")}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{tExtras("subtitle")}</p>
            </div>

            <TravelerIdentitiesCard
                identities={identities}
                onChange={setIdentities}
                fixedMix={pricedTypes !== null}
                maxTravelers={MAX_SEATS}
                confirmed={identitiesConfirmed}
                onConfirm={() => setIdentitiesConfirmed(true)}
                onEdit={() => {
                    setIdentitiesConfirmed(false);
                    setSelectedExtraIds([]);
                }}
            />

            {identitiesConfirmed && (
                <div className="rounded-2xl border border-border/60 bg-background p-4 sm:p-6 shadow-2xs">
                  <AncillaryOptionsStep
                      options={ancillaryOptionsQuery.data}
                      isLoading={ancillaryOptionsQuery.isLoading}
                      isError={ancillaryOptionsQuery.isError}
                      travelerCount={seatCount}
                      selectedIds={selectedExtraIds}
                      onChange={setSelectedExtraIds}
                      onContinue={() => setExtrasStepDone(true)}
                      onSkip={() => {
                        setSelectedExtraIds([]);
                        setExtrasStepDone(true);
                      }}
                  />
                </div>
            )}
          </div>
        </div>
    );
  }

  /* ÉTAPE 3 : FORMULAIRE DE PAIEMENT & PASSAGERS */
  return (
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:py-10 grid-cols-1 lg:grid-cols-[1fr_360px]">
        {/* Résumé de l'offre */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-24">
            <OfferSummaryCard offer={offer} paymentPlan={paymentPlan} extrasTotal={extrasTotalAmount} />
          </div>
        </div>

        {/* Formulaire de coordonnées */}
        <div className="order-2 lg:order-1 space-y-5 sm:space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                {needsSeatSelection ? `Étape ${totalSteps} sur ${totalSteps}` : "Étape 1 sur 1"}
              </Badge>

              {/* Bouton pour revenir aux étapes précédentes si applicable */}
              {needsSeatSelection && (
                  <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setExtrasStepDone(false)}
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 rounded-lg"
                  >
                    <ArrowLeft className="size-3" />
                    Modifier les options
                  </Button>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Complétez vos coordonnées pour finaliser la réservation de votre voyage.
            </p>

            {/* Badge récapitulatif des options supplémentaires sélectionnées */}
            {selectedExtraIds.length > 0 && (
                <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40">
                  <PackagePlus className="size-3.5 shrink-0" />
                  {tExtras("selectedCount", { count: selectedExtraIds.length })}
                </div>
            )}
          </div>

          <div className="rounded-2xl border border-border/60 bg-background p-4 sm:p-6 shadow-2xs">
            <CheckoutForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                travelerCount={needsSeatSelection ? seatCount : undefined}
                initialTravelers={needsSeatSelection ? identities : undefined}
                seatLabelsByTraveler={seatLabelsByTraveler}
                onPaymentPlanChange={setPaymentPlan}
                isFlight={isFlightCheckout}
                travelDate={travelDate}
            />
          </div>
        </div>
      </div>
  );
}