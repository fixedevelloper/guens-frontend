"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { ShieldCheck, Calendar, CreditCard, Sparkles, ArrowLeft } from "lucide-react";

import { Link, useRouter } from "@/i18n/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CardPinDialog } from "@/components/checkout/card-pin-dialog";
import { PaymentForm, type PaymentFormValues } from "@/components/checkout/payment-form";
import { useBookingQuery } from "@/hooks/use-booking";
import { usePaymentMutation } from "@/hooks/use-payment";
import { normalizeApiError } from "@/lib/api/client";
import { formatDate, formatMoney } from "@/lib/format";
import {BookingPaymentRequest, PaymentResponse} from "@/lib/api/types";

export default function PaymentPage() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = params.bookingId;
  const t = useTranslations("Payment");
  const locale = useLocale();
  const router = useRouter();

  const bookingQuery = useBookingQuery(bookingId);
  const paymentMutation = usePaymentMutation();
  // Non-null uniquement le temps que la banque demande le code PIN de la carte.
  const [pinChallengePaymentId, setPinChallengePaymentId] = useState<string | null>(null);

  const booking = bookingQuery.data;

  function proceedToBookingTracking(payment: PaymentResponse) {
    toast.success(t("success"));
    sessionStorage.setItem(`payment_result_${bookingId}`, JSON.stringify(payment));
    router.push(`/bookings/${bookingId}`);
  }

  // Redirection sécurisée hors du rendu
  useEffect(() => {
    if (
        booking &&
        booking.status !== "PENDING_PAYMENT" &&
        booking.status !== "DEPOSIT_PAID"
    ) {
      router.replace(`/bookings/${bookingId}`);
    }
  }, [booking, bookingId, router]);

    function handleSubmit(values: PaymentFormValues) {
        // 1. Préparation de l'adresse de facturation
        const billingAddress = values.billingAddress
            ? {
                zipCode: values.billingZipCode ?? "",
                city: values.billingCity ?? "",
                address: values.billingAddress,
                state: values.billingState ?? "",
                countryCode: values.countryCode,
            }
            : undefined;

        // 2. Construction de la base commune
        const basePayload = {
            bookingId,
            countryCode: values.countryCode,
            countryCurrency: values.currency,
        };

        // 3. Construction du payload typé (Narrowing de l'union discriminée)
        let payload: BookingPaymentRequest;

        switch (values.paymentMethod) {
            case "CARD":
                payload = {
                    ...basePayload,
                    paymentMethod: "CARD",
                    cardNumber: String(values.cardNumber),
                    cardHolderName: String(values.cardHolderName),
                    expiry: String(values.expiry),
                    cvv: String(values.cvv),
                };
                break;

            case "MOBILE_MONEY":
                payload = {
                    ...basePayload,
                    paymentMethod: "MOBILE_MONEY",
                    mobileNumber: String(values.mobileNumber),
                };
                break;

            case "GOOGLE_PAY":
            case "APPLE_PAY":
            case "PAYPAL":
                payload = {
                    ...basePayload,
                    paymentMethod: values.paymentMethod,
                    billingAddress,
                };
                break;
        }

        // 4. Mutation sécurisée
        paymentMutation.mutate(payload, {
            onSuccess: (payment) => {
                if (payment.status === "PENDING" || payment.status === "SUCCEEDED") {
                    proceedToBookingTracking(payment);
                } else if (payment.status === "PENDING_AUTHORIZATION" && payment.authorizationType === "PIN") {
                    setPinChallengePaymentId(payment.id);
                } else if (payment.status === "PENDING_AUTHORIZATION"
                    && payment.authorizationType === "REDIRECT" && payment.authorizationRedirectUrl) {
                    // 3DS : la confirmation se fait via webhook une fois le payeur revenu de sa banque.
                    window.location.href = payment.authorizationRedirectUrl;
                } else {
                    toast.error(payment.failureReason ?? t("failure", { reason: "" }));
                }
            },
            onError: (error) => {
                toast.error(normalizeApiError(error).message);
            },
        });
    }

  if (bookingQuery.isLoading) {
    return <PaymentSkeleton />;
  }

  if (!booking) {
    return (
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <Alert className="rounded-2xl border-destructive/20 bg-destructive/5 text-destructive p-6">
            <AlertDescription className="text-sm font-semibold">
              {t("failure", { reason: "" }) ||
                  "Impossible de charger les détails de cette réservation."}
            </AlertDescription>
          </Alert>
          <Button asChild variant="outline" className="mt-4 rounded-xl">
            <Link href="/dashboard">Retour au tableau de bord</Link>
          </Button>
        </div>
    );
  }

  if (booking.status !== "PENDING_PAYMENT" && booking.status !== "DEPOSIT_PAID") {
    return null;
  }

  const isDepositPayment =
      booking.status === "PENDING_PAYMENT" && booking.paymentPlan === "PAY_LATER";
  const isBalancePayment = booking.status === "DEPOSIT_PAID";

  // Extraction de la devise par défaut depuis la réservation
  const bookingCurrency =
      booking.price.currency ??
      (typeof booking.amountDue === "object" ? booking.amountDue?.currency : undefined);

  return (
      <div className="min-h-[calc(100vh-4rem)] max-w-5xl mx-auto px-4 py-8 lg:py-12">
        {/* BOUTON RETOUR SÉCURISÉ */}
        <Button
            asChild
            variant="ghost"
            size="sm"
            className="group mb-6 -ml-2.5 rounded-xl text-muted-foreground hover:text-foreground font-semibold text-xs gap-1 transition-all"
        >
          <Link href={`/bookings/${bookingId}`}>
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            Retour à la réservation
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLONNE GAUCHE : RÉCAPITULATIF FINANCIER & SÉCURITÉ */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-border/50 bg-slate-50/50 dark:bg-zinc-900/30 p-6 space-y-5">
              <div className="space-y-1.5">
              <span className="text-[10px] font-black tracking-widest text-primary uppercase flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                Détails du règlement
              </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  {t("title") ?? "Sécuriser votre réservation"}
                </h1>
              </div>

              <div className="space-y-4">
                {/* MONTANT DÛ */}
                <div className="p-4 rounded-xl bg-background border border-border/40 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-muted-foreground">
                  {isDepositPayment
                      ? t("depositDue")
                      : isBalancePayment
                          ? t("balanceDue")
                          : t("amountDue")}
                </span>
                  <div className="text-2xl font-black text-foreground tracking-tight">
                    {formatMoney(booking.amountDue, locale)}
                  </div>
                </div>

                {/* DETAILS ET DEADLINES */}
                {isDepositPayment && (
                    <div className="flex gap-3 text-xs text-muted-foreground font-semibold bg-primary/[0.02] border border-primary/10 rounded-xl p-4.5">
                      <Calendar className="size-4 text-primary shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        {t("payLaterNotice", {
                          total: formatMoney(booking.price, locale),
                          deadline: booking.ticketingDeadline
                              ? formatDate(booking.ticketingDeadline, locale)
                              : "",
                        })}
                      </p>
                    </div>
                )}

                {isBalancePayment && booking.ticketingDeadline && (
                    <div className="flex gap-3 text-xs text-muted-foreground font-semibold bg-amber-500/[0.02] border border-amber-500/10 rounded-xl p-4.5">
                      <Calendar className="size-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        {t("balanceDeadlineNotice", {
                          deadline: formatDate(booking.ticketingDeadline, locale),
                        })}
                      </p>
                    </div>
                )}
              </div>
            </div>

            {/* SÉCURITÉ ET GARANTIE */}
            <div className="flex items-center gap-3.5 px-6 py-4 rounded-2xl border border-dashed border-border/70 text-xs font-semibold text-muted-foreground/90">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500 shrink-0">
                <ShieldCheck className="size-4 stroke-[2.2]" />
              </div>
              <p className="leading-normal">
                Vos transactions sont cryptées de bout en bout par notre protocole hautement sécurisé de niveau bancaire.
              </p>
            </div>
          </div>

          {/* COLONNE DROITE : FORMULAIRE DE PAIEMENT */}
          <div className="lg:col-span-7 rounded-2xl border border-border/50 bg-card p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-border/40">
              <div className="p-2 rounded-lg bg-primary/5 text-primary shrink-0">
                <CreditCard className="size-4" />
              </div>
              <h2 className="text-base font-bold text-foreground">Mode de règlement</h2>
            </div>

            <PaymentForm
                onSubmit={handleSubmit}
                isSubmitting={paymentMutation.isPending}
                defaultCountryCode={locale === "fr" ? "CM" : undefined}
                defaultCurrency={bookingCurrency}
            />
          </div>
        </div>

        {pinChallengePaymentId && (
            <CardPinDialog
                paymentId={pinChallengePaymentId}
                onSuccess={(payment) => {
                  setPinChallengePaymentId(null);
                  proceedToBookingTracking(payment);
                }}
                onCancel={() => setPinChallengePaymentId(null)}
            />
        )}
      </div>
  );
}

function PaymentSkeleton() {
  return (
      <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12 space-y-6 animate-pulse">
        <Skeleton className="h-4 w-36 rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-7">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </div>
  );
}