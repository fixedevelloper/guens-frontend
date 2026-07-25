"use client";

import { useTranslations } from "next-intl";

import { useAuth } from "@/context/auth-context";
import { useMyBookingsQuery } from "@/hooks/use-booking";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingRow } from "@/components/dashboard/booking-row";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { user } = useAuth();
  const bookingsQuery = useMyBookingsQuery();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("clientTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("greeting", { name: user?.fullName ?? "" })}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("myBookingsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {bookingsQuery.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : bookingsQuery.isError ? (
            <Alert variant="destructive">
              <AlertDescription>{t("loadError")}</AlertDescription>
            </Alert>
          ) : !bookingsQuery.data || bookingsQuery.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noBookings")}</p>
          ) : (
            bookingsQuery.data.map((booking) => <BookingRow key={booking.id} booking={booking} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
