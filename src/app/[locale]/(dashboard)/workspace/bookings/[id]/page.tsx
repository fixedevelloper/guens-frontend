"use client";

import { use, useState } from "react";
import { useLocale } from "next-intl";
import {
    ArrowLeft,
    Building2,
    Plane,
    User,
    Mail,
    Calendar,
    CreditCard,
    Download,
    Send,
    ShieldCheck,
    XCircle,
    Clock,
    Ticket,
    Users,
    PlaneTakeoff,
    PlaneLanding,
    Tag,
    BadgeAlert,
    Undo2,
} from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { StatusBadge } from "@/components/tracking/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatMoney, providerLabel } from "@/lib/format";
import { useBookingQuery, useCancelBookingMutation } from "@/hooks/use-booking";
import {
    useDownloadBookingReceiptMutation,
    useRefundBookingMutation,
    useResendBookingConfirmationMutation,
} from "@/hooks/use-admin";
import { normalizeApiError } from "@/lib/api/client";

interface AdminBookingDetailPageProps {
    params: Promise<{ id: string }>;
}

/** Human labels for the provider's machine-readable error codes (see Booking#providerErrorCode /
 *  ProviderException#code) - Travel Terminus's documented codes, plus the auth-retry ones its
 *  client already recognizes internally. Unlisted codes fall back to a generic message below. */
const PROVIDER_ERROR_LABELS: Record<string, string> = {
    invalid_request: "Requête invalide - détails passager manquants ou mal formatés (ex: date de naissance).",
    unauthorized: "Authentification fournisseur échouée - jeton d'accès invalide ou expiré.",
    insufficient_funds: "Solde du portefeuille fournisseur insuffisant - à recharger pour débloquer les réservations.",
    provider_down: "Fournisseur temporairement injoignable - à réessayer plus tard.",
    token_expired: "Jeton d'accès fournisseur expiré (normalement auto-renouvelé - à surveiller si récurrent).",
    token_invalid: "Jeton d'accès fournisseur invalide (normalement auto-renouvelé - à surveiller si récurrent).",
    token_error: "Échec de génération du jeton d'accès fournisseur.",
};

function providerErrorLabel(code: string): string {
    if (PROVIDER_ERROR_LABELS[code]) {
        return PROVIDER_ERROR_LABELS[code];
    }
    if (code.startsWith("http_")) {
        return `Le fournisseur a répondu avec le statut HTTP ${code.slice(5)}.`;
    }
    return `Code fournisseur non documenté : ${code}.`;
}

