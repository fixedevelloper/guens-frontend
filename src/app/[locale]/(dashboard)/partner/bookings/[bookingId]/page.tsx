"use client";

import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import {
    AlertCircle,
    ArrowLeft,
    Building,
    Car,
    CreditCard,
    Home,
    Loader2,
    Mail,
    MapPin,
    Plane,
    Printer,
    ShieldCheck,
    Users,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/tracking/status-badge";
import { useBookingQuery, useCancelBookingMutation } from "@/hooks/use-booking";
import { normalizeApiError } from "@/lib/api/client";
import { airlineLabel, formatDate, formatDateTime, formatMoney } from "@/lib/format";
import type { OfferType } from "@/lib/api/types";

const TYPE_CONFIG: Record<OfferType, { label: string; icon: typeof Plane; color: string }> = {
    FLIGHT: { label: "Vol", icon: Plane, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    HOTEL: { label: "Hôtel", icon: Building, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    CAR_RENTAL: { label: "Location Véhicule", icon: Car, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    FURNISHED_RENTAL: { label: "Résidence Meublée", icon: Home, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
};

export default function PartnerBookingDetailPage() {
    const params = useParams<{ bookingId: string }>();
    const bookingId = params.bookingId;
    const locale = useLocale();
    const router = useRouter();

    const { data: booking, isLoading, isError } = useBookingQuery(bookingId);
    const cancelMutation = useCancelBookingMutation(bookingId);

    function handleCancel() {
        cancelMutation.mutate(undefined, {
            onSuccess: () => toast.success("Réservation annulée."),
            onError: (error) => toast.error(normalizeApiError(error).message),
        });
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Chargement du dossier de réservation...</p>
            </div>
        );
    }

    if (isError || !booking) {
        return (
            <div className="mx-auto max-w-xl py-12 px-4 text-center space-y-4">
                <AlertCircle className="size-12 text-destructive mx-auto" />
                <h2 className="text-xl font-bold">Dossier introuvable</h2>
                <p className="text-sm text-muted-foreground">Aucune donnée disponible pour cet identifiant.</p>
                <Button variant="outline" onClick={() => router.push("/partner/bookings")}>
                    Retour aux réservations
                </Button>
            </div>
        );
    }

    const currentType = TYPE_CONFIG[booking.offerType];
    const TypeIcon = currentType.icon;
    const canCancel = booking.status !== "CANCELLED" && booking.status !== "FAILED";
    const primaryTraveler = booking.travelers?.[0];

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
            {/* BARRE D'ACTIONS RETOUR / IMPRESSION */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 rounded-xl text-muted-foreground hover:text-foreground"
                    onClick={() => router.push("/partner/bookings")}
                >
                    <ArrowLeft className="size-4" />
                    Retour au tableau de bord
                </Button>

                <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => window.print()}>
                    <Printer className="size-4" />
                    Imprimer
                </Button>
            </div>

            {/* HEADER DE LA RÉSERVATION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border/60 shadow-xs">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-black font-mono tracking-tight text-foreground">
                            {booking.id}
                        </h1>
                        <Badge className={`gap-1.5 font-bold text-xs ${currentType.color}`}>
                            <TypeIcon className="size-3.5" />
                            {currentType.label}
                        </Badge>
                        {booking.providerConfirmationNumber && (
                            <Badge variant="secondary" className="font-mono font-bold text-xs bg-primary/10 text-primary">
                                PNR / Ref: {booking.providerConfirmationNumber}
                            </Badge>
                        )}
                        <Badge variant="outline" className="text-xs font-mono uppercase">
                            {booking.providerType}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>Créée le {formatDateTime(booking.createdAt, locale)}</span>
                        {booking.ticketingDeadline && (
                            <>
                                <span>•</span>
                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  DL Émission: {formatDateTime(booking.ticketingDeadline, locale)}
                </span>
                            </>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <StatusBadge status={booking.status} />
                </div>
            </div>

            {/* RERAISON D'ÉCHEC SI ÉCHEC */}
            {booking.failureReason && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
                    <AlertCircle className="size-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Motif de l&apos;échec :</p>
                        <p className="text-xs opacity-90">{booking.failureReason}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* COLONNE PRINCIPALE (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* SECTEUR VOL */}
                    {booking.offerType === "FLIGHT" && booking.itineraryLegs.length > 0 && (
                        <Card className="rounded-2xl border-border/60 shadow-xs">
                            <CardHeader className="p-5 border-b border-border/40 bg-slate-50/50 dark:bg-zinc-900/10">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Plane className="size-4 text-primary" />
                                    Itinéraire Aérien
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                {booking.itineraryLegs.map((leg) => (
                                    <div key={leg.legIndex} className="rounded-xl border border-border/50 p-4 bg-background space-y-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-mono font-bold bg-muted px-2 py-0.5 rounded text-foreground">
                                                {leg.airline} {leg.flightNumber} ({airlineLabel(leg.airline)})
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Départ</span>
                                                <p className="text-sm font-bold text-foreground">{leg.origin}</p>
                                                <p className="text-xs text-muted-foreground">{formatDateTime(leg.departureTime, locale)}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Arrivée</span>
                                                <p className="text-sm font-bold text-foreground">{leg.destination}</p>
                                                <p className="text-xs text-muted-foreground">{formatDateTime(leg.arrivalTime, locale)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* LISTE DES VOYAGEURS */}
                    {booking.travelers.length > 0 && (
                        <Card className="rounded-2xl border-border/60 shadow-xs">
                            <CardHeader className="p-5 border-b border-border/40 bg-slate-50/50 dark:bg-zinc-900/10">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Users className="size-4 text-primary" />
                                    Voyageurs & Billets
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 divide-y divide-border/40">
                                {booking.travelers.map((t, idx) => {
                                    const eTicket = booking.eTicketNumbers?.[idx];
                                    return (
                                        <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                                            <p className="text-sm font-bold text-foreground">{t.fullName}</p>
                                            <span className={`font-mono text-xs px-2.5 py-1 rounded-md font-bold ${
                                                eTicket
                                                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                                                    : "text-muted-foreground bg-muted"
                                            }`}>
                                                {eTicket ? `e-Ticket: ${eTicket}` : "Billet non émis"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}

                    {/* SECTEUR HÔTEL */}
                    {booking.offerType === "HOTEL" && (
                        <Card className="rounded-2xl border-border/60 shadow-xs">
                            <CardHeader className="p-5 border-b border-border/40 bg-slate-50/50 dark:bg-zinc-900/10">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Building className="size-4 text-purple-600" />
                                    Détails de l&apos;Hôtel
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{booking.hotelName ?? "Établissement Hôtelier"}</h3>
                                    {booking.cityCode && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                                            Ville: <strong className="text-foreground font-mono">{booking.cityCode}</strong>
                                        </p>
                                    )}
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Arrivée (Check-in)</span>
                                        <span className="font-bold text-foreground">
                                            {booking.checkIn ? formatDate(booking.checkIn, locale) : "Non spécifié"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Départ (Check-out)</span>
                                        <span className="font-bold text-foreground">
                                            {booking.checkOut ? formatDate(booking.checkOut, locale) : "Non spécifié"}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* SECTEUR VÉHICULE */}
                    {booking.offerType === "CAR_RENTAL" && (
                        <Card className="rounded-2xl border-border/60 shadow-xs">
                            <CardHeader className="p-5 border-b border-border/40 bg-slate-50/50 dark:bg-zinc-900/10">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Car className="size-4 text-amber-600" />
                                    Détails du Véhicule
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <h3 className="text-lg font-bold text-foreground">
                                    {booking.vehicleBrand} {booking.vehicleModel}
                                    {booking.vehicleCategory ? ` · ${booking.vehicleCategory}` : ""}
                                </h3>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Prise en charge</span>
                                        <span className="font-bold text-foreground">
                                            {booking.pickupCity ?? "—"}
                                            {booking.rentalStart ? ` · ${formatDate(booking.rentalStart, locale)}` : ""}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Restitution</span>
                                        <span className="font-bold text-foreground">
                                            {booking.dropoffCity ?? "—"}
                                            {booking.rentalEnd ? ` · ${formatDate(booking.rentalEnd, locale)}` : ""}
                                        </span>
                                    </div>
                                </div>
                                {booking.withDriver && (
                                    <Badge variant="outline" className="rounded-md text-[10px] font-bold border-emerald-500/30 text-emerald-600">
                                        Avec chauffeur
                                    </Badge>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* SECTEUR LOGEMENT MEUBLÉ */}
                    {booking.offerType === "FURNISHED_RENTAL" && (
                        <Card className="rounded-2xl border-border/60 shadow-xs">
                            <CardHeader className="p-5 border-b border-border/40 bg-slate-50/50 dark:bg-zinc-900/10">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Home className="size-4 text-emerald-600" />
                                    Détails du Logement
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{booking.propertyTitle ?? "Logement"}</h3>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                                        {booking.cityCode}{booking.country ? `, ${booking.country}` : ""}
                                        {booking.propertyType ? ` · ${booking.propertyType}` : ""}
                                    </p>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Arrivée</span>
                                        <span className="font-bold text-foreground">
                                            {booking.checkIn ? formatDate(booking.checkIn, locale) : "Non spécifié"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Départ</span>
                                        <span className="font-bold text-foreground">
                                            {booking.checkOut ? formatDate(booking.checkOut, locale) : "Non spécifié"}
                                        </span>
                                    </div>
                                </div>
                                {booking.bedrooms != null && booking.maxGuests != null && (
                                    <p className="text-xs text-muted-foreground">
                                        {booking.bedrooms} chambre(s) · {booking.maxGuests} personne(s) max
                                        {booking.entirePlace ? " · Logement entier" : ""}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* CONTACT PRINCIPAL / ACHETEUR */}
                    <Card className="rounded-2xl border-border/60 shadow-xs">
                        <CardHeader className="p-5 border-b border-border/40 bg-slate-50/50 dark:bg-zinc-900/10">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                Coordonnées du Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-xs text-muted-foreground block">Client principal</span>
                                <span className="font-semibold text-foreground">
                                    {primaryTraveler ? primaryTraveler.fullName : "Non spécifié"}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">Email de contact</span>
                                <span className="font-semibold text-foreground flex items-center gap-1">
                                    <Mail className="size-3 text-muted-foreground" />
                                    {booking.contactEmail}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* COLONNE DROITE (1/3) : COMPTABILITÉ & ACTIONS */}
                <div className="space-y-6">
                    {/* ACTIONS PAR PARTENAIRE */}
                    <Card className="rounded-2xl border-primary/20 bg-primary/[0.01] shadow-xs">
                        <CardHeader className="p-5 border-b border-border/40">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                                <ShieldCheck className="size-4 text-primary" />
                                Gestion de la Commande
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3">
                            <p className="text-xs text-muted-foreground">
                                La confirmation d&apos;une réservation est automatique (paiement et/ou
                                fournisseur) ; seule l&apos;annulation peut être forcée manuellement.
                            </p>
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full rounded-xl font-bold gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                                onClick={handleCancel}
                                disabled={!canCancel || cancelMutation.isPending}
                            >
                                {cancelMutation.isPending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <XCircle className="size-4" />
                                )}
                                Annuler le dossier
                            </Button>
                        </CardContent>
                    </Card>

                    {/* DÉTAIL FINANCIER */}
                    <Card className="rounded-2xl border-border/60 shadow-xs">
                        <CardHeader className="p-5 border-b border-border/40 bg-slate-50/50 dark:bg-zinc-900/10">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <CreditCard className="size-4 text-primary" />
                                Structure Tarifaire
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3.5 text-sm">
                            <div className="flex justify-between items-center text-muted-foreground">
                                <span>Prix Total</span>
                                <span className="font-mono font-bold text-foreground">
                                    {formatMoney(booking.price, locale)}
                                </span>
                            </div>

                            {booking.reservationFee && (
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Frais de Réservation</span>
                                    <span className="font-mono">
                                        +{formatMoney(booking.reservationFee, locale)}
                                    </span>
                                </div>
                            )}

                            <Separator className="my-2" />

                            <div className="flex justify-between items-center text-base font-black text-foreground">
                                <span>Reste à Payer</span>
                                <span className="font-mono text-primary">
                                    {formatMoney(booking.amountDue, locale)}
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-muted/60 text-xs text-muted-foreground flex justify-between items-center">
                                <span>Plan de Paiement :</span>
                                <strong className="text-foreground uppercase font-mono">{booking.paymentPlan}</strong>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
