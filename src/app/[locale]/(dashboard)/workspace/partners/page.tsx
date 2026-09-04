"use client";

import { useState } from "react";
import {
    Check,
    X,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Building2,
    Clock,
    CheckCircle2,
    XCircle,
    Users,
    Mail,
    Tag
} from "lucide-react";

import type { PartnerStatus, PartnerType } from "@/lib/api/types";
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
import {
    useAdminPartnersQuery,
    useApprovePartnerMutation,
    useRejectPartnerMutation
} from "../../../../../hooks/use-admin";

const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
    AIRLINE: "Compagnie aérienne",
    HOTEL: "Hôtel & Hébergement",
    CAR_RENTAL: "Location de véhicule",
    FURNISHED_RENTAL: "Location meublée",
};

const STATUS_CONFIG: Record<PartnerStatus, { label: string; badge: string; dot: string; icon: typeof Clock }> = {
    PENDING_REVIEW: {
        label: "En attente",
        badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15",
        dot: "bg-amber-500 animate-pulse",
        icon: Clock
    },
    APPROVED: {
        label: "Approuvé",
        badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15",
        dot: "bg-emerald-500",
        icon: CheckCircle2
    },
    REJECTED: {
        label: "Rejeté",
        badge: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/15",
        dot: "bg-rose-500",
        icon: XCircle
    },
};

const FILTERS: { value: PartnerStatus | "ALL"; label: string; icon?: typeof Users }[] = [
    { value: "PENDING_REVIEW", label: "En attente" },
    { value: "APPROVED", label: "Approuvés" },
    { value: "REJECTED", label: "Rejetés" },
    { value: "ALL", label: "Tous les partenaires" },
];