export default function AdminBookingDetailPage({ params }: AdminBookingDetailPageProps) {
    const { id } = use(params);
    const locale = useLocale();

    // Récupération des données et mutation de statut
    const { data: booking, isLoading, isError } = useBookingQuery(id);
    const cancelMutation = useCancelBookingMutation(id);
    const refundMutation = useRefundBookingMutation(id);
    const receiptMutation = useDownloadBookingReceiptMutation(id);
    const resendConfirmationMutation = useResendBookingConfirmationMutation(id);
    // Real money moves on this action - require an explicit second click before firing it.
    const [confirmingRefund, setConfirmingRefund] = useState(false);

    if (isLoading) {
        return <AdminBookingDetailSkeleton />;
    }

    if (isError || !booking) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-4">
                <XCircle className="size-12 text-destructive mx-auto" />
                <h1 className="text-xl font-bold">Réservation introuvable</h1>
                <p className="text-sm text-muted-foreground">
                    Impossible de charger les détails de cette réservation (ID: {id}).
                </p>
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                    <Link href="/workspace/bookings">
                        <ArrowLeft className="size-4 mr-2" />
                        Retour à la liste
                    </Link>
                </Button>
            </div>
        );
    }

    const isHotel = booking.offerType === "HOTEL";
    const needsRefund = booking.status === "FAILED" && booking.paymentCaptured && !booking.paymentRefunded;


    const handleRefund = () => {
        refundMutation.mutate(undefined, {
            onSuccess: () => {
                setConfirmingRefund(false);
                toast.success("Paiement remboursé.");
            },
            onError: (error) => {
                setConfirmingRefund(false);
                toast.error(normalizeApiError(error).message);
            },
        });
    };

    const handleCancel = () => {
        cancelMutation.mutate(undefined, {
            onSuccess: () => toast.success("Réservation annulée."),
            onError: () => toast.error("Erreur lors de l'annulation de la réservation."),
        });
    };

    const handleDownloadReceipt = () => {
        receiptMutation.mutate(undefined, {
            onSuccess: (pdfBlob) => {
                // Opened in a new tab (not a forced <a download>) so the browser's own PDF viewer
                // handles both "print" and "save" from the same click.
                const url = URL.createObjectURL(pdfBlob);
                window.open(url, "_blank");
                setTimeout(() => URL.revokeObjectURL(url), 60_000);
            },
            onError: (error) => toast.error(normalizeApiError(error).message),
        });
    };

    const handleResendConfirmation = () => {
        resendConfirmationMutation.mutate(undefined, {
            onSuccess: () => toast.success("Confirmation envoyée par email au client."),
            onError: (error) => toast.error(normalizeApiError(error).message),
        });
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10 space-y-6">
            {/* EN-TÊTE ET ACTIONS HARMONISÉES */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-xl shrink-0"
                        >
                            <Link href="/workspace/bookings" aria-label="Retour">
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <Badge variant="outline" className="rounded-lg font-mono text-xs">
                            ID: {booking.id}
                        </Badge>
                        {booking.providerConfirmationNumber && (
                            <Badge variant="secondary" className="rounded-lg font-mono text-xs gap-1">
                                <Ticket className="size-3 text-primary" />
                                PNR: {booking.providerConfirmationNumber}
                            </Badge>
                        )}
                        <StatusBadge status={booking.status} />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2 pt-1">
                        {isHotel ? (
                            <>
                                <Building2 className="size-6 text-primary shrink-0" />
                                <span className="capitalize">{booking.hotelName || "Hôtel réservé"}</span>
                            </>
                        ) : (
                            <>
                                <Plane className="size-6 text-primary shrink-0" />
                                <span>
                                    {booking.origin} → {booking.destination}
                                </span>
                                {(booking.airline || booking.flightNumber) && (
                                    <span className="text-sm font-normal text-muted-foreground">
                                        ({booking.airline} {booking.flightNumber})
                                    </span>
                                )}
                            </>
                        )}
                    </h1>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl gap-2 text-xs font-semibold"
                        onClick={handleResendConfirmation}
                        disabled={resendConfirmationMutation.isPending || booking.status !== "CONFIRMED"}
                        title={booking.status !== "CONFIRMED" ? "Disponible uniquement pour une réservation confirmée" : undefined}
                    >
                        <Send className="size-3.5" />
                        {resendConfirmationMutation.isPending ? "Envoi…" : "Envoyer Email"}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl gap-2 text-xs font-semibold"
                        onClick={handleDownloadReceipt}
                        disabled={receiptMutation.isPending}
                    >
                        <Download className="size-3.5" />
                        {receiptMutation.isPending ? "Génération…" : "Reçu PDF"}
                    </Button>
                </div>
            </div>

            {/* BANNIÈRE D'ERREUR (Si la réservation a échoué) */}
            {booking.failureReason && (
                <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-destructive flex items-start gap-3">
                    <BadgeAlert className="size-5 shrink-0 mt-0.5" />
                    <div className="space-y-2 text-xs sm:text-sm">
                        <div>
                            <span className="font-bold block">Motif de l&apos;échec système :</span>
                            <p>{booking.failureReason}</p>
                        </div>
                        {booking.providerErrorCode && (
                            <div className="pt-2 border-t border-destructive/20">
                                <span className="font-bold block flex items-center gap-1.5">
                                    Cause fournisseur (admin)
                                    <Badge variant="outline" className="font-mono text-[10px] rounded-md border-destructive/40 text-destructive">
                                        {booking.providerErrorCode}
                                    </Badge>
                                </span>
                                <p className="text-destructive/80">{providerErrorLabel(booking.providerErrorCode)}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* GRILLE PRINCIPALE DE DÉTAILS */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_360px]">
                {/* COLONNE GAUCHE */}
                <div className="space-y-6">
                    {/* INFORMATIONS CLIENT & DOSSIER */}
                    <Card className="border-border/60 shadow-2xs rounded-2xl">
                        <CardHeader className="pb-3 border-b border-border/40">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <User className="size-4 text-primary" />
                                Informations Client & Fournisseur
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                            <div className="space-y-1">
                                <span className="text-muted-foreground block text-xs">Email de contact</span>
                                <div className="font-semibold text-foreground flex items-center gap-2">
                                    <Mail className="size-3.5 text-muted-foreground" />
                                    <a href={`mailto:${booking.contactEmail}`} className="hover:underline truncate">
                                        {booking.contactEmail}
                                    </a>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-muted-foreground block text-xs">Date de réservation</span>
                                <div className="font-semibold text-foreground flex items-center gap-2">
                                    <Calendar className="size-3.5 text-muted-foreground" />
                                    {formatDate(booking.createdAt, locale)}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-muted-foreground block text-xs">Fournisseur API</span>
                                <Badge variant="secondary" className="uppercase text-[10px] font-bold rounded-md">
                                    {providerLabel(booking.providerType)}
                                </Badge>
                            </div>

                            {booking.eTicketNumbers && booking.eTicketNumbers.length > 0 && (
                                <div className="space-y-1 sm:col-span-2 lg:col-span-3 pt-2 border-t border-border/30">
                                    <span className="text-muted-foreground block text-xs flex items-center gap-1.5">
                                        <Ticket className="size-3.5 text-primary" />
                                        Billets Électroniques (e-Tickets)
                                    </span>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {booking.eTicketNumbers.map((ticketNo) => (
                                            <Badge key={ticketNo} variant="outline" className="font-mono text-xs rounded-lg bg-muted/30">
                                                {ticketNo}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* DÉTAILS DE L'OFFRE (VOL OU HÔTEL) */}
                    <Card className="border-border/60 shadow-2xs rounded-2xl">
                        <CardHeader className="pb-3 border-b border-border/40">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                {isHotel ? <Building2 className="size-4 text-primary" /> : <Plane className="size-4 text-primary" />}
                                Détails de la Prestation ({isHotel ? "Hôtel" : "Vol"})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4 text-xs sm:text-sm">
                            {isHotel ? (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-muted-foreground block text-xs">Nom de l&apos;établissement</span>
                                        <span className="font-extrabold text-foreground capitalize text-base">
                                            {booking.hotelName || "Non renseigné"}
                                        </span>
                                        {booking.cityCode && (
                                            <span className="text-xs text-muted-foreground block">Ville: {booking.cityCode}</span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-xs">Dates de séjour</span>
                                        <span className="font-semibold text-foreground block">
                                            {booking.checkIn ? formatDate(booking.checkIn, locale) : "—"} →{" "}
                                            {booking.checkOut ? formatDate(booking.checkOut, locale) : "—"}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Informations principales de vol */}
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <span className="text-muted-foreground block text-xs flex items-center gap-1">
                                                <PlaneTakeoff className="size-3 text-primary" /> Départ
                                            </span>
                                            <span className="font-bold text-foreground text-sm">{booking.origin || "—"}</span>
                                            <span className="text-xs text-muted-foreground block">
                                                {booking.departureTime ? formatDate(booking.departureTime, locale) : "—"}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-muted-foreground block text-xs flex items-center gap-1">
                                                <PlaneLanding className="size-3 text-primary" /> Arrivée
                                            </span>
                                            <span className="font-bold text-foreground text-sm">{booking.destination || "—"}</span>
                                            <span className="text-xs text-muted-foreground block">
                                                {booking.arrivalTime ? formatDate(booking.arrivalTime, locale) : "—"}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-muted-foreground block text-xs">Compagnie & Vol</span>
                                            <span className="font-semibold text-foreground">
                                                {booking.airline || "—"} {booking.flightNumber}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-muted-foreground block text-xs flex items-center gap-1">
                                                <Tag className="size-3 text-primary" /> Classe
                                            </span>
                                            <Badge variant="secondary" className="font-semibold rounded-md uppercase text-[11px]">
                                                {booking.fareClass || "Économique"}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Tronçons d'itinéraire (legs) s'ils existent */}
                                    {booking.itineraryLegs && booking.itineraryLegs.length > 0 && (
                                        <div className="pt-3 border-t border-border/30 space-y-2">
                                            <span className="text-xs font-semibold text-muted-foreground block">
                                                Segments de vol ({booking.itineraryLegs.length})
                                            </span>
                                            <div className="space-y-2">
                                                {booking.itineraryLegs.map((leg, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between text-xs bg-muted/20 p-2.5 rounded-xl border border-border/30"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-[10px] rounded-md font-mono">
                                                                {leg.airline || booking.airline}{leg.flightNumber}
                                                            </Badge>
                                                            <span className="font-bold">{leg.origin} → {leg.destination}</span>
                                                        </div>
                                                        <span className="text-muted-foreground text-[11px]">
                                                            {leg.departureTime ? formatDate(leg.departureTime, locale) : ""}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* LISTE DES VOYAGEURS / PASSAGERS */}
                    {booking.travelers && booking.travelers.length > 0 && (
                        <Card className="border-border/60 shadow-2xs rounded-2xl">
                            <CardHeader className="pb-3 border-b border-border/40">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Users className="size-4 text-primary" />
                                    Passagers & Voyageurs ({booking.travelers.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 divide-y divide-border/30">
                                {booking.travelers.map((traveler, index) => (
                                    <div key={traveler.fullName || index} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs sm:text-sm">
                                        <div className="space-y-0.5">
                                            <span className="font-extrabold text-foreground block">
                                                {traveler.type ? `${traveler.type} ` : ""}
                                                {traveler.fullName}
                                            </span>
                                            {traveler.seatNumber && (
                                                <span className="text-xs text-muted-foreground block">{traveler.seatNumber}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="uppercase text-[10px] font-bold rounded-md">
                                                {traveler.type || "Passager"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* COLONNE DROITE */}
                <div className="space-y-6">
                    {/* RÉCAPITULATIF FINANCIER & PLAN DE PAIEMENT */}
                    <Card className="border-border/60 shadow-2xs rounded-2xl">
                        <CardHeader className="pb-3 border-b border-border/40">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <CreditCard className="size-4 text-primary" />
                                Récapitulatif Financier
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Prix Total</span>
                                <span className="text-xl font-black text-foreground">
                                    {formatMoney(booking.price, locale)}
                                </span>
                            </div>

                            {booking.reservationFee && (
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span>Frais de réservation</span>
                                    <span>{formatMoney(booking.reservationFee, locale)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <span>Solde Dû</span>
                                <span className="font-semibold text-foreground">
                                    {formatMoney(booking.amountDue, locale)}
                                </span>
                            </div>

                            <Separator />

                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Plan de paiement</span>
                                <Badge variant="secondary" className="rounded-md font-mono text-[10px]">
                                    {booking.paymentPlan || "Comptant"}
                                </Badge>
                            </div>

                            {booking.ticketingDeadline && (
                                <div className="pt-2">
                                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                                        <Clock className="size-4 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold block">Date limite d&apos;émission :</span>
                                            <span>{formatDate(booking.ticketingDeadline, locale)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* GESTION DU STATUT ADMIN */}
                    <Card className="border-border/60 shadow-2xs rounded-2xl">
                        <CardHeader className="pb-3 border-b border-border/40">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <ShieldCheck className="size-4 text-primary" />
                                Action Administrateur
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <p className="text-xs text-muted-foreground">
                                La confirmation d&apos;une réservation est automatique (paiement et/ou
                                fournisseur) ; seule l&apos;annulation peut être forcée manuellement.
                            </p>

                            {needsRefund && (
                                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                                    <span className="font-bold block">Paiement capturé, réservation échouée</span>
                                    <p>
                                        Le client a été débité mais le fournisseur n&apos;a pas confirmé la
                                        réservation. Rembourse-le pour clore le dossier.
                                    </p>
                                </div>
                            )}
                            {booking.paymentRefunded && (
                                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                                    Paiement remboursé.
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                {needsRefund && !confirmingRefund && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full rounded-xl gap-2 font-semibold border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                                        onClick={() => setConfirmingRefund(true)}
                                    >
                                        <Undo2 className="size-4" />
                                        Rembourser le paiement
                                    </Button>
                                )}
                                {needsRefund && confirmingRefund && (
                                    <div className="flex flex-col gap-2 rounded-xl border border-amber-500/40 bg-amber-500/5 p-2.5">
                                        <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                                            Confirmer le remboursement de {formatMoney(booking.price, locale)} ?
                                        </span>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 rounded-xl font-semibold border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                                                disabled={refundMutation.isPending}
                                                onClick={handleRefund}
                                            >
                                                {refundMutation.isPending ? "Remboursement…" : "Confirmer"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="flex-1 rounded-xl font-semibold"
                                                disabled={refundMutation.isPending}
                                                onClick={() => setConfirmingRefund(false)}
                                            >
                                                Annuler
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="w-full rounded-xl gap-2 font-semibold"
                                    disabled={cancelMutation.isPending || booking.status === "CANCELLED"}
                                    onClick={handleCancel}
                                >
                                    <XCircle className="size-4" />
                                    Annuler la réservation
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

{/* SKELETON DE CHARGEMENT AMÉLIORÉ */}
function AdminBookingDetailSkeleton() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10 space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-64 rounded-xl" />
                <Skeleton className="h-9 w-40 rounded-xl" />
            </div>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                    <Skeleton className="h-40 w-full rounded-2xl" />
                    <Skeleton className="h-56 w-full rounded-2xl" />
                    <Skeleton className="h-44 w-full rounded-2xl" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <Skeleton className="h-40 w-full rounded-2xl" />
                </div>
            </div>
        </div>
    );
}