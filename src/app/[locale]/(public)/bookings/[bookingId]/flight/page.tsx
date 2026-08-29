"use client";

import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  Luggage,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  ShieldCheck,
  Sofa,
  User,
  UtensilsCrossed,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookingQuery, useFlightOrderDetailQuery } from "@/hooks/use-booking";
import { airlineLabel, formatDateTime } from "@/lib/format";
import type { BookingTravelerResponse, FlightOrderDetailTraveler } from "@/lib/api/types";

export default function FlightDetailPage() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = params.bookingId;
  const t = useTranslations("FlightDetail");
  const locale = useLocale();

  const bookingQuery = useBookingQuery(bookingId);
  const booking = bookingQuery.data;
  const orderDetailQuery = useFlightOrderDetailQuery(
      bookingId,
      booking?.offerType === "FLIGHT" && !!booking.providerConfirmationNumber,
  );
  const orderDetail = orderDetailQuery.data;

  if (bookingQuery.isLoading) {
    return (
        <div className="mx-auto max-w-7xl px-4 py-10 space-y-4">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
    );
  }

  if (!booking || booking.offerType !== "FLIGHT") {
    return (
        <div className="mx-auto max-w-7xl px-4 py-10">
          <Alert variant="destructive" className="rounded-2xl border-destructive/25 bg-destructive/[0.03]">
            <AlertDescription className="font-medium text-destructive">
              {t("notAvailable")}
            </AlertDescription>
          </Alert>
        </div>
    );
  }

  const legs = booking.itineraryLegs.length > 0
      ? booking.itineraryLegs
      : [{
        legIndex: 0,
        airline: booking.airline ?? "",
        flightNumber: booking.flightNumber ?? "",
        origin: booking.origin ?? "",
        destination: booking.destination ?? "",
        departureTime: booking.departureTime ?? "",
        arrivalTime: booking.arrivalTime ?? "",
      }];

  // Extra per-traveler detail (baggage/meals/seats) is only available for providers that support
  // getFlightOrderDetail (Travel Terminus today) - matched positionally since both lists come from
  // the same original passenger order sent to the provider.
  const detailByIndex = new Map<number, FlightOrderDetailTraveler>();
  orderDetail?.travelers.forEach((traveler, index) => detailByIndex.set(index, traveler));

  return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10 space-y-6">
        <Button
            asChild
            variant="ghost"
            size="sm"
            className="group -ml-2.5 rounded-xl text-muted-foreground hover:text-foreground font-semibold text-xs gap-1.5"
        >
          <Link href={`/bookings/${bookingId}`}>
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            {t("backToBooking")}
          </Link>
        </Button>

        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* ITINÉRAIRE */}
        <Card className="rounded-2xl border-border/60 shadow-xs overflow-hidden">
          <CardHeader className="bg-slate-50/40 dark:bg-zinc-900/10 border-b border-border/40 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
              <Plane className="size-4 text-primary" />
              {t("itinerary")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {legs.map((leg) => (
                <div
                    key={leg.legIndex}
                    className="grid gap-3 rounded-xl border border-border/50 p-4 text-sm bg-slate-50/10 dark:bg-zinc-900/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 font-bold font-mono text-[10px] tracking-wider text-foreground">
                      {leg.airline}{leg.flightNumber}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">{airlineLabel(leg.airline)}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="flex items-start gap-2.5">
                      <PlaneTakeoff className="size-4 text-muted-foreground/60 shrink-0 mt-0.5" />
                      <div className="grid gap-0.5">
                        <span className="text-xs font-bold text-foreground/90 uppercase">{leg.origin}</span>
                        <span className="text-[11px] text-muted-foreground">{formatDateTime(leg.departureTime, locale)}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <PlaneLanding className="size-4 text-muted-foreground/60 shrink-0 mt-0.5" />
                      <div className="grid gap-0.5">
                        <span className="text-xs font-bold text-foreground/90 uppercase">{leg.destination}</span>
                        <span className="text-[11px] text-muted-foreground">{formatDateTime(leg.arrivalTime, locale)}</span>
                      </div>
                    </div>
                  </div>
                </div>
            ))}
            {booking.providerConfirmationNumber && (
                <p className="text-[11px] text-muted-foreground font-mono pt-1">
                  {t("pnr")}: <span className="font-bold text-foreground">{booking.providerConfirmationNumber}</span>
                  {orderDetail?.bookingStatus && (
                      <span className="ml-2 text-muted-foreground">({orderDetail.bookingStatus})</span>
                  )}
                </p>
            )}
          </CardContent>
        </Card>

        {/* VOYAGEURS */}
        <Card className="rounded-2xl border-border/60 shadow-xs overflow-hidden">
          <CardHeader className="bg-slate-50/40 dark:bg-zinc-900/10 border-b border-border/40 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
              <User className="size-4 text-primary" />
              {t("travelers")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {orderDetailQuery.isLoading && (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
            )}
            {booking.travelers.map((traveler, index) => (
                <TravelerCard
                    key={`${traveler.fullName}-${index}`}
                    traveler={traveler}
                    detail={detailByIndex.get(index)}
                    t={t}
                />
            ))}
            {!orderDetailQuery.isLoading && !orderDetail && (
                <p className="text-xs text-muted-foreground/80 italic pt-1">{t("extraDetailUnavailable")}</p>
            )}
          </CardContent>
        </Card>

        {/* POLITIQUE D'ANNULATION */}
        {orderDetail && orderDetail.cancellationRules.length > 0 && (
            <Card className="rounded-2xl border-border/60 shadow-xs overflow-hidden">
              <CardHeader className="bg-slate-50/40 dark:bg-zinc-900/10 border-b border-border/40 pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  {t("cancellationPolicy")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-2.5">
                {orderDetail.cancellationRules.map((rule, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between rounded-xl border border-border/40 p-3.5 text-sm bg-slate-50/10 dark:bg-zinc-900/5"
                    >
                      <Badge
                          variant="outline"
                          className={
                            rule.refundable
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold"
                                : "bg-rose-500/10 text-rose-600 border-rose-500/20 font-bold"
                          }
                      >
                        {rule.refundable ? t("refundable") : t("nonRefundable")}
                      </Badge>
                      {rule.adultCharges && (
                          <span className="text-xs font-semibold text-muted-foreground">
                      {t("cancellationCharges")}: {rule.adultCharges} {rule.currency}
                    </span>
                      )}
                    </div>
                ))}
              </CardContent>
            </Card>
        )}
      </div>
  );
}