export default function AdminPartnersPage() {
    const [filter, setFilter] = useState<PartnerStatus | "ALL">("PENDING_REVIEW");
    const [page, setPage] = useState(0);
    const { data, isLoading } = useAdminPartnersQuery(filter, page);
    const approveMutation = useApprovePartnerMutation();
    const rejectMutation = useRejectPartnerMutation();

    const partners = data?.content ?? [];
    const actioningId = approveMutation.variables ?? rejectMutation.variables ?? null;
    const isActioning = approveMutation.isPending || rejectMutation.isPending;

    function handleFilterChange(value: PartnerStatus | "ALL") {
        setFilter(value);
        setPage(0);
    }

    function handleApprove(id: string) {
        if (!window.confirm("Confirmer l'approbation de ce partenaire ? Un compte lui sera créé et un email de bienvenue envoyé.")) return;
        approveMutation.mutate(id);
    }

    function handleReject(id: string) {
        if (!window.confirm("Confirmer le rejet de ce partenaire ?")) return;
        rejectMutation.mutate(id);
    }

    return (
        <div className="space-y-6">
            {/* Header & Filtres */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des Partenaires</h1>
                    <p className="text-sm text-muted-foreground">
                        Validez et gérez les demandes d&apos;adhésion des prestataires.
                    </p>
                </div>

                {/* Filtres Segmentés */}
                <div className="inline-flex items-center rounded-xl border bg-muted/50 p-1 backdrop-blur-xs">
                    {FILTERS.map((f) => {
                        const isActive = filter === f.value;
                        return (
                            <button
                                key={f.value}
                                onClick={() => handleFilterChange(f.value)}
                                className={`relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                                    isActive
                                        ? "bg-background text-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {f.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Conteneur Principal de la Table */}
            <div className="rounded-2xl border bg-card text-card-foreground shadow-xs overflow-hidden">
                {isLoading ? (
                    <TableSkeleton />
                ) : partners.length === 0 ? (
                    <EmptyState filter={filter} />
                ) : (
                    <>
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[300px] text-xs font-semibold uppercase tracking-wider">
                                        Entreprise
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider">
                                        Secteur d&apos;activité
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider">
                                        Statut
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {partners.map((partner) => {
                                    const statusConfig = STATUS_CONFIG[partner.status];
                                    const StatusIcon = statusConfig.icon;
                                    const isItemActioning = isActioning && actioningId === partner.id;

                                    return (
                                        <TableRow key={partner.id} className="group transition-colors hover:bg-muted/30">
                                            {/* Entreprise + Avatar initiales */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm border border-primary/20 group-hover:scale-105 transition-transform">
                                                        {partner.companyName.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-semibold text-sm truncate text-foreground">
                                                            {partner.companyName}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                                            <Mail className="size-3 shrink-0" />
                                                            {partner.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Type de partenaire */}
                                            <TableCell>
                                                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/60 px-2.5 py-1 rounded-md border border-border/50">
                                                    <Tag className="size-3 text-muted-foreground/70" />
                                                    {PARTNER_TYPE_LABELS[partner.partnerType] ?? partner.partnerType}
                                                </span>
                                            </TableCell>

                                            {/* Badge Statut enrichi */}
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.badge}`}
                                                >
                                                    <span className={`size-1.5 rounded-full ${statusConfig.dot}`} />
                                                    <StatusIcon className="size-3" />
                                                    {statusConfig.label}
                                                </Badge>
                                            </TableCell>

                                            {/* Zone d'actions */}
                                            <TableCell className="text-right">
                                                {partner.status === "PENDING_REVIEW" ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={isItemActioning}
                                                            onClick={() => handleApprove(partner.id)}
                                                            className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:bg-emerald-500/20 transition-all shadow-2xs"
                                                        >
                                                            {approveMutation.isPending && isItemActioning ? (
                                                                <Loader2 className="size-3.5 animate-spin" />
                                                            ) : (
                                                                <Check className="size-3.5" />
                                                            )}
                                                            Approuver
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={isItemActioning}
                                                            onClick={() => handleReject(partner.id)}
                                                            className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-rose-600 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-700 dark:hover:bg-rose-500/20 transition-all shadow-2xs"
                                                        >
                                                            {rejectMutation.isPending && isItemActioning ? (
                                                                <Loader2 className="size-3.5 animate-spin" />
                                                            ) : (
                                                                <X className="size-3.5" />
                                                            )}
                                                            Rejeter
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/60 italic">Aucune action requise</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        {/* Pagination Bar */}
                        {data && data.totalPages > 1 && (
                            <div className="flex items-center justify-between border-t bg-muted/20 px-6 py-4 text-xs text-muted-foreground">
                                <span>
                                    Page <strong className="text-foreground">{data.number + 1}</strong> sur{" "}
                                    <strong className="text-foreground">{data.totalPages}</strong> —{" "}
                                    <strong className="text-foreground">{data.totalElements}</strong> partenaire(s) au total
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={page === 0}
                                        onClick={() => setPage((p) => p - 1)}
                                        className="h-8 rounded-lg px-2.5"
                                    >
                                        <ChevronLeft className="size-4 mr-1" />
                                        Précédent
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={page + 1 >= data.totalPages}
                                        onClick={() => setPage((p) => p + 1)}
                                        className="h-8 rounded-lg px-2.5"
                                    >
                                        Suivant
                                        <ChevronRight className="size-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

{/* Composant d'état de chargement (Skeletons) */}
function TableSkeleton() {
    return (
        <div className="p-6 space-y-4 animate-pulse">
            <div className="h-6 w-1/4 bg-muted rounded-md mb-6" />
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-border/40 last:border-0">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-muted" />
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-muted rounded-md" />
                            <div className="h-3 w-24 bg-muted/60 rounded-md" />
                        </div>
                    </div>
                    <div className="h-6 w-28 bg-muted rounded-md" />
                    <div className="h-6 w-20 bg-muted rounded-full" />
                    <div className="h-8 w-36 bg-muted rounded-lg" />
                </div>
            ))}
        </div>
    );
}

{/* Composant d'état vide sous forme de carte d'information */}
function EmptyState({ filter }: { filter: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mb-4 border border-border/50">
                <Building2 className="size-7" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Aucun partenaire trouvé</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
                {filter === "PENDING_REVIEW"
                    ? "Toutes les demandes de partenariats ont été traitées."
                    : "Aucun partenaire ne correspond au filtre actuellement sélectionné."}
            </p>
        </div>
    );
}