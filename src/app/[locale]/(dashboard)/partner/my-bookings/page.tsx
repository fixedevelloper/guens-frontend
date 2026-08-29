"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, Plane, Search } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { useMyBookingsQuery } from "@/hooks/use-booking";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingRow } from "@/components/dashboard/booking-row";

/**
 * A partner account is still a traveler in its own right - this shows the bookings *they* made as
 * a customer (GET /api/bookings/me), separate from partner/bookings (customers' bookings against
 * this partner's own listings, a different endpoint scoped by partnerId).
 */
export default function PartnerMyBookingsPage() {
  const t = useTranslations("Partner.myBookings");
  const bookingsQuery = useMyBookingsQuery();
  const bookings = bookingsQuery.data ?? [];

  return (
      <div className="space-y-6 p-4 md:p-6">
        <Card className="border shadow-lg overflow-hidden">
          <CardHeader className="border-b bg-card/50 pb-4">
            <CardTitle className="text-xl font-bold">{t("title")}</CardTitle>
            <CardDescription className="text-xs mt-1">{t("subtitle")}</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {bookingsQuery.isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                </div>
            ) : bookingsQuery.isError ? (
                <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle>{t("loadError")}</AlertTitle>
                  <AlertDescription className="mt-2 flex items-center justify-between gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => bookingsQuery.refetch()}
                        className="border-destructive/40 hover:bg-destructive/20 text-destructive"
                    >
                      {t("retry")}
                    </Button>
                  </AlertDescription>
                </Alert>
            ) : bookings.length === 0 ? (
                <div className="py-12 px-4 text-center max-w-md mx-auto space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Plane className="h-8 w-8 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-foreground">{t("emptyTitle")}</h3>
                    <p className="text-xs text-muted-foreground">{t("emptyDesc")}</p>
                  </div>
                  <div className="pt-2">
                    <Button asChild size="sm" className="rounded-xl">
                      <Link href="/">
                        <Search className="mr-2 h-4 w-4" />
                        {t("searchCta")}
                      </Link>
                    </Button>
                  </div>
                </div>
            ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => (
                      <BookingRow key={booking.id} booking={booking} />
                  ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
