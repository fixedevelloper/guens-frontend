"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  Loader2,
  PlaneLanding,
  PlaneTakeoff,
  XCircle,
  ChevronRight,
  AlertTriangle,
  Info,
  Ticket,
  RotateCw,
  Search,
  Luggage,
  UtensilsCrossed,
  Armchair,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

import { Link, useRouter } from "@/i18n/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingStepper } from "@/components/tracking/booking-stepper";
import { StatusBadge } from "@/components/tracking/status-badge";
import { TicketList } from "@/components/tracking/ticket-list";
import { CountdownTimer } from "@/components/tracking/countdown-timer";
import {
  PRICE_REVALIDATION_INTERVAL_MS,
  useBookingQuery,
  useCancelBookingMutation,
  usePriceCheckQuery,
  useRetryBookingMutation,
} from "@/hooks/use-booking";
import { useBookingTracking } from "@/hooks/use-booking-tracking";
import { normalizeApiError } from "@/lib/api/client";
import { airlineLabel, formatDateTime, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AncillaryType, BookingStatus } from "@/lib/api/types";

// Type pour la réponse enregistrée en session
interface PaymentSessionData {
  id: string;
  status: string;
  paymentMethod: string;
  failureReason?: string;
  /** "MANUAL" = en attente de validation par un agent, pas d'un webhook fournisseur - voir
   *  ManualPaymentGateway. */
  providerName?: string;
}

const IN_PROGRESS_STATUSES: BookingStatus[] = ["PENDING_HOLD", "PENDING_PAYMENT", "PAID", "CONFIRMING"];

const EXTRA_ICONS: Record<AncillaryType, typeof Luggage> = {
  BAGGAGE: Luggage,
  MEAL: UtensilsCrossed,
  SEAT: Armchair,
  INSURANCE: ShieldCheck,
};

interface BookingTrackingContentProps {
  bookingId: string;
  /** Same journey as the direct customer, just kept under the reseller's own dashboard space
   *  when this is rendered from there - see dashboard/reseller/payment/[bookingId]. */
  paymentPath: (bookingId: string) => string;
  flightDetailsPath: (bookingId: string) => string;
  /** Where "Aller à mon compte" (payment already validating) lands. */
  accountPath: string;
  /** Where "Rechercher à nouveau" (offer expired, non-retryable failure) sends the user - the
   *  public homepage for a direct customer, the reseller's own flight search when this is
   *  rendered from the reseller space (see dashboard/reseller/bookings/[bookingId]). */
  searchAgainPath: string;
}

