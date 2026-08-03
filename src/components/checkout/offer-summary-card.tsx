// components/checkout/offer-summary-card.tsx
"use client";

import { useLocale, useTranslations } from "next-intl";
import { Building2, Plane, Calendar, CreditCard, Clock3, Car, Home, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { airlineLabel, formatDate, formatDateTime, formatMoney, providerLabel } from "@/lib/format";
import { RESERVATION_FEE_AMOUNT, RESERVATION_FEE_CURRENCY } from "@/lib/api/reservation-fee";
import { useHotelStore } from "@/store/useHotelStore";
import { useVehicleStore } from "@/store/use-vehicle-store";
import { usePropertyStore } from "@/store/use-property-store";
import type { OfferSummary } from "@/lib/offer-summary";
import type { PaymentPlanValue } from "@/components/checkout/checkout-form";

export function OfferSummaryCard({
                                   offer,
                                   paymentPlan = "PAY_NOW",
                                 }: {
  offer: OfferSummary;
  paymentPlan?: PaymentPlanValue;
}) {
  const t = useTranslations("Checkout");
  const locale = useLocale();

  // The checkout URL denormalizes a price at "book now" time (see lib/checkout-url.ts), but for
  // hotels that's the property-level search quote, not the specific room the guest actually added
  // to the cart, and it's never scaled by quantity. The cart populated by "Ajouter" on the room/
  // offer list is the one place holding the real unit price and quantity for what's actually being
  // booked, so it wins over the URL's amount whenever it still has a matching line for this offer.
  const hotelCartItem = useHotelStore((state) =>
      offer.offerType === "HOTEL" ? state.cartItems.find((item) => item.offerId === offer.offerId) : undefined
  );
  const vehicleCartItem = useVehicleStore((state) =>
      offer.offerType === "CAR_RENTAL" ? state.cartItems.find((item) => item.itemId === offer.offerId) : undefined
  );
  const propertyCartItem = usePropertyStore((state) =>
      offer.offerType === "FURNISHED_RENTAL" ? state.cartItems.find((item) => item.itemId === offer.offerId) : undefined
  );
  const cartItem = hotelCartItem ?? vehicleCartItem ?? propertyCartItem;

  const realAmount = cartItem ? cartItem.unitPrice * cartItem.quantity : Number(offer.amount);
  const realCurrency = cartItem ? cartItem.currency : offer.currency;
  const roomQuantity = offer.offerType === "HOTEL" ? (hotelCartItem?.quantity ?? offer.quantity) : undefined;

  const isPayLater = paymentPlan === "PAY_LATER";
  const displayedAmount = isPayLater ? RESERVATION_FEE_AMOUNT : realAmount;
  const displayedCurrency = isPayLater ? RESERVATION_FEE_CURRENCY : realCurrency;

  return (
      <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-zinc-900/30 backdrop-blur-xs">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border/40">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
            {t("summaryTitle") ?? "Récapitulatif"}
          </h3>
          <Badge variant="secondary" className="rounded-full font-medium px-2.5 py-0.5 text-[11px] border border-border/30">
            {/* {providerLabel(offer.providerType)}*/}
          </Badge>
        </div>

        <CardContent className="p-5 space-y-5">
          {offer.offerType === "FLIGHT" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-xs">
              <span className="rounded-lg bg-primary/10 text-primary px-2 py-0.5 font-bold tracking-wide">
                {offer.airline} {offer.flightNumber}
              </span>
                  <span className="font-semibold text-foreground/85">{airlineLabel(offer.airline)}</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="text-muted-foreground font-medium">{offer.cabinClass}</span>
                </div>

                <div className="relative pl-6 space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-primary/60 before:to-primary/20">
                  <div className="relative">
                    <span className="absolute -left-[23px] top-1 size-3.5 rounded-full border-2 border-primary bg-background" />
                    <div className="grid gap-0.5">
                      <span className="text-sm font-extrabold text-foreground">{offer.origin}</span>
                      <span className="text-xs text-muted-foreground">
                    {formatDateTime(offer.departureTime, locale)}
                  </span>
                    </div>
                  </div>
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

          {offer.offerType === "MULTI_CITY_FLIGHT" && (
              <div className="space-y-3">
                {offer.legs.map((leg, index) => (
                    <div key={leg.legIndex} className="relative grid gap-2 rounded-xl border border-border/50 bg-background/60 p-3 shadow-2xs">
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

          {offer.offerType === "HOTEL" && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Building2 className="size-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-foreground leading-tight">{offer.hotelName}</h4>
                    <p className="text-xs text-muted-foreground">
                      {offer.cityCode} • {offer.roomType}
                      {(roomQuantity ?? 1) > 1 ? ` • ${roomQuantity} chambres` : ""}
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

          {offer.offerType === "CAR_RENTAL" && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Car className="size-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-foreground leading-tight">
                      {offer.brand} {offer.model}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {offer.category} • {offer.pickupCity}
                      {offer.dropoffCity !== offer.pickupCity ? ` → ${offer.dropoffCity}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-background/50 border border-border/40 p-2.5 rounded-xl text-xs text-muted-foreground">
                  <Calendar className="size-3.5 text-primary shrink-0" />
                  <span>
                Du <strong className="text-foreground">{formatDate(offer.rentalStart, locale)}</strong> au <strong className="text-foreground">{formatDate(offer.rentalEnd, locale)}</strong>
              </span>
                </div>
              </div>
          )}

          {offer.offerType === "FURNISHED_RENTAL" && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Home className="size-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-foreground leading-tight">{offer.title}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3 shrink-0" />
                      {offer.city} • {offer.propertyType}
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

          {/* Notice explicite quand le prix affiché n'est pas le prix total */}
          {isPayLater && (
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300">
                <Clock3 className="size-3.5 shrink-0 mt-0.5" />
                <span>
              Ce montant correspond aux frais de réservation. Le solde de{" "}
                  <strong>{formatMoney({ amount: realAmount, currency: realCurrency }, locale)}</strong>{" "}
                  sera à régler ultérieurement.
            </span>
              </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {isPayLater ? "Frais de réservation" : "Total"}
            </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <CreditCard className="size-3 text-emerald-600" />
                {isPayLater ? "À régler maintenant" : "Taxes & frais inclus"}
            </span>
            </div>
            <span className="text-2xl font-black text-foreground tracking-tight">
            {formatMoney({ amount: displayedAmount, currency: displayedCurrency }, locale)}
          </span>
          </div>
        </CardContent>
      </Card>
  );
}