"use client";

import { useTranslations } from "next-intl";
import { Receipt, Sparkles, CalendarDays } from "lucide-react";

import { useAdminBookingsQuery } from "@/hooks/use-admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingRow } from "@/components/dashboard/booking-row";

export default function AdminBookingsPage() {
  const t = useTranslations("Dashboard");
  const bookingsQuery = useAdminBookingsQuery();

  const totalCount = bookingsQuery.data?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* SECTION TITRE ET STATISTIQUE */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[10px] font-black tracking-widest text-primary uppercase flex items-center gap-1.5">
            <Sparkles className="size-3.5" />
            Suivi des dossiers
          </span>
          <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
            {t("allBookingsTitle") ?? "Toutes les réservations"}
          </h1>
          <p className="text-xs text-muted-foreground/80 font-medium mt-0.5">
            Gérez et supervisez l'intégralité des billets d'avion et nuitées d'hôtel.
          </p>
        </div>
        
        {/* Badge de compteur moderne */}
        <div className="flex items-center gap-2 self-start rounded-xl border border-border/40 bg-card px-3.5 py-2 shadow-2xs sm:self-auto">
          <Receipt className="size-4 text-primary" />
          <span className="text-xs font-extrabold text-foreground">
            {t("resultsCount", { count: totalCount }) ?? `${totalCount} réservations`}
          </span>
        </div>
      </div>

      {/* CONTENEUR PRINCIPAL DE LA LISTE */}
      <Card className="rounded-2xl border-border/50 bg-card shadow-2xs overflow-hidden">
        <CardHeader className="border-b border-border/30 bg-slate-50/20 dark:bg-zinc-900/10 px-6 py-4.5">
          <CardTitle className="text-sm font-black uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
            Flux de réservations
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {bookingsQuery.isLoading ? (
            <div className="space-y-4">
              {/* Squelette de lignes réaliste */}
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : bookingsQuery.isError ? (
            <Alert variant="destructive" className="rounded-xl border-destructive/20 bg-destructive/5">
              <AlertDescription className="text-xs font-semibold">
                {t("loadError") ?? "Erreur lors du chargement de la liste des réservations."}
              </AlertDescription>
            </Alert>
          ) : !bookingsQuery.data || bookingsQuery.data.length === 0 ? (
            <div className="py-12 text-center">
              <CalendarDays className="size-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-xs font-bold text-muted-foreground">
                {t("noBookings") ?? "Aucune réservation trouvée pour le moment."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3.5">
              {bookingsQuery.data.map((booking) => (
                <BookingRow 
                  key={booking.id} 
                  booking={booking} 
                  showContact 
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}