"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Minus, Plus, ArrowLeft, PackagePlus } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AncillaryOptionsStep } from "@/components/checkout/ancillary-options-step";
import { OfferSummaryCard } from "@/components/checkout/offer-summary-card";
import { useAncillaryOptionsQuery } from "@/hooks/use-booking";
import { normalizeApiError } from "@/lib/api/client";
import { parseOfferSummary } from "@/lib/offer-summary";
import type { TravelerRequest } from "@/lib/api/types";
import {
    useCreateBookingHoldMutation,
    useCreateBookingMultiCityMutation,
} from "@/hooks/use-reseller-booking";
import {
    ResellerCheckoutForm,
    type ResellerCheckoutFormValues,
} from "@/components/checkout/reseller-checkout-form";
import {ResellerBookingCheckout, ResellerBookingCheckoutMultiCity} from "@/lib/api/reseller-booking";

const MAX_SEATS = 9;

export default function ResellerCheckoutPage() {
    return (
        <Suspense
            fallback={
                <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
                    <Skeleton className="h-10 w-1/3 rounded-xl" />
                    <div className="grid gap-6 sm:grid-cols-[1fr_320px]">
                        <Skeleton className="h-[500px] w-full rounded-2xl" />
                        <Skeleton className="h-96 w-full rounded-2xl" />
                    </div>
                </div>
            }
        >
            <ResellerCheckoutPageContent />
        </Suspense>
    );
}

