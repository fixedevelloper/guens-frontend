"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import {
    AlertCircle,
    ArrowLeft,
    Building,
    Building2,
    Calendar,
    Car,
    Clock,
    CreditCard,
    Download,
    FileText,
    Home,
    Key,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Plane,
    Printer,
    ShieldCheck,
    Ticket,
    User,
    Users,
    Utensils,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/tracking/status-badge";
import { airlineLabel, formatDateTime, formatMoney } from "@/lib/format";

// --- TYPES ALIGNÉS AVEC LE BACKEND ---

export type BookingStatus =
    | "PENDING_PAYMENT"
    | "PAID"
    | "CONFIRMED"
    | "CANCELLED"
    | "FAILED"
    | string;

export type OfferType = "AIRLINE" | "HOTEL" | "CAR_RENTAL" | "FURNISHED_RENTAL" | string;
export type ProviderType = "AMADEUS" | "TRAVELPORT" | "SABRE" | "DIRECT" | string;

export interface Money {
    amount: number;
    currency: string;
}

export interface PaymentPlan {
    type?: string;
    installments?: number;
}

export interface BookingFlightLeg {
    legIndex?: number;
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    cabinClass?: string;
}

export interface BookingTravelerResponse {
    id?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    passportNumber?: string;
    ticketNumber?: string;
}

export interface BookingResponse {
    id: string;
    status: BookingStatus;
    offerType: OfferType;
    providerType: ProviderType;
    contactEmail: string;
    price: Money;
    paymentPlan: PaymentPlan;
    reservationFee: Money | null;
    amountDue: Money;
    ticketingDeadline: string | null;
    providerConfirmationNumber: string | null;
    eTicketNumbers: string[];
    itineraryLegs: BookingFlightLeg[];
    failureReason: string | null;
    travelers: BookingTravelerResponse[];
    airline: string | null;
    flightNumber: string | null;
    origin: string | null;
    destination: string | null;
    departureTime: string | null;
    arrivalTime: string | null;
    hotelName: string | null;
    cityCode: string | null;
    checkIn: string | null;
    checkOut: string | null;
    fareClass: string | null;
    createdAt: string;
}

// Fonction de récupération API exemple
async function getBooking(bookingId: string): Promise<BookingResponse> {
    const res = await fetch(`/api/bookings/${bookingId}`);
    if (!res.ok) throw new Error("Erreur lors de la récupération du dossier");
    return res.json();
}

