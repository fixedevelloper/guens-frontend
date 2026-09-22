"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, BadgePercent, CheckCircle2, Clock, XCircle } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingTrackingContent } from "@/components/tracking/booking-tracking-content";
import { useAuth } from "@/context/auth-context";
import { useMyResellerCommissionsQuery } from "@/hooks/use-rellers-queries";

// Pas d'endpoint "commission par réservation" côté serveur - on reprend la même page large que
// /dashboard/reseller/commissions et on cherche l'entrée liée à cette réservation.
const COMMISSIONS_PAGE_SIZE = 100;

const COMMISSION_STATUS = {
  PENDING: { label: "En attente", icon: Clock, className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
  AVAILABLE: { label: "Disponible", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  PAID: { label: "Payée", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  CANCELLED: { label: "Annulée", icon: XCircle, className: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400" },
} as const;

export default function ResellerBookingTrackingPage() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = params.bookingId;
  const { user } = useAuth();

  const { data: commissionsPage, isLoading: isCommissionLoading } = useMyResellerCommissionsQuery(
    user?.resellerId,
    0,
    COMMISSIONS_PAGE_SIZE
  );

  const commission = useMemo(
    () => commissionsPage?.content.find((c) => c.bookingId === bookingId),
    [commissionsPage, bookingId]
  );

  const status = commission ? COMMISSION_STATUS[commission.status] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/reseller/bookings"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à mes ventes
        </Link>

        <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-2.5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
          <BadgePercent className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Ma commission</span>
          {isCommissionLoading ? (
            <Skeleton className="h-5 w-20" />
          ) : commission && status ? (
            <>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                +{new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: commission.currency || "XAF",
                  maximumFractionDigits: 0,
                }).format(commission.amount)}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${status.className}`}>
                <status.icon className="h-3 w-3" />
                {status.label}
              </span>
            </>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Pas encore générée (après paiement)
            </span>
          )}
        </div>
      </div>

      <BookingTrackingContent
        bookingId={bookingId}
        paymentPath={(id) => `/dashboard/reseller/payment/${id}`}
        flightDetailsPath={(id) => `/bookings/${id}/flight`}
        accountPath="/dashboard/reseller/bookings"
        searchAgainPath="/dashboard/reseller/flights"
      />
    </div>
  );
}
