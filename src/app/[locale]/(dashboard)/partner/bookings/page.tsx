"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
    AlertCircle,
    Building,
    Car,
    ChevronLeft,
    ChevronRight,
    Eye,
    Home,
    Loader2,
    Plane,
    Ticket
} from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/tracking/status-badge";
import { formatDateTime, formatMoney } from "@/lib/format";
import { BookingResponse, OfferType } from "@/lib/api/types";
import { useBookingsQuery } from "@/hooks/use-partner-queries";

function OfferTypeBadge({ offerType }: { offerType: OfferType }) {
    switch (offerType) {
        case "FLIGHT":
            return (
                <Badge variant="outline" className="gap-1 bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold">
                    <Plane className="size-3" /> Vol
                </Badge>
            );
        case "HOTEL":
            return (
                <Badge variant="outline" className="gap-1 bg-purple-500/10 text-purple-600 border-purple-500/20 font-bold">
                    <Building className="size-3" /> Hôtel
                </Badge>
            );
        case "CAR_RENTAL":
            return (
                <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold">
                    <Car className="size-3" /> Location
                </Badge>
            );
        case "FURNISHED_RENTAL":
            return (
                <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
                    <Home className="size-3" /> Résidence
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="gap-1 font-mono">
                    <Ticket className="size-3" /> {offerType}
                </Badge>
            );
    }
}

export default function PartnerBookingsPage() {
    const locale = useLocale();
    const { user } = useAuth();
    const partnerId = user?.partnerId ?? user?.partnerId ?? "";

    // État local de page UI (Page 1, 2, 3...)
    const [page, setPage] = useState<number>(1);
    const pageSize = 20;

    // Conversion de la page 1-indexée UI en 0-indexée pour Spring Boot (page - 1)
    const { data, isLoading, isError, error, refetch } = useBookingsQuery(
        partnerId,
        page - 1,
        pageSize
    );

    const bookings: BookingResponse[] = data?.content ?? [];
    const totalPages = data?.totalPages ?? 1;
    const totalElements = data?.totalElements ?? 0;

    const hasPreviousPage = page > 1;
    const hasNextPage = page < totalPages;

    return (
        <div className="space-y-6 p-4 md:p-6">

            {/* EN-TÊTE */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Réservations</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        {totalElements} réservation(s) enregistrée(s) pour votre agence.
                    </p>
                </div>
            </div>

            {/* TABLEAU */}
            <div className="rounded-2xl border border-border/60 bg-card shadow-xs overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/40">
                        <TableRow>
                            <TableHead className="w-[140px]">Référence / Type</TableHead>
                            <TableHead>Contact / Client</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Montant Total</TableHead>
                            <TableHead className="w-[80px] text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {/* CHARGEMENT */}
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Loader2 className="size-6 animate-spin text-primary" />
                                        <span className="text-xs">Chargement des réservations...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}

                        {/* ERREUR */}
                        {isError && !isLoading && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-destructive">
                                        <AlertCircle className="size-6" />
                                        <p className="text-sm font-semibold">
                                            {(error as Error)?.message ?? "Impossible de charger les réservations."}
                                        </p>
                                        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                                            Réessayer
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}

                        {/* LISTE VIDE */}
                        {!isLoading && !isError && bookings.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                    Aucune réservation trouvée pour ce partenaire.
                                </TableCell>
                            </TableRow>
                        )}

                        {/* DONNÉES */}
                        {!isLoading &&
                            !isError &&
                            bookings.map((b) => {
                                const primaryTraveler = b.travelers?.[0];

                                return (
                                    <TableRow key={b.id} className="hover:bg-muted/30 transition-colors">

                                        {/* RÉFÉRENCE & TYPE */}
                                        <TableCell className="font-medium space-y-1">
                                            <div className="font-mono font-bold text-sm text-foreground">{b.id}</div>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <OfferTypeBadge offerType={b.offerType} />
                                                {b.providerConfirmationNumber && (
                                                    <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                            PNR: {b.providerConfirmationNumber}
                          </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* CLIENT */}
                                        <TableCell>
                                            <div className="text-sm font-semibold text-foreground">
                                                {primaryTraveler
                                                    ? `${primaryTraveler.fullName}`
                                                    : "Client sans nom"}
                                            </div>
                                            <div className="text-xs text-muted-foreground font-mono">{b.contactEmail}</div>
                                        </TableCell>

                                        {/* DATE DE CRÉATION */}
                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDateTime(b.createdAt, locale)}
                                        </TableCell>

                                        {/* STATUT */}
                                        <TableCell>
                                            <StatusBadge status={b.status} />
                                        </TableCell>

                                        {/* PRIX TOTAL */}
                                        <TableCell className="text-right font-mono font-bold text-foreground">
                                            {formatMoney(b.price, locale)}
                                        </TableCell>

                                        {/* ACTION DETAIL */}
                                        <TableCell className="text-center">
                                            <Button asChild variant="ghost" size="icon" className="size-8 rounded-lg">
                                                <Link href={`/partner/bookings/${b.id}`} title="Voir les détails">
                                                    <Eye className="size-4 text-muted-foreground hover:text-primary" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>

                {/* PAGINATION SPRING DATA */}
                {!isLoading && !isError && bookings.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-slate-50/30 dark:bg-zinc-900/20 text-xs text-muted-foreground">
            <span>
              Page <strong className="text-foreground">{page}</strong> sur{" "}
                <strong className="text-foreground">{totalPages}</strong> ({totalElements} éléments)
            </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 rounded-lg"
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                disabled={!hasPreviousPage}
                            >
                                <ChevronLeft className="size-3.5" /> Précédent
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 rounded-lg"
                                onClick={() => setPage((prev) => prev + 1)}
                                disabled={!hasNextPage}
                            >
                                Suivant <ChevronRight className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}