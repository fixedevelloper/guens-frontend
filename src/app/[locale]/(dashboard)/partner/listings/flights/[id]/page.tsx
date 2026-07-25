"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Plane,
    Clock,
    Calendar,
    Ban,
    Play,
    Trash2,
    Loader2,
    ShieldCheck,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
    useFlightDetailsQuery,
    useSuspendFlightMutation,
    useActivateFlightMutation,
    useDeleteFlightMutation,
} from "@/hooks/use-partner-queries";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FareManager } from "@/components/partner/flights/fare-manager";
import { AvailabilityManager } from "@/components/partner/flights/availability-manager";

const DAYS_MAP: Record<number, { short: string; full: string }> = {
    1: { short: "Lun", full: "Lundi" },
    2: { short: "Mar", full: "Mardi" },
    3: { short: "Mer", full: "Mercredi" },
    4: { short: "Jeu", full: "Jeudi" },
    5: { short: "Ven", full: "Vendredi" },
    6: { short: "Sam", full: "Samedi" },
    7: { short: "Dim", full: "Dimanche" },
};

export default function FlightDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const partnerId = user?.partnerId;
    const flightId = params.id as string;

    const { data: flight, isLoading, isError } = useFlightDetailsQuery(partnerId, flightId);

    const suspendMutation = useSuspendFlightMutation(partnerId ?? "");
    const activateMutation = useActivateFlightMutation(partnerId ?? "");
    const deleteMutation = useDeleteFlightMutation(partnerId ?? "");

    const [selectedFareId, setSelectedFareId] = useState<string | null>(null);

    const isActioning =
        suspendMutation.isPending || activateMutation.isPending || deleteMutation.isPending;

    const handleSuspend = () => {
        suspendMutation.mutate(flightId, {
            onSuccess: () => toast.warning("Le vol a été suspendu."),
            onError: () => toast.error("Impossible de suspendre le vol."),
        });
    };

    const handleActivate = () => {
        activateMutation.mutate(flightId, {
            onSuccess: () => toast.success("Le vol est à présent actif."),
            onError: () => toast.error("Erreur lors de l'activation."),
        });
    };

    const handleDelete = () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce vol ?")) {
            return;
        }

        deleteMutation.mutate(flightId, {
            onSuccess: () => {
                toast.info("Vol supprimé du catalogue.");
                router.push("/partner/listings");
            },
            onError: () => toast.error("Erreur lors de la suppression du vol."),
        });
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                <Skeleton className="h-8 w-48 rounded-xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
        );
    }

    if (isError || !flight) {
        return (
            <div className="max-w-md mx-auto my-12 text-center space-y-4">
                <div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                    <XCircle className="size-6" />
                </div>
                <h2 className="text-lg font-bold">Vol introuvable</h2>
                <p className="text-xs text-muted-foreground">
                    Ce vol n'existe pas ou a été supprimé.
                </p>
                <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-bold">
                    <Link href="/partner/listings">
                        <ArrowLeft className="size-4 mr-1.5" />
                        Retour à la liste
                    </Link>
                </Button>
            </div>
        );
    }

    const isActive = flight.status === "ACTIVE";
    const hours = Math.floor(flight.durationMinutes / 60);
    const minutes = flight.durationMinutes % 60;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Navigation & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            asChild
                            className="size-8 rounded-xl border-border/60"
                        >
                            <Link href="/partner/listings">
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <span className="text-xs font-semibold text-muted-foreground">
                            Fiche de vol
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black tracking-tight font-mono">
                            {flight.flightNumber}
                        </h1>
                        <Badge
                            variant="outline"
                            className={
                                isActive
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-bold"
                                    : "bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs font-bold"
                            }
                        >
                            {isActive ? "Actif" : "Suspendu"}
                        </Badge>
                    </div>
                </div>

                {/* Actions globales */}
                <div className="flex items-center gap-2">
                    {isActive ? (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isActioning}
                            onClick={handleSuspend}
                            className="rounded-xl text-xs font-bold h-9 gap-1.5"
                        >
                            {suspendMutation.isPending ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <Ban className="size-3.5 text-amber-500" />
                            )}
                            Suspendre
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isActioning}
                            onClick={handleActivate}
                            className="rounded-xl text-xs font-bold h-9 gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                        >
                            {activateMutation.isPending ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <Play className="size-3.5" />
                            )}
                            Activer
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isActioning}
                        onClick={handleDelete}
                        className="rounded-xl text-xs font-bold h-9 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                        {deleteMutation.isPending ? (
                            <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                            <Trash2 className="size-3.5" />
                        )}
                        Supprimer
                    </Button>
                </div>
            </div>

            {/* Banner Route Principal */}
            <Card className="rounded-2xl border-border/60 shadow-xs bg-linear-to-br from-card to-muted/30 overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                        {/* Origine */}
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Aéroport de départ
                            </span>
                            <div className="text-3xl font-black font-mono tracking-widest text-primary">
                                {flight.originAirportCode}
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-1 text-xs font-bold text-foreground">
                                <Clock className="size-3 text-muted-foreground" />
                                <span>{flight.departureTime.substring(0, 5)}</span>
                            </div>
                        </div>

                        {/* Visualisation du Vol */}
                        <div className="flex-1 max-w-xs space-y-2">
                            <div className="text-center text-xs font-bold text-muted-foreground flex items-center justify-center gap-1.5">
                                <span>Durée:</span>
                                <span className="text-foreground font-black">
                                    {hours}h {minutes > 0 ? `${minutes}m` : ""}
                                </span>
                            </div>

                            <div className="relative flex items-center justify-center">
                                <div className="w-full border-t-2 border-dashed border-border" />
                                <div className="absolute size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                    <Plane className="size-4 rotate-90" />
                                </div>
                            </div>

                            <p className="text-[11px] text-center text-muted-foreground font-medium">
                                Appareil: <strong className="text-foreground">{flight.aircraftType}</strong>
                            </p>
                        </div>

                        {/* Destination */}
                        <div className="space-y-1 md:text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Aéroport d'arrivée
                            </span>
                            <div className="text-3xl font-black font-mono tracking-widest text-primary">
                                {flight.destinationAirportCode}
                            </div>
                            <div className="flex items-center justify-center md:justify-end gap-1 text-xs font-bold text-foreground">
                                <Clock className="size-3 text-muted-foreground" />
                                <span>{flight.arrivalTime.substring(0, 5)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Grille d'Informations Complémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Jours d'exploitation */}
                <Card className="rounded-2xl border-border/60 shadow-xs">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Calendar className="size-4 text-primary" />
                            Programme hebdomadaire
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-xs text-muted-foreground">
                            Jours d'opération programmés pour ce vol :
                        </p>
                        <div className="grid grid-cols-7 gap-1.5">
                            {[1, 2, 3, 4, 5, 6, 7].map((dayId) => {
                                const isOperating = flight.operatingDays.includes(dayId);
                                const dayInfo = DAYS_MAP[dayId];

                                return (
                                    <div
                                        key={dayId}
                                        title={dayInfo.full}
                                        className={cn(
                                            "h-10 rounded-xl text-xs font-bold border flex flex-col items-center justify-center gap-0.5",
                                            isOperating
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-muted/20 text-muted-foreground/40 border-border/40"
                                        )}
                                    >
                                        <span>{dayInfo.short}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Spécifications Générales */}
                <Card className="rounded-2xl border-border/60 shadow-xs">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <ShieldCheck className="size-4 text-primary" />
                            Spécifications de la ligne
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5 text-xs">
                        <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                            <span className="text-muted-foreground font-medium">Identifiant interne</span>
                            <span className="font-mono font-bold text-foreground">{flight.id}</span>
                        </div>

                        <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                            <span className="text-muted-foreground font-medium">Appareil assigné</span>
                            <span className="font-semibold text-foreground">{flight.aircraftType}</span>
                        </div>

                        <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                            <span className="text-muted-foreground font-medium">Durée totale</span>
                            <span className="font-bold text-foreground">
                                {flight.durationMinutes} min ({hours}h {minutes}m)
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-muted-foreground font-medium">Statut d'exploitation</span>
                            <span className="flex items-center gap-1 font-bold">
                                {isActive ? (
                                    <>
                                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                                        <span className="text-emerald-600">Opérationnel</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="size-3.5 text-amber-500" />
                                        <span className="text-amber-600">Inactif</span>
                                    </>
                                )}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tarifs par classe de cabine */}
            <FareManager
                partnerId={partnerId ?? ""}
                flightId={flightId}
                onSelectFare={setSelectedFareId}
                selectedFareId={selectedFareId}
            />

            {/* Disponibilité (visible uniquement une fois un tarif sélectionné) */}
            {selectedFareId ? (
                <AvailabilityManager partnerId={partnerId ?? ""} fareId={selectedFareId} />
            ) : (
                <Card className="rounded-2xl border-border/60 border-dashed shadow-none">
                    <CardContent className="py-8 text-center">
                        <p className="text-xs text-muted-foreground">
                            Sélectionnez un tarif ci-dessus pour gérer sa disponibilité par date.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}