function ResellerCheckoutPageContent() {
    const t = useTranslations("Checkout");
    const tSeat = useTranslations("SeatSelection");
    const tExtras = useTranslations("AncillaryOptions");
    const searchParams = useSearchParams();
    const router = useRouter();

    const offer = useMemo(() => parseOfferSummary(searchParams), [searchParams]);

    const needsSeatSelection = offer?.offerType === "FLIGHT";
    const [seatCount, setSeatCount] = useState(1);

    // Étape "voyageurs & options" (bagages/repas/sièges/assurance) - le choix des sièges vit dans
    // la section dédiée de AncillaryOptionsStep (vraies données/prix du fournisseur) ; l'ancien
    // plan de cabine séparé montrait un plan simulé sans rapport avec les sièges réels récupérés
    // ici, et n'avait donc plus lieu d'être (voir checkout/page.tsx pour le détail).
    const [extrasStepDone, setExtrasStepDone] = useState(false);
    const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
    const ancillaryOptionsRequest = useMemo(() => {
        if (!offer || offer.offerType !== "FLIGHT") return null;
        return {
            offerId: offer.offerId,
            offerType: offer.offerType,
            travelers: Array.from({ length: seatCount }, (_, i) => ({
                fullName: `Voyageur ${i + 1}`,
                type: "ADULT" as const,
            })),
        };
    }, [offer, seatCount]);
    const ancillaryOptionsQuery = useAncillaryOptionsQuery(
        ancillaryOptionsRequest,
        needsSeatSelection && !extrasStepDone
    );
    const extrasTotalAmount = useMemo(() => {
        if (!ancillaryOptionsQuery.data) return 0;
        const byId = new Map(ancillaryOptionsQuery.data.map((option) => [option.id, option]));
        return selectedExtraIds.reduce((sum, id) => sum + Number(byId.get(id)?.price.amount ?? 0), 0);
    }, [selectedExtraIds, ancillaryOptionsQuery.data]);
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

    function changeSeatCount(next: number) {
        const clamped = Math.max(1, Math.min(MAX_SEATS, next));
        setSeatCount(clamped);
        if (ancillaryOptionsQuery.data) {
            const byId = new Map(ancillaryOptionsQuery.data.map((option) => [option.id, option]));
            const validPaxRefs = new Set(Array.from({ length: clamped }, (_, i) => `T${i + 1}`));
            setSelectedExtraIds((ids) => ids.filter((id) => {
                const option = byId.get(id);
                return !option?.paxRef || validPaxRefs.has(option.paxRef);
            }));
        }
    }

    /** Distributes selected extra ids onto the matching traveler by the option's paxRef, same
     *  logic as the main checkout page - see checkout/page.tsx#applySelectedExtras. */
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

    const checkoutMutation = useCreateBookingHoldMutation();
    const multiCityCheckoutMutation = useCreateBookingMultiCityMutation();

    const isSubmitting =
        checkoutMutation.isPending || multiCityCheckoutMutation.isPending;

    function handleSubmit(formValues: ResellerCheckoutFormValues) {
        if (!offer) return;

        const travelers = applySelectedExtras(formValues.checkout.travelers);
        const callbacks = {
            onSuccess: (booking: { id: string }) => {
                router.push(`/dashboard/reseller/payment/${booking.id}`);
            },
            onError: (error: unknown) => {
                toast.error(normalizeApiError(error).message);
            },
        };

        if (offer.offerType === "MULTI_CITY_FLIGHT") {
            // 1. Payload typé ResellerBookingCheckoutMultiCity
            const payload: ResellerBookingCheckoutMultiCity = {
                customAmount: formValues.customAmount,
                checkout: {
                    ...formValues.checkout,
                    travelers,
                    legOfferIds: offer.legs.map((leg) => leg.offerId),
                },
            };

            multiCityCheckoutMutation.mutate(payload, callbacks);
        } else {
            // 2. Payload typé ResellerBookingCheckout
            const payload: ResellerBookingCheckout = {
                customAmount: formValues.customAmount,
                checkout: {
                    ...formValues.checkout,
                    travelers,
                    offerId: offer.offerId,
                    offerType: offer.offerType,
                },
            };

            checkoutMutation.mutate(payload, callbacks);
        }
    }

    if (!offer) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-12">
                <Alert
                    variant="destructive"
                    className="rounded-2xl shadow-sm border-destructive/30"
                >
                    <AlertTitle className="font-bold mb-1">
                        {t("priceExpired")}
                    </AlertTitle>
                    <AlertDescription className="space-y-3">
                        {t("priceExpiredDesc")}
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full bg-background"
                            onClick={() => router.push("/dashboard/reseller/overlays")}
                        >
                            {t("submit")}
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    /* ÉTAPE 1 : VOYAGEURS & OPTIONS SUPPLÉMENTAIRES (Si applicable) */
    if (needsSeatSelection && !extrasStepDone && offer.offerType === "FLIGHT") {
        return (
            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:py-10 sm:grid-cols-[1fr_320px]">
                <div className="order-1 sm:order-2">
                    <div className="sm:sticky sm:top-24">
                        <OfferSummaryCard offer={offer} extrasTotal={extrasTotalAmount} />
                    </div>
                </div>

                <div className="order-2 sm:order-1 space-y-6">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                            <PackagePlus className="size-5 sm:size-6 text-primary" />
                            {tExtras("title")}
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {tExtras("subtitle")}
                        </p>
                    </div>

                    {/* Sélecteur de passagers */}
                    <Card className="border-border/60 shadow-sm rounded-2xl">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                <span className="text-sm font-bold block">
                  {tSeat("travelerCount") ?? "Nombre de passagers"}
                </span>
                                <span className="text-xs text-muted-foreground block">
                  Maximum {MAX_SEATS} passagers
                </span>
                            </div>
                            <div className="flex items-center gap-2.5 bg-slate-100/80 dark:bg-zinc-900 p-1 rounded-xl">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 rounded-lg hover:bg-background shadow-xs active:scale-95 transition-all"
                                    onClick={() => changeSeatCount(seatCount - 1)}
                                    disabled={seatCount <= 1}
                                    aria-label={tSeat("travelerCount")}
                                >
                                    <Minus className="size-4" />
                                </Button>
                                <span className="w-6 text-center text-sm font-bold text-foreground">
                  {seatCount}
                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 rounded-lg hover:bg-background shadow-xs active:scale-95 transition-all"
                                    onClick={() => changeSeatCount(seatCount + 1)}
                                    disabled={seatCount >= MAX_SEATS}
                                    aria-label={tSeat("travelerCount")}
                                >
                                    <Plus className="size-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="rounded-2xl border border-border/60 bg-background p-4 sm:p-6 shadow-sm">
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
                </div>
            </div>
        );
    }

    /* ÉTAPE 2 : INFORMATIONS ET FORMULAIRE DE COORDONNÉES */
    return (
        <div className="mx-auto grid max-w-4xl gap-6 px-4 py-6 sm:py-10 sm:grid-cols-[1fr_320px]">
            {/* Offre en premier sur mobile, à droite sur desktop */}
            <div className="order-1 sm:order-2">
                <div className="sm:sticky sm:top-24">
                    <OfferSummaryCard offer={offer} extrasTotal={extrasTotalAmount} />
                </div>
            </div>

            {/* Formulaire de paiement en dessous sur mobile, à gauche sur desktop */}
            <div className="order-2 sm:order-1 space-y-6">
                <div className="space-y-1">
                    {needsSeatSelection && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2 mb-1"
                            onClick={() => setExtrasStepDone(false)}
                        >
                            <ArrowLeft className="size-3.5" />
                            {tExtras("title")}
                        </Button>
                    )}
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                        {t("title")}
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background p-5 sm:p-6 shadow-sm">
                    <ResellerCheckoutForm
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        travelerCount={needsSeatSelection ? seatCount : undefined}
                        seatLabelsByTraveler={seatLabelsByTraveler}
                    />
                </div>
            </div>
        </div>
    );
}
