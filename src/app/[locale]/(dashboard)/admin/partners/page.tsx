"use client";

import { useState } from "react";
import { Check, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

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
    AIRLINE: "Compagnie de voyage",
    HOTEL: "Hôtel",
    CAR_RENTAL: "Location de voiture",
    FURNISHED_RENTAL: "Location meublée",
};

const STATUS_STYLES: Record<PartnerStatus, string> = {
    PENDING_REVIEW: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    APPROVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUS_LABELS: Record<PartnerStatus, string> = {
    PENDING_REVIEW: "En attente",
    APPROVED: "Approuvé",
    REJECTED: "Rejeté",
};

const FILTERS: { value: PartnerStatus | "ALL"; label: string }[] = [
    { value: "PENDING_REVIEW", label: "En attente" },
    { value: "APPROVED", label: "Approuvés" },
    { value: "REJECTED", label: "Rejetés" },
    { value: "ALL", label: "Tous" },
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
        setPage(0); // revenir à la première page à chaque changement de filtre
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
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Partenaires</h2>

                <div className="flex gap-1.5">
                    {FILTERS.map((f) => (
                        <Button
                            key={f.value}
                            size="sm"
                            variant={filter === f.value ? "secondary" : "ghost"}
                            onClick={() => handleFilterChange(f.value)}
                            className="rounded-lg text-xs font-semibold"
                        >
                            {f.label}
                        </Button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <p className="text-sm text-muted-foreground">Chargement…</p>
            ) : partners.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun partenaire dans cette catégorie.</p>
            ) : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Entreprise</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partners.map((partner) => (
                                <TableRow key={partner.id}>
                                    <TableCell className="font-medium">{partner.companyName}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {PARTNER_TYPE_LABELS[partner.partnerType]}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{partner.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={STATUS_STYLES[partner.status]}>
                                            {STATUS_LABELS[partner.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {partner.status === "PENDING_REVIEW" ? (
                                            <div className="flex justify-end gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isActioning && actioningId === partner.id}
                                                    onClick={() => handleApprove(partner.id)}
                                                    className="gap-1.5 rounded-lg text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                                                >
                                                    {approveMutation.isPending && actioningId === partner.id ? (
                                                        <Loader2 className="size-3.5 animate-spin" />
                                                    ) : (
                                                        <Check className="size-3.5" />
                                                    )}
                                                    Approuver
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isActioning && actioningId === partner.id}
                                                    onClick={() => handleReject(partner.id)}
                                                    className="gap-1.5 rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10"
                                                >
                                                    {rejectMutation.isPending && actioningId === partner.id ? (
                                                        <Loader2 className="size-3.5 animate-spin" />
                                                    ) : (
                                                        <X className="size-3.5" />
                                                    )}
                                                    Rejeter
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {data && data.totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {data.number + 1} sur {data.totalPages} — {data.totalElements} partenaire(s)
              </span>
                            <div className="flex gap-1.5">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={page === 0}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="rounded-lg"
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={page + 1 >= data.totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="rounded-lg"
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}