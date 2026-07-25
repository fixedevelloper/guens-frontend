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
    Building2,
    Star,
    MapPin,
    Sparkles,
    Pencil,
    Image as ImageIcon,
    MoreHorizontal,
    Bed, Eye,
} from "lucide-react";

import {
    useHotelsQuery,
    useSuspendHotelMutation,
    useActivateHotelMutation,
    useDeleteHotelMutation,
} from "@/hooks/use-partner-queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";

export function HotelListings({ partnerId }: { partnerId: string }) {
    const [page, setPage] = useState(0);

    const { data, isLoading } = useHotelsQuery(partnerId, page);
    const suspendMutation = useSuspendHotelMutation(partnerId);
    const activateMutation = useActivateHotelMutation(partnerId);
    const deleteMutation = useDeleteHotelMutation(partnerId);

    const hotels = data?.content ?? [];
    const actioningId =
        suspendMutation.variables ??
        activateMutation.variables ??
        deleteMutation.variables ??
        null;

    const isActioning =
        suspendMutation.isPending ||
        activateMutation.isPending ||
        deleteMutation.isPending;

    function handleDelete(hotelId: string) {
        if (!window.confirm("Supprimer cet hôtel ? Cette action est irréversible.")) return;
        deleteMutation.mutate(hotelId);
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">
                            Mes établissements
                        </h2>
                        {data && (
                            <Badge
                                variant="secondary"
                                className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            >
                                {data.totalElements}
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Gérez vos hôtels, leurs chambres, leurs médias et leur statut de publication.
                    </p>
                </div>

                {hotels.length > 0 && (
                    <Button size="sm" className="gap-2 rounded-xl shadow-sm" asChild>
                        <Link href="/partner/listings/hotels/new">
                            <Plus className="size-4" />
                            Ajouter un hôtel
                        </Link>
                    </Button>
                )}
            </div>

            {/* Loading */}
            {isLoading ? (
                <HotelListingsSkeleton />
            ) : hotels.length === 0 ? (
                <Card className="border-dashed border-2 bg-card/60 shadow-none">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
                            <Building2 className="h-8 w-8" />
                            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Sparkles className="h-3 w-3" />
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-foreground">
                            Aucun hôtel enregistré
                        </h3>
                        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                            Vous n'avez encore publié aucun établissement. Ajoutez votre premier hôtel
                            pour commencer à recevoir des réservations.
                        </p>

                        <Button size="sm" className="mt-6 gap-2 rounded-xl shadow-sm" asChild>
                            <Link href="/partner/listings/hotels/new">
                                <Plus className="size-4" />
                                Ajouter votre premier hôtel
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card className="overflow-hidden border shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className="font-semibold">Établissement</TableHead>
                                <TableHead className="font-semibold">Ville</TableHead>
                                <TableHead className="font-semibold">Classement</TableHead>
                                <TableHead className="font-semibold">Statut</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {hotels.map((hotel) => {
                                const isActive = hotel.status === "ACTIVE";

                                return (
                                    <TableRow key={hotel.id} className="transition-colors hover:bg-muted/30">
                                        <TableCell className="font-medium text-foreground">
                                            <div className="flex items-center gap-3">
                                                {hotel.coverImageUrl ? (
                                                    <img
                                                        src={hotel.coverImageUrl}
                                                        alt={hotel.name}
                                                        className="h-11 w-11 shrink-0 rounded-xl border border-border/50 object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                        <Building2 className="h-5 w-5" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-foreground">{hotel.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {hotel.coverImageUrl ? "Hôtel avec image de couverture" : "Hôtel sans image"}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-muted-foreground">
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <MapPin className="size-3.5 text-muted-foreground/70" />
                                                {hotel.city}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            {hotel.starRating ? (
                                                <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                                    {hotel.starRating} étoiles
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">—</span>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    isActive
                                                        ? "gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                                        : "gap-1.5 border-muted-foreground/20 bg-muted/60 text-muted-foreground"
                                                }
                                            >
                        <span
                            className={`size-1.5 rounded-full ${
                                isActive ? "bg-emerald-500" : "bg-muted-foreground/70"
                            }`}
                        />
                                                {isActive ? "Actif" : "Suspendu"}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 w-9 rounded-lg p-0 hover:bg-muted"
                                                    >
                                                        <span className="sr-only">Ouvrir le menu</span>
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/partner/listings/hotels/${hotel.id}/edit`}
                                                            className="cursor-pointer gap-2.5"
                                                        >
                                                            <Pencil className="size-4 text-muted-foreground" />
                                                            <span>Éditer l'hôtel</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/partner/listings/hotels/${hotel.id}`}
                                                            className="cursor-pointer gap-2.5"
                                                        >
                                                            <Eye className="size-4 text-muted-foreground" />
                                                            <span>Detail l'hôtel</span>
                                                        </Link>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/partner/listings/hotels/${hotel.id}/rooms`}
                                                            className="cursor-pointer gap-2.5"
                                                        >
                                                            <Bed className="size-4 text-indigo-500" />
                                                            <span>Gérer les chambres</span>
                                                        </Link>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/partner/listings/hotels/${hotel.id}/images`}
                                                            className="cursor-pointer gap-2.5"
                                                        >
                                                            <ImageIcon className="size-4 text-blue-500" />
                                                            <span>Galerie de photos</span>
                                                        </Link>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    {isActive ? (
                                                        <DropdownMenuItem
                                                            disabled={isActioning && actioningId === hotel.id}
                                                            onClick={() => suspendMutation.mutate(hotel.id)}
                                                            className="cursor-pointer gap-2.5 text-amber-600 focus:text-amber-600 dark:text-amber-400"
                                                        >
                                                            {suspendMutation.isPending && actioningId === hotel.id ? (
                                                                <Loader2 className="size-4 animate-spin" />
                                                            ) : (
                                                                <Ban className="size-4" />
                                                            )}
                                                            <span>Suspendre l'hôtel</span>
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            disabled={isActioning && actioningId === hotel.id}
                                                            onClick={() => activateMutation.mutate(hotel.id)}
                                                            className="cursor-pointer gap-2.5 text-emerald-600 focus:text-emerald-600 dark:text-emerald-400"
                                                        >
                                                            {activateMutation.isPending && actioningId === hotel.id ? (
                                                                <Loader2 className="size-4 animate-spin" />
                                                            ) : (
                                                                <Play className="size-4" />
                                                            )}
                                                            <span>Activer l'hôtel</span>
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        disabled={isActioning && actioningId === hotel.id}
                                                        onClick={() => handleDelete(hotel.id)}
                                                        className="cursor-pointer gap-2.5 text-destructive focus:text-destructive"
                                                    >
                                                        {deleteMutation.isPending && actioningId === hotel.id ? (
                                                            <Loader2 className="size-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="size-4" />
                                                        )}
                                                        <span>Supprimer</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {data && data.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground bg-muted/20">
              <span>
                Page <strong className="text-foreground">{data.number + 1}</strong> sur{" "}
                  <strong className="text-foreground">{data.totalPages}</strong> — Total :{" "}
                  {data.totalElements} hôtel(s)
              </span>

                            <div className="flex gap-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={page === 0}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="h-8 w-8 rounded-lg p-0"
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={page + 1 >= data.totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="h-8 w-8 rounded-lg p-0"
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}

function HotelListingsSkeleton() {
    return (
        <Card className="overflow-hidden border shadow-sm">
            <div className="p-4 space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                            <div className="space-y-1.5">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>

                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-9 w-9 rounded-lg" />
                    </div>
                ))}
            </div>
        </Card>
    );
}