export function BookingTrackingContent({
  bookingId,
  paymentPath,
  flightDetailsPath,
  accountPath,
  searchAgainPath,
}: BookingTrackingContentProps) {
  const t = useTranslations("Tracking");
  const tCommon = useTranslations("Common");
  const tPayment = useTranslations("Payment");
  const locale = useLocale();
  const router = useRouter();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  // Incrémenté après un "Réessayer" réussi pour rouvrir le flux SSE, fermé côté client dès
  // qu'un statut FAILED est reçu (terminal) - sans ça, la tentative relancée ne recevrait
  // jamais sa propre mise à jour de statut en direct.
  const [resubscribeKey, setResubscribeKey] = useState(0);

  // État pour stocker la réponse de paiement récupérée depuis le sessionStorage
  const [recentPayment, setRecentPayment] = useState<PaymentSessionData | null>(null);

  const bookingQuery = useBookingQuery(bookingId);
  const tracking = useBookingTracking(bookingId, resubscribeKey);
  const cancelMutation = useCancelBookingMutation(bookingId);
  const retryMutation = useRetryBookingMutation(bookingId);
  const queryClient = useQueryClient();

  const status = tracking.liveStatus ?? bookingQuery.data?.status;
  const previousStatusRef = useRef<BookingStatus | undefined>(undefined);

  // Ce timer n'est PAS un compte à rebours avant annulation de la réservation (ça, c'est un job
  // backend séparé et indépendant - BookingService#cancelExpiredHolds, basé sur ticketingDeadline
  // - que cette page n'a pas besoin de surveiller: un statut CANCELLED arriverait de toute façon
  // en direct via le SSE de useBookingTracking ci-dessous). Il sert uniquement à afficher le temps
  // restant avant la PROCHAINE revalidation périodique du prix chez le fournisseur (toutes les 15
  // min, voir usePriceCheckQuery/BookingService#refreshQuotedPrice), pour que l'utilisateur
  // comprenne pourquoi le montant affiché peut bouger pendant qu'il finalise son paiement.
  const countdownEligible = status === "PENDING_PAYMENT";
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!countdownEligible) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [countdownEligible]);

  // Revalidation périodique du prix chez le fournisseur toutes les 15 min pendant que le paiement
  // est attendu (voir BookingService#refreshQuotedPrice) - synchronise directement le cache
  // partagé de useBookingQuery puisque useQuery v5 n'a plus de onSuccess.
  const priceCheckQuery = usePriceCheckQuery(bookingId, countdownEligible);
  useEffect(() => {
    if (priceCheckQuery.data) {
      queryClient.setQueryData(["booking", bookingId], priceCheckQuery.data);
    }
  }, [priceCheckQuery.data, bookingId, queryClient]);

  // Countdown display only: cycles down from 15:00 to 0:00 and resets every time a price check
  // actually completes (dataUpdatedAt jumps forward), rather than tracking real query internals -
  // self-syncs with usePriceCheckQuery's own refetchInterval schedule without duplicating it.
  const lastCheckedAtRef = useRef(Date.now());
  if (priceCheckQuery.dataUpdatedAt) {
    lastCheckedAtRef.current = priceCheckQuery.dataUpdatedAt;
  }
  const remainingMs = countdownEligible
      ? Math.max(0, PRICE_REVALIDATION_INTERVAL_MS - (now - lastCheckedAtRef.current))
      : null;

  // 1. Récupération des données du paiement dans le sessionStorage au montage
  useEffect(() => {
    if (!bookingId) return;

    const storageKey = `payment_result_${bookingId}`;
    const storedData = sessionStorage.getItem(storageKey);

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData) as PaymentSessionData;
        setRecentPayment(parsed);
      } catch (err) {
        console.error("Erreur de lecture de la session de paiement :", err);
      }
    }
  }, [bookingId]);

  // 2. Nettoyage du sessionStorage (et de l'état) dès que le statut passe à un état final ou confirmé
  useEffect(() => {
    if (tracking.isTerminal) {
      bookingQuery.refetch();
    }

    if (status && status !== "PENDING_PAYMENT") {
      const storageKey = `payment_result_${bookingId}`;
      sessionStorage.removeItem(storageKey);
      // recentPayment.status ne change jamais une fois lu depuis sessionStorage : sans ce reset,
      // la bannière "Validation du paiement en cours..." (basée sur recentPayment?.status ===
      // "PENDING") resterait affichée indéfiniment même une fois la réservation CONFIRMED et les
      // billets émis.
      setRecentPayment(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking.isTerminal, status, bookingId]);

  // 3. Redirection automatique vers le paiement dès que le hold fournisseur (asynchrone,
  // déclenché juste après le checkout) aboutit - uniquement sur une transition constatée en
  // direct dans cette page (PENDING_HOLD -> PENDING_PAYMENT), jamais au premier chargement
  // d'une réservation déjà en PENDING_PAYMENT (l'utilisateur doit alors cliquer "Payer" lui-même).
  useEffect(() => {
    if (previousStatusRef.current === "PENDING_HOLD" && status === "PENDING_PAYMENT") {
      router.replace(paymentPath(bookingId));
    }
    previousStatusRef.current = status;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, bookingId, router]);

  function handleCancel() {
    cancelMutation.mutate(undefined, {
      onSuccess: () => setConfirmingCancel(false),
      onError: (error) => toast.error(normalizeApiError(error).message),
    });
  }

  function handleRetry() {
    retryMutation.mutate(undefined, {
      onSuccess: () => setResubscribeKey((key) => key + 1),
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
              {t("loadError")}
            </AlertDescription>
          </Alert>
        </div>
    );
  }

  const canCancel = status !== "CANCELLED" && status !== "FAILED" && status !== "PENDING_HOLD"
      && status !== "PRICE_CHANGED";
  const inProgress = IN_PROGRESS_STATUSES.includes(status) && !tracking.connectionError;
  const needsPayment = status === "PENDING_PAYMENT" || status === "DEPOSIT_PAID";

  // Vérifie si le paiement est activement en cours de confirmation - PENDING_PAYMENT seul ne
  // compte pas : c'est l'état normal d'une réservation qui attend encore un premier paiement (le
  // cas courant juste après le checkout), pas la preuve qu'une tentative est en vol. L'inclure ici
  // masquait le bouton "Procéder au paiement" dès l'arrivée sur cette page après un checkout.
  const isPaymentPending = status === "CONFIRMING" || recentPayment?.status === "PENDING";

  return (
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">

        {/* HEADER DE LA PAGE */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">

          {/* CARTE EN-TÊTE : REFERENCE ET STATUT */}
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-slate-50/40 dark:bg-zinc-900/10 border-b border-border/40">
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">{t("referenceLabel")}</span>
              <p className="text-lg font-black tracking-wide text-foreground font-mono">
                {booking.id}
              </p>
            </div>
            <div className="self-start sm:self-center">
              <StatusBadge status={status} />
            </div>
          </CardHeader>

          <div className="p-5 sm:p-6 border-b border-border/40">
            <BookingStepper status={status} />
          </div>

          <CardContent className="p-5 sm:p-6 space-y-6">

            {/* PROCHAINE REVALIDATION PÉRIODIQUE DU PRIX CHEZ LE FOURNISSEUR (toutes les 15 min) */}
            {countdownEligible && remainingMs !== null && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/[0.03] px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground/80">
                    <span>
                      {priceCheckQuery.isFetching
                          ? "Revérification du prix chez le fournisseur..."
                          : "Prochaine revérification du prix chez le fournisseur"}
                    </span>
                    {priceCheckQuery.isFetching && (
                        <Loader2 className="size-3 animate-spin text-primary" />
                    )}
                  </div>
                  <CountdownTimer remainingMs={remainingMs} />
                </div>
            )}

            {/* BANNIÈRE DE STATUT DE PAIEMENT EN REQUÊTE WS / SESSION */}
            {recentPayment && isPaymentPending && (
                <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-4.5 text-amber-950 dark:text-amber-200">
                  <div className="flex items-start gap-3.5">
                    <div className="relative flex shrink-0 items-center justify-center rounded-lg bg-amber-500/15 p-2 text-amber-600 dark:text-amber-400">
                      <Loader2 className="size-5 animate-spin" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                    <span className="font-bold text-sm tracking-tight">
                      {recentPayment.providerName === "MANUAL"
                          ? t("manualPaymentValidationTitle")
                          : t("paymentValidationTitle")}
                    </span>
                        <span className="text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md">
                      {recentPayment.paymentMethod}
                    </span>
                      </div>
                      <p className="text-xs text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
                        {t.rich(
                            recentPayment.providerName === "MANUAL"
                                ? "manualPaymentValidationDescription"
                                : "paymentValidationDescription",
                            {
                              reference: `${recentPayment.id.slice(0, 8)}...`,
                              code: (chunks) => <code className="font-mono">{chunks}</code>,
                            },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
            )}

            {/* ZONE DE NOTIFICATION STANDARD DU STATUT */}
            {!recentPayment && (
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
                    <span className="font-bold text-foreground block">{t("realtimeUpdateTitle")}</span>
                    <p className="text-xs text-muted-foreground/90">
                      {t(`statusDescription.${status}`)}
                    </p>
                  </div>
                </div>
            )}

            {/* CAS D'ÉCHEC DE LA RÉSERVATION */}
            {status === "FAILED" && booking.failureReason && (
                <Alert variant="destructive" className="rounded-xl border-destructive/20 bg-destructive/[0.02]">
                  <AlertTriangle className="size-4 text-destructive" />
                  <AlertDescription className="space-y-3">
                    <p className="text-xs font-semibold text-destructive">
                      {t("failureReason", { reason: booking.failureReason })}
                    </p>
                    {booking.paymentRefunded ? (
                        <p className="text-xs font-medium text-destructive/90">
                          {t("paymentRefundedNotice") ??
                              "Votre paiement a été remboursé suite à cet échec. Vous pouvez refaire une recherche en toute sécurité."}
                        </p>
                    ) : booking.paymentCaptured ? (
                        <p className="text-xs font-medium text-destructive/90">
                          {t("paymentCapturedNotice") ??
                              "Votre paiement a bien été débité. Notre support va vous contacter pour régulariser cette réservation - inutile de repayer ou de refaire une recherche."}
                        </p>
                    ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          {booking.retryable && (
                              <Button
                                  size="sm"
                                  variant="destructive"
                                  className="rounded-xl font-bold gap-1.5"
                                  onClick={handleRetry}
                                  disabled={retryMutation.isPending}
                              >
                                {retryMutation.isPending ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <RotateCw className="size-3.5" />
                                )}
                                {t("retryAction")}
                              </Button>
                          )}
                          <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl font-bold gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/[0.04]"
                              onClick={() => router.push(searchAgainPath)}
                          >
                            <Search className="size-3.5" />
                            {t("searchAgainAction")}
                          </Button>
                        </div>
                    )}
                  </AlertDescription>
                </Alert>
            )}

            {/* CAS DE CHANGEMENT DE PRIX (FARE JUMP AU-DELÀ DE LA TOLÉRANCE) */}
            {status === "PRICE_CHANGED" && booking.revisedPrice && (
                <Alert className="rounded-xl border-orange-500/30 bg-orange-500/[0.03] text-orange-950 dark:text-orange-200">
                  <AlertTriangle className="size-4 text-orange-600 dark:text-orange-400" />
                  <AlertDescription className="text-xs font-medium text-orange-900/90 dark:text-orange-300/90">
                    {t("priceChangedNotice", {
                      paid: formatMoney(booking.price, locale),
                      revised: formatMoney(booking.revisedPrice, locale),
                      supplement: formatMoney(
                          { amount: Number(booking.revisedPrice.amount) - Number(booking.price.amount), currency: booking.revisedPrice.currency },
                          locale
                      ),
                    })}
                  </AlertDescription>
                </Alert>
            )}

            {/* COMPOSANT ITINÉRAIRE (TRONÇONS) */}
            {booking.itineraryLegs.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-muted-foreground/80 tracking-wider uppercase block">{t("itineraryTitle")}</span>
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
              <span className="text-xs font-bold text-muted-foreground/80 tracking-wider uppercase block">{t("paymentBreakdownTitle")}</span>
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
                      {tPayment("balanceDue")}
                    </span>
                        <span className="font-black text-amber-600 dark:text-amber-400">{formatMoney(booking.amountDue, locale)}</span>
                      </div>
                    </>
                )}
              </div>
            </div>

            {/* OPTIONS SUPPLÉMENTAIRES CHOISIES (bagages, repas, sièges, assurance) */}
            {booking.extras.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-muted-foreground/80 tracking-wider uppercase block">
                    {t("extrasTitle")}
                  </span>
                  <div className="rounded-xl border border-border/40 p-4 space-y-2.5 bg-slate-50/10 dark:bg-zinc-900/5">
                    {booking.extras.map((extra, index) => {
                      const Icon = EXTRA_ICONS[extra.type];
                      return (
                          <div key={index} className="flex items-center justify-between gap-3 text-sm">
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon className="size-3.5 text-muted-foreground/60 shrink-0" />
                              <span className="text-muted-foreground/90 truncate">
                            {extra.label}
                                <span className="text-[11px] text-muted-foreground/60">
                              {" · "}
                                  {extra.travelerIndex !== null
                                      ? t("extraTraveler", { index: extra.travelerIndex + 1 })
                                      : t("extraForAll")}
                            </span>
                          </span>
                            </div>
                            <span className="font-semibold text-foreground whitespace-nowrap">
                          {formatMoney(extra.price, locale)}
                        </span>
                          </div>
                      );
                    })}
                  </div>
                </div>
            )}

            {/* APPEL À L'ACTION : PAIEMENT EN ATTENTE OU SOLDE - masqué tant qu'un paiement est
                déjà en cours de validation, pour ne pas inciter à relancer un paiement en double */}
            {needsPayment && !isPaymentPending && (
                <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-xl font-bold gap-2 bg-primary hover:bg-primary/95 text-primary-foreground py-6 px-6 transition-transform active:scale-97 shadow-xs"
                    onClick={() => router.push(paymentPath(bookingId))}
                >
                  <CreditCard className="size-4 shrink-0" />
                  {status === "DEPOSIT_PAID"
                      ? (t("payBalanceAction"))
                      : (t("payNowAction"))}
                </Button>
            )}

            {needsPayment && isPaymentPending && (
                <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto rounded-xl font-bold gap-2 py-6 px-6 transition-transform active:scale-97"
                    onClick={() => router.push(accountPath)}
                >
                  {t("goToAccount")}
                  <ChevronRight className="size-4 shrink-0" />
                </Button>
            )}

            {/* ACCÈS AUX BILLETS ISSUS DU VOL */}
            {status === "CONFIRMED" && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Ticket className="size-4 shrink-0" />
                      </div>
                      <h2 className="font-bold text-sm tracking-wide uppercase text-foreground">{t("viewTickets")}</h2>
                    </div>
                    {booking.offerType === "FLIGHT" && (
                        <Button asChild variant="outline" size="sm" className="rounded-lg font-semibold text-xs">
                          <Link href={flightDetailsPath(bookingId)}>{t("viewFlightDetails")}</Link>
                        </Button>
                    )}
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
                          {t("cancelWarning")}
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
                                t("cancelConfirm")
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
                        {t("cancelAction")}
                      </Button>
                  )}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