export default function PartnerBookingDetailPage() {
    const params = useParams<{ bookingId: string }>();
    const bookingId = params.bookingId;
    const locale = useLocale();
    const router = useRouter();

    const [booking, setBooking] = useState<BookingResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        if (!bookingId) return;

        setIsLoading(true);
        getBooking(bookingId)
            .then((data) => {
                setBooking(data);
                setError(null);
            })
            .catch((err) => {
                console.error(err);
                setError("Impossible de charger les détails de cette réservation.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [bookingId]);

    function handleConfirmAction() {
        if (!booking) return;
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            toast.success(`Action exécutée avec succès pour le dossier ${booking.id}`);
        }, 1500);
    }

    // Configuration visuelle dynamique selon l'OfferType
    const getTypeConfig = (type: OfferType) => {
        switch (type) {
            case "AIRLINE":
                return { label: "Vol", icon: Plane, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" };
            case "HOTEL":
                return { label: "Hôtel", icon: Building, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" };
            case "CAR_RENTAL":
                return { label: "Location Véhicule", icon: Car, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" };
            case "FURNISHED_RENTAL":
                return { label: "Résidence Meublée", icon: Home, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" };
            default:
                return { label: type, icon: Ticket, color: "bg-muted text-muted-foreground" };
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Chargement du dossier de réservation...</p>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="mx-auto max-w-xl py-12 px-4 text-center space-y-4">
                <AlertCircle className="size-12 text-destructive mx-auto" />
                <h2 className="text-xl font-bold">Dossier introuvable</h2>
                <p className="text-sm text-muted-foreground">{error ?? "Aucune donnée disponible pour cet identifiant."}</p>
                <Button variant="outline" onClick={() => router.push("/partner/bookings")}>
                    Retour aux réservations
                </Button>
            </div>
        );
    }

    const currentType = getTypeConfig(booking.offerType);
    const TypeIcon = currentType.icon;

    // Calcul d'affichage d'un itinéraire unifié si disponible
    const legs = booking.itineraryLegs?.length > 0 ? booking.itineraryLegs : (
        booking.airline && booking.origin && booking.destination ? [{
            airline: booking.airline,
            flightNumber: booking.flightNumber ?? "",
            origin: booking.origin,
            destination: booking.destination,
            departureTime: booking.departureTime ?? "",
            arrivalTime: booking.arrivalTime ?? "",
            cabinClass: booking.fareClass ?? "ECONOMY"
        }] : []
    );

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

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl gap-2">
                        <Printer className="size-4" />
                        Imprimer
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl gap-2">
                        <Download className="size-4" />
                        Voucher B2B
                    </Button>
                </div>
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
                        <p className="font-bold">Motif de l'échec :</p>
                        <p className="text-xs opacity-90">{booking.failureReason}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLONNE PRINCIPALE (2/3) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* SECTEUR VOL (AIRLINE) */}
                    {booking.offerType === "AIRLINE" && (
                        <>
                            {legs.length > 0 && (
                                <Card className="rounded-2xl border-border/60 shadow-xs">
                                    <CardHeader className="p-5 border-b border-border/40 bg-slate-50/50 dark:bg-zinc-900/10">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Plane className="size-4 text-primary" />
                                            Itinéraire Aérien
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5 space-y-4">
                                        {legs.map((leg, idx) => (
                                            <div key={idx} className="rounded-xl border border-border/50 p-4 bg-background space-y-3">
                                                <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold bg-muted px-2 py-0.5 rounded text-foreground">
                            {leg.airline} {leg.flightNumber} ({airlineLabel(leg.airline)})
                          </span>
                                                    {leg.cabinClass && (
                                                        <span className="font-medium text-muted-foreground">
                              Classe: <strong className="text-foreground">{leg.cabinClass}</strong>
                            </span>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Départ</span>
                                                        <p className="text-sm font-bold text-foreground">{leg.origin}</p>
                                                        <p className="text-xs text-muted-foreground">{leg.departureTime ? formatDateTime(leg.departureTime, locale) : "N/A"}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Arrivée</span>
                                                        <p className="text-sm font-bold text-foreground">{leg.destination}</p>
                                                        <p className="text-xs text-muted-foreground">{leg.arrivalTime ? formatDateTime(leg.arrivalTime, locale) : "N/A"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* LISTE DES PASSAGERS */}
                            {booking.travelers?.length > 0 && (
                                <Card className="rounded-2xl border-border/60 shadow-xs">
                                    <CardHeader className="p-5 border-b border-border/40 bg-slate-50/50 dark:bg-zinc-900/10">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Users className="size-4 text-primary" />
                                            Passagers & Billets
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5 divide-y divide-border/40">
                                        {booking.travelers.map((t, idx) => {
                                            const eTicket = t.ticketNumber || booking.eTicketNumbers?.[idx];
                                            return (
                                                <div key={t.id ?? idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">{t.firstName} {t.lastName}</p>
                                                        {t.passportNumber && (
                                                            <p className="text-xs text-muted-foreground font-mono">Passeport: {t.passportNumber}</p>
                                                        )}
                                                    </div>
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
                        </>
                    )}

                    {/* SECTEUR HÔTEL (HOTEL) */}
                    {booking.offerType === "HOTEL" && (
                        <Card className="rounded-2xl border-border/60 shadow-xs">
                            <CardHeader className="p-5 border-b border-border/40 bg-slate-50/50 dark:bg-zinc-900/10">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Building className="size-4 text-purple-600" />
                                    Détails de l'Hôtel
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{booking.hotelName ?? "Établissement Hôtelier"}</h3>
                                    {booking.cityCode && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                                            Code Ville / Destination: <strong className="text-foreground font-mono">{booking.cityCode}</strong>
                                        </p>
                                    )}
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Arrivée (Check-in)</span>
                                        <span className="font-bold text-foreground">
                      {booking.checkIn ? formatDateTime(booking.checkIn, locale) : "Non spécifié"}
                    </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block">Départ (Check-out)</span>
                                        <span className="font-bold text-foreground">
                      {booking.checkOut ? formatDateTime(booking.checkOut, locale) : "Non spécifié"}
                    </span>
                                    </div>
                                </div>
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
                        <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-xs text-muted-foreground block">Client principal</span>
                                <span className="font-semibold text-foreground">
                  {primaryTraveler ? `${primaryTraveler.firstName} ${primaryTraveler.lastName}` : "Non spécifié"}
                </span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">Email de contact</span>
                                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Mail className="size-3 text-muted-foreground" />
                                    {booking.contactEmail}
                </span>
                            </div>
                            {primaryTraveler?.phone && (
                                <div>
                                    <span className="text-xs text-muted-foreground block">Téléphone</span>
                                    <span className="font-semibold text-foreground flex items-center gap-1">
                    <Phone className="size-3 text-muted-foreground" />
                                        {primaryTraveler.phone}
                  </span>
                                </div>
                            )}
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
                            <Button
                                size="lg"
                                className="w-full rounded-xl font-bold gap-2 bg-primary hover:bg-primary/95 text-primary-foreground"
                                onClick={handleConfirmAction}
                                disabled={isProcessing || booking.status === "CANCELLED"}
                            >
                                {isProcessing ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Ticket className="size-4" />
                                )}
                                {booking.offerType === "AIRLINE" ? "Émettre les e-Tickets" : "Confirmer la Réservation"}
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full rounded-xl font-bold gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                            >
                                <XCircle className="size-4" />
                                Annuler le dossier
                            </Button>
                        </CardContent>
                    </Card>

                    {/* DÉTAIL FINANCIER ISSU DE BookingResponse */}
                    <Card className="rounded-2xl border-border/60 shadow-xs">
                        <CardHeader className="p-5 border-b border-border/40 bg-slate-50/50 dark:bg-zinc-900/10">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <CreditCard className="size-4 text-primary" />
                                Structure Tarifaire
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3.5 text-sm">
                            <div className="flex justify-between items-center text-muted-foreground">
                                <span>Prix TotalOffre</span>
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
                                <span>Reste à Payer (Due)</span>
                                <span className="font-mono text-primary">
                  {formatMoney(booking.amountDue ?? 0, locale)}
                </span>
                            </div>

                            {booking.paymentPlan?.type && (
                                <div className="p-3 rounded-xl bg-muted/60 text-xs text-muted-foreground flex justify-between items-center">
                                    <span>Plan de Paiement :</span>
                                    <strong className="text-foreground uppercase font-mono">{booking.paymentPlan.type}</strong>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}