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
    Edit3,
    ImageIcon,
    Home,
    Building2,
} from "lucide-react";

import {
    usePropertiesQuery,
    useSuspendPropertyMutation,
    useActivatePropertyMutation,
    useDeletePropertyMutation,
} from "@/hooks/use-partner-queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function PropertyListings({ partnerId }: { partnerId: string }) {
    const [page, setPage] = useState(0);

    // React Query hooks
    const { data, isLoading } = usePropertiesQuery(partnerId, page);
    const suspendMutation = useSuspendPropertyMutation(partnerId);
    const activateMutation = useActivatePropertyMutation(partnerId);
    const deleteMutation = useDeletePropertyMutation(partnerId);

    const properties = data?.content ?? [];
    const actioningId =
        suspendMutation.variables ??
        activateMutation.variables ??
        deleteMutation.variables ??
        null;

    const isActioning =
        suspendMutation.isPending ||
        activateMutation.isPending ||
        deleteMutation.isPending;

    function handleDelete(propertyId: string) {
        if (!window.confirm("Supprimer ce logement ? Cette action est irréversible.")) return;
        deleteMutation.mutate(propertyId);
    }

    return (
        <div className="space-y-6">
            {/* HEADER DE SECTION */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black tracking-tight">Mes logements</h2>
                    <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                        Gérez vos appartements, maisons et résidences meublées
                    </p>
                </div>

                <Button size="sm" asChild className="rounded-xl font-bold text-xs gap-1.5 h-9 px-4">
                    <Link href="/partner/listings/properties/new">
                        <Plus className="size-4" />
                        <span>Ajouter un logement</span>
                    </Link>
                </Button>
            </div>

            {/* ÉTAT DE CHARGEMENT (SKELETON) */}
            {isLoading ? (
                <Card className="rounded-2xl border-border/60 p-4 space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between gap-4 py-2">
                            <Skeleton className="h-5 w-1/3 rounded-lg" />
                            <Skeleton className="h-5 w-1/6 rounded-lg" />
                            <Skeleton className="h-5 w-1/6 rounded-lg" />
                            <Skeleton className="h-8 w-24 rounded-xl" />
                        </div>
                    ))}
                </Card>
            ) : properties.length === 0 ? (
                /* ÉTAT VIDE */
                <Card className="rounded-2xl border-dashed border-border/70">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                            <Home className="size-6" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Aucun logement enregistré</h3>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm font-medium">
                            Vous n'avez pas encore publié de résidence meublée ou d'appartement.
                        </p>
                        <Button size="sm" asChild className="mt-4 rounded-xl font-bold text-xs h-9 px-4">
                            <Link href="/partner/listings/properties/new">
                                <Plus className="size-4 mr-1.5" />
                                Créer ma première annonce
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                /* TABLEAU DES LOGEMENTS */
                <div className="space-y-4">
                    <Card className="rounded-2xl border-border/60 overflow-hidden shadow-2xs">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead className="font-bold text-xs">Titre</TableHead>
                                    <TableHead className="font-bold text-xs">Ville</TableHead>
                                    <TableHead className="font-bold text-xs">Prix / nuit</TableHead>
                                    <TableHead className="font-bold text-xs">Statut</TableHead>
                                    <TableHead className="font-bold text-xs text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {properties.map((property) => {
                                    const isCurrentActioning = isActioning && actioningId === property.id;

                                    return (
                                        <TableRow key={property.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-extrabold text-xs">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="size-4 text-primary shrink-0" />
                                                    <span className="line-clamp-1">{property.title}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-xs font-semibold text-muted-foreground">
                                                {property.city}
                                            </TableCell>

                                            <TableCell className="text-xs font-black">
                                                {property.pricePerNight?.toLocaleString()} {property.currency}
                                            </TableCell>

                                            <TableCell>
                                                <Badge
                                                    variant={property.status === "ACTIVE" ? "default" : "secondary"}
                                                    className={cn(
                                                        "rounded-lg text-[10px] font-extrabold uppercase",
                                                        property.status === "ACTIVE"
                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                                    )}
                                                >
                                                    {property.status === "ACTIVE" ? "Actif" : "Suspendu"}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Lien Médiathèque */}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        asChild
                                                        className="size-8 rounded-xl"
                                                        title="Gérer les photos"
                                                    >
                                                        <Link href={`/partner/listings/properties/${property.id}/images`}>
                                                            <ImageIcon className="size-4 text-muted-foreground" />
                                                        </Link>
                                                    </Button>

                                                    {/* Lien Édition */}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        asChild
                                                        className="size-8 rounded-xl"
                                                        title="Modifier"
                                                    >
                                                        <Link href={`/partner/listings/properties/${property.id}/edit`}>
                                                            <Edit3 className="size-4 text-muted-foreground" />
                                                        </Link>
                                                    </Button>

                                                    {/* Suspension / Activation */}
                                                    {property.status === "ACTIVE" ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={isCurrentActioning}
                                                            onClick={() => suspendMutation.mutate(property.id)}
                                                            className="gap-1.5 rounded-xl h-8 text-xs font-bold"
                                                        >
                                                            {suspendMutation.isPending && isCurrentActioning ? (
                                                                <Loader2 className="size-3.5 animate-spin" />
                                                            ) : (
                                                                <Ban className="size-3.5" />
                                                            )}
                                                            <span>Suspendre</span>
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={isCurrentActioning}
                                                            onClick={() => activateMutation.mutate(property.id)}
                                                            className="gap-1.5 rounded-xl h-8 text-xs font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                                                        >
                                                            {activateMutation.isPending && isCurrentActioning ? (
                                                                <Loader2 className="size-3.5 animate-spin" />
                                                            ) : (
                                                                <Play className="size-3.5" />
                                                            )}
                                                            <span>Activer</span>
                                                        </Button>
                                                    )}

                                                    {/* Suppression */}
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        disabled={isCurrentActioning}
                                                        onClick={() => handleDelete(property.id)}
                                                        className="size-8 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/10"
                                                        title="Supprimer"
                                                    >
                                                        {deleteMutation.isPending && isCurrentActioning ? (
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
                    </Card>

                    {/* PAGINATION */}
                    {data && data.totalPages > 1 && (
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
              <span>
                Page {data.number + 1} sur {data.totalPages} — {data.totalElements} logement(s)
              </span>
                            <div className="flex items-center gap-1.5">
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
                </div>
            )}
        </div>
    );
}