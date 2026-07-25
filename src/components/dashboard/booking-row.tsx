// components/dashboard/booking-row.tsx
"use client";

import { useLocale, useTranslations } from "next-intl";
import { Building2, Plane, ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { StatusBadge } from "@/components/tracking/status-badge";
import { formatDate, formatMoney, providerLabel } from "@/lib/format";
import type { BookingResponse } from "@/lib/api/types";

export function BookingRow({ booking, showContact = false }: { booking: BookingResponse; showContact?: boolean }) {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const isHotel = booking.offerType === "HOTEL";

  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/40 bg-card p-3.5 text-xs sm:text-sm transition-all duration-200 hover:border-primary/20 hover:bg-slate-50/40 dark:hover:bg-zinc-900/40 hover:shadow-2xs group"
    >
      {/* SECTION INFO GAUCHE */}
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Badge d'icône d'offre */}
        <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover:scale-105 transition-transform duration-200 shrink-0">
          {isHotel ? (
            <Building2 className="size-4.5 stroke-[2]" />
          ) : (
            <Plane className="size-4.5 stroke-[2]" />
          )}
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="font-extrabold text-foreground tracking-tight truncate capitalize">
            {isHotel
              ? booking.hotelName?.toLowerCase()
              : `${booking.origin} → ${booking.destination}`}
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-medium flex flex-wrap items-center gap-1">
            <span>
              {isHotel
                ? `${booking.checkIn ? formatDate(booking.checkIn, locale) : ""} - ${booking.checkOut ? formatDate(booking.checkOut, locale) : ""}`
                : booking.departureTime
                  ? formatDate(booking.departureTime, locale)
                  : formatDate(booking.createdAt, locale)}
            </span>
            {showContact && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className="truncate text-primary/80 font-semibold">{booking.contactEmail}</span>
              </>
            )}
            <span className="text-muted-foreground/40">•</span>
            <span className="uppercase text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
              {providerLabel(booking.providerType)}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION TARIF & STATUT DROITE */}
      <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-border/30 pt-3 sm:border-none sm:pt-0 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-black text-foreground tracking-tight text-sm sm:text-base">
            {formatMoney(booking.price, locale)}
          </span>
          <StatusBadge status={booking.status} />
        </div>
        
        {/* Flèche d'action subtile visible au survol */}
        <ArrowRight className="size-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all hidden sm:block" />
      </div>

      <span className="sr-only">{t("viewBooking")}</span>
    </Link>
  );
}