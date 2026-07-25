"use client";

import { useLocale, useTranslations } from "next-intl";
import { Banknote, Receipt, TrendingUp, Users, ArrowUpRight, Sparkles } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { useAdminBookingsQuery, useAdminUsersQuery, useCommissionWalletQuery } from "@/hooks/use-admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingRow } from "@/components/dashboard/booking-row";
import { formatMoney } from "@/lib/format";

export default function AdminOverviewPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();

  const bookingsQuery = useAdminBookingsQuery();
  const usersQuery = useAdminUsersQuery();
  const walletQuery = useCommissionWalletQuery();

  const totalRevenue = (bookingsQuery.data ?? []).reduce(
    (sum, booking) => sum + Number(booking.price.amount),
    0
  );
  const revenueCurrency = bookingsQuery.data?.[0]?.price.currency ?? "EUR";
  const recentBookings = (bookingsQuery.data ?? []).slice(0, 5);

  const isLoading = bookingsQuery.isLoading || usersQuery.isLoading || walletQuery.isLoading;

  return (
    <div className="space-y-8">
      {/* EN-TÊTE DE LA PAGE */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black tracking-widest text-primary uppercase flex items-center gap-1.5">
          <Sparkles className="size-3.5" />
          Console de Supervision
        </span>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          {t("adminTitle") ?? "Panneau d'Administration"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          {t("adminSubtitle") ?? "Consultez l'état d'activité, les flux financiers et gérez les comptes."}
        </p>
      </div>

      {/* GRILLE DES CARTES STATISTIQUES */}
      <div className="grid gap-4.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* CARTE : TOTAL RÉSERVATIONS */}
        <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-2xs hover:shadow-xs transition-all duration-200 flex items-center gap-4 group">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Receipt className="size-6 stroke-[2.2]" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase truncate">
              {t("totalBookings") ?? "Réservations"}
            </p>
            <p className="text-xl font-black text-foreground tracking-tight">
              {isLoading ? <Skeleton className="h-6 w-12 rounded-md" /> : (bookingsQuery.data?.length ?? 0)}
            </p>
          </div>
        </div>

        {/* CARTE : CHIFFRE D'AFFAIRES */}
        <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-2xs hover:shadow-xs transition-all duration-200 flex items-center gap-4 group">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <TrendingUp className="size-6 stroke-[2.2]" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase truncate">
              {t("totalRevenue") ?? "Volume d'affaires"}
            </p>
            <p className="text-xl font-black text-foreground tracking-tight">
              {isLoading ? (
                <Skeleton className="h-6 w-24 rounded-md" />
              ) : bookingsQuery.data ? (
                formatMoney({ amount: totalRevenue, currency: revenueCurrency }, locale)
              ) : (
                "-"
              )}
            </p>
          </div>
        </div>

        {/* CARTE : PORTEFEUILLE DE COMMISSION */}
        <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-2xs hover:shadow-xs transition-all duration-200 flex items-center gap-4 group">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Banknote className="size-6 stroke-[2.2]" />
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase truncate">
              {t("commissionWallet") ?? "Commissions"}
            </p>
            <div className="text-lg font-black text-foreground tracking-tight truncate">
              {isLoading ? (
                <Skeleton className="h-6 w-20 rounded-md" />
              ) : walletQuery.data && walletQuery.data.balances.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {walletQuery.data.balances.map((b, idx) => (
                    <span key={idx} className={idx > 0 ? "before:content-['/'] before:mx-1 before:text-muted-foreground/50" : ""}>
                      {formatMoney(b, locale)}
                    </span>
                  ))}
                </div>
              ) : walletQuery.data ? (
                formatMoney({ amount: 0, currency: revenueCurrency }, locale)
              ) : (
                "-"
              )}
            </div>
          </div>
        </div>

        {/* CARTE : TOTAL UTILISATEURS */}
        <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-2xs hover:shadow-xs transition-all duration-200 flex items-center gap-4 group">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Users className="size-6 stroke-[2.2]" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase truncate">
              {t("totalUsers") ?? "Utilisateurs"}
            </p>
            <p className="text-xl font-black text-foreground tracking-tight">
              {isLoading ? <Skeleton className="h-6 w-12 rounded-md" /> : (usersQuery.data?.length ?? 0)}
            </p>
          </div>
        </div>

      </div>

      {/* BLOCK : RÉSERVATIONS RÉCENTES */}
      <div className="rounded-2xl border border-border/50 bg-card shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold tracking-tight text-foreground">
              {t("recentBookingsTitle") ?? "Activités récentes"}
            </h2>
          </div>
          
          <Button asChild variant="ghost" size="sm" className="rounded-xl font-bold text-xs gap-1">
            <Link href="/admin/bookings">
              {t("viewAll") ?? "Tout voir"}
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="p-5">
          {bookingsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : bookingsQuery.isError ? (
            <Alert className="rounded-xl border-destructive/20 bg-destructive/5 text-destructive py-3">
              <AlertDescription className="text-xs font-semibold">
                {t("loadError") ?? "Erreur lors du chargement des activités récentes."}
              </AlertDescription>
            </Alert>
          ) : recentBookings.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground font-medium">
              {t("noBookings") ?? "Aucune réservation enregistrée pour le moment."}
            </div>
          ) : (
            <div className="divide-y divide-border/30 -my-3">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="py-3.5 first:pt-0 last:pb-0">
                  <BookingRow booking={booking} showContact />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}