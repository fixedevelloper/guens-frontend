"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Minus, Plus, Armchair, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { OfferSummaryCard } from "@/components/checkout/offer-summary-card";
import { SeatMap } from "@/components/checkout/seat-map";
import { normalizeApiError } from "@/lib/api/client";
import { parseOfferSummary } from "@/lib/offer-summary";
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
    const searchParams = useSearchParams();
    const router = useRouter();

    const offer = useMemo(() => parseOfferSummary(searchParams), [searchParams]);


    const needsSeatSelection = offer?.offerType === "FLIGHT";
    const [seatStepDone, setSeatStepDone] = useState(false);
    const [seatCount, setSeatCount] = useState(1);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

    function changeSeatCount(next: number) {
        const clamped = Math.max(1, Math.min(MAX_SEATS, next));
        setSeatCount(clamped);
        setSelectedSeats((seats) => seats.slice(0, clamped));
    }

    const checkoutMutation = useCreateBookingHoldMutation();
    const multiCityCheckoutMutation = useCreateBookingMultiCityMutation();

    const isSubmitting =
        checkoutMutation.isPending || multiCityCheckoutMutation.isPending;

    function handleSubmit(formValues: ResellerCheckoutFormValues) {
        if (!offer) return;

        const callbacks = {
            onSuccess: (booking: { bookingId: string }) => {
                router.push(`/dashboard/reseller/payment/${booking.bookingId}`);
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
                        <p className="text-sm opacity-90">
                            L'offre sélectionnée n'est plus disponible ou la session a expiré.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full bg-background"
                            onClick={() => router.push("/")}
                        >
                            {t("submit")}
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    /* ÉTAPE 1 : SÉLECTION DES SIÈGES (Si applicable) */
    if (needsSeatSelection && !seatStepDone && offer.offerType === "FLIGHT") {
        return (
            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:py-10 sm:grid-cols-[1fr_320px]">
                {/* Offre en premier sur mobile (order-1), à droite sur desktop (sm:order-2) */}
                <div className="order-1 sm:order-2">
                    <div className="sm:sticky sm:top-24">
                        <OfferSummaryCard offer={offer} />
                    </div>
                </div>

                {/* Plan de cabine en dessous sur mobile (order-2), à gauche sur desktop (sm:order-1) */}
                <div className="order-2 sm:order-1 space-y-6">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                            <Armchair className="size-5 sm:size-6 text-primary" />
                            {tSeat("title") ?? "Choix des sièges"}
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Sélectionnez vos places préférées pour votre voyage.
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

                    {/* Carte de cabine interactive */}
                    <div className="rounded-2xl border border-border/60 bg-background p-4 sm:p-6 shadow-sm">
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

    /* ÉTAPE 2 : INFORMATIONS ET FORMULAIRE DE COORDONNÉES */
    return (
        <div className="mx-auto grid max-w-4xl gap-6 px-4 py-6 sm:py-10 sm:grid-cols-[1fr_320px]">
            {/* Offre en premier sur mobile, à droite sur desktop */}
            <div className="order-1 sm:order-2">
                <div className="sm:sticky sm:top-24">
                    <OfferSummaryCard offer={offer} />
                </div>
            </div>

            {/* Formulaire de paiement en dessous sur mobile, à gauche sur desktop */}
            <div className="order-2 sm:order-1 space-y-6">
                <div className="space-y-1">
                    {needsSeatSelection && seatStepDone && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2 mb-1"
                            onClick={() => setSeatStepDone(false)}
                        >
                            <ArrowLeft className="size-3.5" />
                            {tSeat("title") ?? "Modifier le choix des sièges"}
                        </Button>
                    )}
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                        {t("title")}
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Complétez vos coordonnées pour finaliser la réservation de votre voyage.
                    </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background p-5 sm:p-6 shadow-sm">
                    <ResellerCheckoutForm
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        selectedSeats={selectedSeats}
                    />
                </div>
            </div>
        </div>
    );
}