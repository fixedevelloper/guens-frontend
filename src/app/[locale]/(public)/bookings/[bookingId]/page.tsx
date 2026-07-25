"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { 
  CreditCard, 
  Loader2, 
  PlaneLanding, 
  PlaneTakeoff, 
  XCircle, 
  ChevronRight, 
  AlertTriangle, 
  Info,
  Calendar,
  Ticket
} from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/tracking/status-badge";
import { TicketList } from "@/components/tracking/ticket-list";
import { useBookingQuery, useCancelBookingMutation } from "@/hooks/use-booking";
import { useBookingTracking } from "@/hooks/use-booking-tracking";
import { normalizeApiError } from "@/lib/api/client";
import { airlineLabel, formatDateTime, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/api/types";

const IN_PROGRESS_STATUSES: BookingStatus[] = ["PENDING_PAYMENT", "PAID", "CONFIRMING"];

export default function BookingTrackingPage() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = params.bookingId;
  const t = useTranslations("Tracking");
  const tCommon = useTranslations("Common");
  const tPayment = useTranslations("Payment");
  const locale = useLocale();
  const router = useRouter();
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const bookingQuery = useBookingQuery(bookingId);
  const tracking = useBookingTracking(bookingId);
  const cancelMutation = useCancelBookingMutation(bookingId);

  const status = tracking.liveStatus ?? bookingQuery.data?.status;

  useEffect(() => {
    if (tracking.isTerminal) {
      bookingQuery.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking.isTerminal]);

  function handleCancel() {
    cancelMutation.mutate(undefined, {
      onSuccess: () => setConfirmingCancel(false),
      onError: (error) => toast.error(normalizeApiError(error).message),
    });
  }

  if (bookingQuery.isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/3 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const booking = bookingQuery.data;
  if (!booking || !status) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Alert variant="destructive" className="rounded-2xl border-destructive/25 bg-destructive/[0.03]">
          <XCircle className="size-5" />
          <AlertDescription className="font-medium text-destructive">
            {t("title") ?? "Impossible de charger les détails de cette réservation."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const canCancel = status !== "CANCELLED" && status !== "FAILED";
  const inProgress = IN_PROGRESS_STATUSES.includes(status) && !tracking.connectionError;
  const needsPayment = status === "PENDING_PAYMENT" || status === "DEPOSIT_PAID";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      
      {/* HEADER DE LA PAGE */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          {t("title") ?? "Suivi de votre réservation"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Gérez votre voyage et accédez à vos informations de vol en temps réel.
        </p>
      </div>

      <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">
        
        {/* CARTE EN-TÊTE : REFERENCE ET STATUT */}
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-slate-50/40 dark:bg-zinc-900/10 border-b border-border/40">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">Référence Dossier</span>
            <p className="text-lg font-black tracking-wide text-foreground font-mono">
              {booking.id}
            </p>
          </div>
          <div className="self-start sm:self-center">
            <StatusBadge status={status} />
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-6">
          
          {/* ZONE DE NOTIFICATION DU STATUT DE REQUÊTE */}
          <div className={cn(
            "flex items-start gap-3 p-4 rounded-xl border text-sm leading-relaxed",
            inProgress 
              ? "bg-primary/[0.03] border-primary/10 text-foreground" 
              : "bg-slate-50/50 dark:bg-zinc-950/10 border-border/50 text-muted-foreground"
          )}>
            {inProgress ? (
              <Loader2 className="size-4 animate-spin text-primary shrink-0 mt-0.5" />
            ) : (
              <Info className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-bold text-foreground block">Mise à jour en temps réel</span>
              <p className="text-xs text-muted-foreground/90">
                {t(`statusDescription.${status}`) ?? `Statut de votre dossier : ${status}`}
              </p>
            </div>
          </div>

          {/* CAS D'ÉCHEC DE LA RÉSERVATION */}
          {status === "FAILED" && booking.failureReason && (
            <Alert variant="destructive" className="rounded-xl border-destructive/20 bg-destructive/[0.02]">
              <AlertTriangle className="size-4 text-destructive" />
              <AlertDescription className="text-xs font-semibold text-destructive">
                {t("failureReason", { reason: booking.failureReason })}
              </AlertDescription>
            </Alert>
          )}

          {/* COMPOSANT ITINÉRAIRE (TRONÇONS) */}
          {booking.itineraryLegs.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-muted-foreground/80 tracking-wider uppercase block">Détails de l'Itinéraire</span>
              <div className="grid gap-3">
                {booking.itineraryLegs.map((leg) => (
                  <div 
                    key={leg.legIndex} 
                    className="grid gap-3.5 rounded-xl border border-border/50 p-4 text-sm bg-slate-50/10 dark:bg-zinc-900/5 hover:border-border transition-colors"
                  >
                    {/* Header du tronçon */}
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-muted px-2 py-0.5 font-bold font-mono text-[10px] tracking-wider text-foreground">
                        {leg.airline}{leg.flightNumber}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {airlineLabel(leg.airline)}
                      </span>
                    </div>

                    {/* Ligne Départ / Arrivée */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pl-0.5">
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
              </div>
            </div>
          )}

          <Separator className="bg-border/50" />

          {/* RÉCAPITULATIF FINANCIER TYPE FACTURE */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-muted-foreground/80 tracking-wider uppercase block">Détail du paiement</span>
            <div className="rounded-xl border border-border/40 p-4 space-y-3.5 bg-slate-50/10 dark:bg-zinc-900/5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground/85 font-medium">{t("totalPrice")}</span>
                <span className="font-extrabold text-foreground">{formatMoney(booking.price, locale)}</span>
              </div>

              {status === "DEPOSIT_PAID" && (
                <>
                  <Separator className="border-border/30" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                      <span className="inline-block size-1.5 rounded-full bg-amber-500" />
                      {tPayment("balanceDue") ?? "Reste à payer"}
                    </span>
                    <span className="font-black text-amber-600 dark:text-amber-400">{formatMoney(booking.amountDue, locale)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* APPEL À L'ACTION : PAIEMENT EN ATTENTE OU SOLDE */}
          {needsPayment && (
            <Button 
              size="lg" 
              className="w-full sm:w-auto rounded-xl font-bold gap-2 bg-primary hover:bg-primary/95 text-primary-foreground py-6 px-6 transition-transform active:scale-97 shadow-xs" 
              onClick={() => router.push(`/payment/${bookingId}`)}
            >
              <CreditCard className="size-4 shrink-0" />
              {status === "DEPOSIT_PAID" 
                ? (t("payBalanceAction") ?? "Payer le solde restant") 
                : (t("payNowAction") ?? "Procéder au paiement")}
            </Button>
          )}

          {/* ACCÈS AUX BILLETS ISSUS DU VOL */}
          {status === "CONFIRMED" && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Ticket className="size-4 shrink-0" />
                </div>
                <h2 className="font-bold text-sm tracking-wide uppercase text-foreground">{t("viewTickets") ?? "Vos billets émis"}</h2>
              </div>
              <TicketList bookingId={bookingId} enabled={status === "CONFIRMED"} />
            </div>
          )}

          {/* SECTION CRITIQUE D'ANNULATION */}
          {canCancel && (
            <div className="pt-2">
              <Separator className="mb-4 bg-border/50" />
              {confirmingCancel ? (
                <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/[0.02] space-y-3">
                  <p className="text-xs font-semibold text-destructive/90 leading-normal">
                    Êtes-vous absolument sûr de vouloir annuler cette réservation ? Cette opération est irréversible.
                  </p>
                  <div className="flex items-center gap-2.5">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-xl font-bold px-4"
                      onClick={handleCancel}
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? (
                        <div className="flex items-center gap-1.5">
                          <Loader2 className="size-3.5 animate-spin" />
                          {t("cancelling")}
                        </div>
                      ) : (
                        t("cancelConfirm") ?? "Confirmer l'annulation"
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-xl font-semibold border border-border/50 bg-background hover:bg-slate-50 text-muted-foreground"
                      onClick={() => setConfirmingCancel(false)}
                    >
                      {tCommon("cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl font-bold border-border/80 hover:border-destructive/30 text-destructive hover:bg-destructive/[0.02] gap-1.5 px-4 transition-all duration-200"
                  onClick={() => setConfirmingCancel(true)}
                >
                  <XCircle className="size-4 shrink-0" />
                  {t("cancelAction") ?? "Annuler la réservation"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}