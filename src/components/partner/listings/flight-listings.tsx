"use client";

import React, { useState } from "react";
import {
    Plus,
    Loader2,
    Ban,
    Play,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Plane,
    PlaneTakeoff,
    Eye, // Import de l'icône Eye pour les détails
} from "lucide-react";
import { toast } from "sonner";

import {
    useFlightsQuery,
    useSuspendFlightMutation,
    useActivateFlightMutation,
    useDeleteFlightMutation,
} from "@/hooks/use-partner-queries";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface FlightListingsProps {
    partnerId: string;
    onAddFlight?: () => void;
}

export function FlightListings({ partnerId, onAddFlight }: FlightListingsProps) {
    const [page, setPage] = useState(0);

    const { data, isLoading } = useFlightsQuery(partnerId, page);
    const suspendMutation = useSuspendFlightMutation(partnerId);
    const activateMutation = useActivateFlightMutation(partnerId);
    const deleteMutation = useDeleteFlightMutation(partnerId);

    const flights = data?.content ?? [];
    const isActioning =
        suspendMutation.isPending || activateMutation.isPending || deleteMutation.isPending;
    const actioningId =
        suspendMutation.variables ?? activateMutation.variables ?? deleteMutation.variables ?? null;

    // Actions avec retour Toast
    function handleSuspend(flightId: string) {
        suspendMutation.mutate(flightId, {
            onSuccess: () => toast.warning("Le vol a été suspendu."),
            onError: () => toast.error("Impossible de suspendre le vol."),
        });
    }

    function handleActivate(flightId: string) {
        activateMutation.mutate(flightId, {
            onSuccess: () => toast.success("Le vol est à présent actif."),
            onError: () => toast.error("Erreur lors de l'activation du vol."),
        });
    }

    function handleDelete(flightId: string) {
        if (!window.confirm("Voulez-vous vraiment supprimer ce vol ? Cette action est irréversible.")) {
            return;
        }

        deleteMutation.mutate(flightId, {
            onSuccess: () => toast.info("Vol supprimé du catalogue."),
            onError: () => toast.error("Erreur lors de la suppression du vol."),
        });
    }

    return (
        <Card className="border-border/60 shadow-xs rounded-2xl overflow-hidden bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                    <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                        <Plane className="size-5 text-primary" />
                        Mes vols
                    </CardTitle>
                    <CardDescription className="text-xs font-medium mt-0.5">
                        Gérez le programme de vols, les liaisons et la disponibilité.
                    </CardDescription>
                </div>

                <Button
                    size="sm"
                    asChild
                    className="gap-1.5 rounded-xl font-bold text-xs shadow-xs h-9"
                >
                    <Link href="/partner/listings/flights/new">
                        <Plus className="size-4" />
                        Ajouter un vol
                    </Link>
                </Button>
            </CardHeader>

            <CardContent className="pt-0">
                {isLoading ? (
                    <div className="space-y-3 py-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full rounded-xl" />
                        ))}
                    </div>
                ) : flights.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-border/60 rounded-2xl my-2">
                        <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                            <PlaneTakeoff className="size-6" />
                        </div>
                        <h3 className="text-xs font-bold text-foreground">Aucun vol enregistré</h3>
                        <p className="text-[11px] text-muted-foreground mt-1 max-w-sm mx-auto">
                            Commencez par planifier votre première liaison aérienne pour la rendre disponible à la réservation.
                        </p>
                        <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="mt-4 gap-1.5 rounded-xl text-xs font-bold h-8"
                        >
                            <Link href="/partner/listings/flights/new">
                                <Plus className="size-3.5" />
                                Créer un vol
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="rounded-xl border border-border/50 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/40">
                                    <TableRow>
                                        <TableHead className="text-xs font-bold">N° de vol</TableHead>
                                        <TableHead className="text-xs font-bold">Liaison / Trajet</TableHead>
                                        <TableHead className="text-xs font-bold">Statut</TableHead>
                                        <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {flights.map((flight) => {
                                        const isCurrentItemLoading = isActioning && actioningId === flight.id;
                                        const isActive = flight.status === "ACTIVE";

                                        return (
                                            <TableRow key={flight.id} className="hover:bg-muted/30">
                                                <TableCell className="font-mono font-bold text-xs">
                                                    {flight.flightNumber}
                                                </TableCell>

                                                <TableCell className="text-xs font-semibold">
                                                    <div className="flex items-center gap-1.5">
                                                        <span>{flight.originAirportCode}</span>
                                                        <span className="text-muted-foreground font-normal">→</span>
                                                        <span>{flight.destinationAirportCode}</span>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            isActive
                                                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold"
                                                                : "bg-muted text-muted-foreground border-border text-[10px] font-bold"
                                                        }
                                                    >
                                                        {isActive ? "Actif" : "Suspendu"}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    <div className="flex justify-end items-center gap-1.5">
                                                        {/* Bouton Détails */}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            asChild
                                                            className="gap-1.5 rounded-xl text-xs h-8"
                                                            title="Voir les détails du vol"
                                                        >
                                                            <Link href={`/partner/listings/flights/${flight.id}`}>
                                                                <Eye className="size-3.5 text-muted-foreground" />
                                                                <span className="hidden sm:inline">Détails</span>
                                                            </Link>
                                                        </Button>

                                                        {/* Bouton Suspendre / Activer */}
                                                        {isActive ? (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                disabled={isCurrentItemLoading}
                                                                onClick={() => handleSuspend(flight.id)}
                                                                className="gap-1.5 rounded-xl text-xs h-8"
                                                                title="Suspendre le vol"
                                                            >
                                                                {suspendMutation.isPending && isCurrentItemLoading ? (
                                                                    <Loader2 className="size-3.5 animate-spin" />
                                                                ) : (
                                                                    <Ban className="size-3.5 text-amber-500" />
                                                                )}
                                                                <span className="hidden sm:inline">Suspendre</span>
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                disabled={isCurrentItemLoading}
                                                                onClick={() => handleActivate(flight.id)}
                                                                className="gap-1.5 rounded-xl text-xs h-8 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                                                                title="Activer le vol"
                                                            >
                                                                {activateMutation.isPending && isCurrentItemLoading ? (
                                                                    <Loader2 className="size-3.5 animate-spin" />
                                                                ) : (
                                                                    <Play className="size-3.5" />
                                                                )}
                                                                <span className="hidden sm:inline">Activer</span>
                                                            </Button>
                                                        )}

                                                        {/* Bouton Supprimer */}
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            disabled={isCurrentItemLoading}
                                                            onClick={() => handleDelete(flight.id)}
                                                            className="size-8 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                                                            title="Supprimer le vol"
                                                        >
                                                            {deleteMutation.isPending && isCurrentItemLoading ? (
                                                                <Loader2 className="size-3.5 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="size-3.5" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {data && data.totalPages > 1 && (
                            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                                <span>
                                    Page {data.number + 1} sur {data.totalPages} — {data.totalElements} vol(s)
                                </span>
                                <div className="flex gap-1.5">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        disabled={page === 0}
                                        onClick={() => setPage((p) => p - 1)}
                                        className="size-8 rounded-xl"
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        disabled={page + 1 >= data.totalPages}
                                        onClick={() => setPage((p) => p + 1)}
                                        className="size-8 rounded-xl"
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}