function TravelerCard({
  traveler,
  detail,
  t,
}: {
  traveler: BookingTravelerResponse;
  detail: FlightOrderDetailTraveler | undefined;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
      <div className="rounded-xl border border-border/50 p-4 space-y-3 bg-slate-50/10 dark:bg-zinc-900/5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-foreground">{traveler.fullName}</p>
            <p className="text-[11px] text-muted-foreground uppercase font-semibold">{traveler.type}</p>
          </div>
          {traveler.seatNumber && (
              <Badge variant="outline" className="gap-1 font-mono font-bold">
                <Sofa className="size-3" /> {traveler.seatNumber}
              </Badge>
          )}
        </div>

        {detail && (detail.baggages.length > 0 || detail.meals.length > 0 || detail.seats.length > 0) && (
            <div className="grid gap-2 pt-1">
              {detail.baggages.map((bag, index) => (
                  <div key={`bag-${index}`} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Luggage className="size-3.5 text-primary shrink-0" />
                    <span>{bag.description ?? t("extraBaggage")}</span>
                    {bag.price && (
                        <span className="ml-auto font-semibold text-foreground">
                      {bag.price} {bag.currency}
                    </span>
                    )}
                  </div>
              ))}
              {detail.meals.map((meal, index) => (
                  <div key={`meal-${index}`} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <UtensilsCrossed className="size-3.5 text-primary shrink-0" />
                    <span>{meal.description ?? t("meal")}</span>
                    {meal.price && (
                        <span className="ml-auto font-semibold text-foreground">
                      {meal.price} {meal.currency}
                    </span>
                    )}
                  </div>
              ))}
              {detail.seats.map((seat, index) => (
                  <div key={`seat-${index}`} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sofa className="size-3.5 text-primary shrink-0" />
                    <span>
                  {t("seat")} {seat.row}{seat.column}
                </span>
                    {seat.price && (
                        <span className="ml-auto font-semibold text-foreground">
                      {seat.price} {seat.currency}
                    </span>
                    )}
                  </div>
              ))}
            </div>
        )}
      </div>
  );
}
