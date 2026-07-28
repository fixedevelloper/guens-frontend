// components/search/vehicle-results.tsx
"use client";

import { useLocale, useTranslations } from "next-intl";
import { Car, Users, Fuel, Settings2, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatMoney } from "@/lib/format";
import { useVehicleStore } from "@/store/use-vehicle-store";
import type { HarmonizedVehicleOffer } from "@/lib/api/types";

export function VehicleResultsList({ offers }: { offers: HarmonizedVehicleOffer[] }) {
    const t = useTranslations("CarRentalSearch");

    if (offers.length === 0) {
        return (
            <Alert className="rounded-2xl border-dashed border-border/80 bg-background/50 p-8 text-center">
                <AlertDescription className="text-sm text-muted-foreground font-medium">
                    {t("noResults") ?? "Aucun véhicule disponible pour ces critères."}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer, index) => (
                <VehicleOfferCard key={`${offer.brand}-${offer.model}-${index}`} offer={offer} />
            ))}
        </div>
    );
}

function VehicleOfferCard({ offer }: { offer: HarmonizedVehicleOffer }) {
    const t = useTranslations("CarRentalSearch");
    const locale = useLocale();

    const addToCart = useVehicleStore((state) => state.addToCart);
    const selectOffer = useVehicleStore((state) => state.selectOffer);

    const sortedQuotes = [...offer.quotes].sort(
        (a, b) => Number(a.price.amount) - Number(b.price.amount)
    );
    const cheapestQuote = sortedQuotes[0];

    function handleSelect(offerId: string, unitPrice: number, currency: string) {
        selectOffer(offer);
        addToCart({
            itemId: offerId,
            brand: offer.brand,
            model: offer.model,
            category: offer.category,
            pickupCity: offer.pickupCity,
            rentalStart: offer.rentalStart,
            rentalEnd: offer.rentalEnd,
            unitPrice,
            currency,
        });
    }

    return (
        <Card className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xs hover:shadow-md hover:border-border/90 transition-all">
            <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                <Car className="size-10 stroke-[1.5]" />
            </div>

            <CardContent className="p-4 space-y-3">
                <div>
                    <h4 className="text-base font-black tracking-tight text-foreground">
                        {offer.brand} {offer.model}
                    </h4>
                    <Badge variant="secondary" className="mt-1 rounded-md text-[10px] font-bold">
                        {offer.category}
                    </Badge>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground font-semibold">
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
                {offer.seats} places
            </span>
                    <span className="flex items-center gap-1">
              <Settings2 className="size-3.5" />
                        {offer.transmission}
            </span>
                    {offer.airConditioning && (
                        <span className="flex items-center gap-1">
                  <Fuel className="size-3.5" />
                  Climatisation
                </span>
                    )}
                </div>

                {offer.withDriver && (
                    <Badge variant="outline" className="rounded-md text-[10px] font-bold border-emerald-500/30 text-emerald-600">
                        Avec chauffeur
                    </Badge>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div>
                        <div className="text-lg font-black text-foreground tracking-tight">
                            {cheapestQuote && formatMoney(cheapestQuote.price, locale)}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">
                Total séjour
              </span>
                    </div>
                    {cheapestQuote && (
                        <Button
                            size="sm"
                            onClick={() => handleSelect(
                                cheapestQuote.offerId,
                                Number(cheapestQuote.price.amount),
                                cheapestQuote.price.currency
                            )}
                            className="rounded-xl font-bold text-xs gap-1"
                        >
                            {t("select") ?? "Choisir"}
                            <ChevronRight className="size-3.5" />
                        </Button>
                    )}
                </div>

                {sortedQuotes.length > 1 && (
                    <div className="pt-2 border-t border-border/30 space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {sortedQuotes.length - 1} autre{sortedQuotes.length > 2 ? "s" : ""} option{sortedQuotes.length > 2 ? "s" : ""}
                        </p>
                        {sortedQuotes.slice(1).map((quote) => (
                            <div
                                key={quote.offerId}
                                onClick={() => handleSelect(quote.offerId, Number(quote.price.amount), quote.price.currency)}
                                className="flex items-center justify-between p-1.5 rounded-lg bg-muted/30 hover:bg-muted/60 cursor-pointer transition-colors text-xs"
                            >
                                <span className="text-muted-foreground font-semibold">{quote.providerType}</span>
                                <span className="font-bold text-foreground">{formatMoney(quote.price, locale)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}