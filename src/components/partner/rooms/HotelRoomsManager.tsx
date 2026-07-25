"use client";

import React, { useState } from "react";
import {
    Plus,
    Ban,
    Play,
    Trash2,
    ChevronLeft,
    Bed,
    Users,
    Search,
    Image as ImageIcon,
    Pencil,
    MoreHorizontal,
    Sparkles,
    Coins,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

import { RoomTypeResponse } from "@/lib/api/partner";
import {
    useDeleteRoomMutation,
    useHotelRoomsQuery,
    useToggleRoomStatusMutation
} from "../../../hooks/use-partner-queries";

interface HotelRoomsManagerProps {
    partnerId: string;
    hotelId: string;
    hotelName?: string;
}

export function HotelRoomsManager({ partnerId, hotelId, hotelName = "Hôtel" }: HotelRoomsManagerProps) {
    const [search, setSearch] = useState("");

    // Appels aux hooks configurés avec le backend Spring Boot
    const { data: rooms = [], isLoading, isError, error } = useHotelRoomsQuery(partnerId, hotelId);
    const toggleStatusMutation = useToggleRoomStatusMutation(partnerId, hotelId);
    const deleteRoomMutation = useDeleteRoomMutation(partnerId, hotelId);

    // Filtrage local
    const filteredRooms = rooms.filter(
        (r: RoomTypeResponse) =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            (r.bedType && r.bedType.toLowerCase().includes(search.toLowerCase()))
    );

    // Calculs KPI
    const totalCapacity = rooms.reduce((sum, r) => sum + (r.maxOccupancy || 0) * (r.quantity || 0), 0);
    const totalInventory = rooms.reduce((sum, r) => sum + (r.quantity || 0), 0);
    const avgPrice = rooms.length
        ? Math.round(rooms.reduce((sum, r) => sum + (r.pricePerNight || 0), 0) / rooms.length)
        : 0;

    // Handlers
    const handleToggleStatus = (room: RoomTypeResponse) => {
        const newStatus = room.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

        toggleStatusMutation.mutate(
            { roomTypeId: room.id, status: newStatus },
            {
                onSuccess: () => {
                    toast.success(
                        newStatus === "ACTIVE"
                            ? "Chambre activée avec succès !"
                            : "Chambre masquée de la vente."
                    );
                },
                onError: (err: Error) => {
                    toast.error(err.message || "Impossible de modifier le statut.");
                },
            }
        );
    };

    const handleDelete = (roomTypeId: string) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce type de chambre ?")) return;

        deleteRoomMutation.mutate(roomTypeId, {
            onSuccess: () => {
                toast.success("Chambre supprimée avec succès.");
            },
            onError: (err: Error) => {
                toast.error(err.message || "Erreur lors de la suppression.");
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Header & Breadcrumb */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Button variant="ghost" size="sm" className="h-7 px-2 rounded-lg text-xs" asChild>
                            <Link href="/partner/listings">
                                <ChevronLeft className="size-3.5 mr-1" />
                                Mes établissements
                            </Link>
                        </Button>
                        <span className="text-muted-foreground/40 text-xs">/</span>
                        <span className="text-xs font-medium text-muted-foreground">{hotelName}</span>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        Gestion des chambres
                        <Badge variant="secondary" className="rounded-full px-2.5 font-semibold">
                            {rooms.length}
                        </Badge>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Configurez les types de chambres, leurs disponibilités, capacités et tarifs.
                    </p>
                </div>

                <Button size="sm" className="gap-2 rounded-xl shadow-sm" asChild>
                    <Link href={`/partner/listings/hotels/${hotelId}/rooms/new`}>
                        <Plus className="size-4" />
                        Ajouter une chambre
                    </Link>
                </Button>
            </div>

            {/* Statistiques KPI */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="border-border/60 shadow-sm bg-card/50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            <Bed className="size-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Chambres totales</p>
                            <p className="text-xl font-bold text-foreground mt-0.5">{totalInventory} unités</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm bg-card/50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Users className="size-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Capacité d'accueil</p>
                            <p className="text-xl font-bold text-foreground mt-0.5">{totalCapacity} personnes</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm bg-card/50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Coins className="size-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Tarif moyen / nuit</p>
                            <p className="text-xl font-bold text-foreground mt-0.5">
                                {avgPrice.toLocaleString("fr-FR")} XAF
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtre de recherche */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher une chambre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 rounded-xl text-xs"
                    />
                </div>
            </div>

            {/* Ingestion des états : Chargement / Erreur / Liste */}
            {isLoading ? (
                <RoomsSkeleton />
            ) : isError ? (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="flex items-center gap-3 py-6 text-destructive">
                        <AlertCircle className="size-5 shrink-0" />
                        <p className="text-sm font-medium">
                            {error instanceof Error ? error.message : "Erreur de communication avec le serveur."}
                        </p>
                    </CardContent>
                </Card>
            ) : filteredRooms.length === 0 ? (
                <Card className="border-dashed border-2 bg-card/50 shadow-none">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 mb-4 ring-8 ring-indigo-500/5">
                            <Bed className="h-8 w-8" />
                            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                                <Sparkles className="h-3 w-3" />
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-foreground">
                            {search ? "Aucun résultat" : "Aucune chambre configurée"}
                        </h3>
                        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">
                            {search
                                ? "Modifiez votre recherche pour trouver d'autres chambres."
                                : "Ajoutez les types de chambres disponibles dans cet établissement."}
                        </p>

                        {!search && (
                            <Button size="sm" className="mt-6 gap-2 rounded-xl shadow-sm" asChild>
                                <Link href={`/partner/listings/hotels/${hotelId}/rooms/new`}>
                                    <Plus className="size-4" />
                                    Ajouter une chambre
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card className="overflow-hidden border border-border/60 shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead>Type de chambre</TableHead>
                                <TableHead>Literie & Capacité</TableHead>
                                <TableHead>Équipements</TableHead>
                                <TableHead>Inventaire</TableHead>
                                <TableHead>Tarif / nuit</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRooms.map((room) => (
                                <TableRow key={room.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-semibold text-foreground">
                                        <div className="flex items-center gap-3">
                                            {room.coverImageUrl ? (
                                                <img
                                                    src={room.coverImageUrl}
                                                    alt={room.name}
                                                    className="h-12 w-16 rounded-lg object-cover border border-border/50 shrink-0"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 shrink-0">
                                                    <Bed className="h-6 w-6" />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground line-clamp-1">
                                                    {room.name}
                                                </span>
                                                {room.description && (
                                                    <span className="text-xs text-muted-foreground line-clamp-1">
                                                        {room.description}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex items-center gap-1.5 text-foreground font-medium">
                                                <Bed className="size-3.5 text-muted-foreground" />
                                                <span>{room.bedType || "Non spécifié"}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Users className="size-3.5 text-muted-foreground" />
                                                <span>Jusqu'à {room.maxOccupancy} pers.</span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                                            {room.amenities?.slice(0, 3).map((amenity, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="text-[10px] px-2 py-0.5 rounded-md font-normal"
                                                >
                                                    {amenity}
                                                </Badge>
                                            ))}
                                            {room.amenities && room.amenities.length > 3 && (
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 rounded-md">
                                                    +{room.amenities.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <span className="text-xs font-semibold text-foreground">
                                            {room.quantity} disponible(s)
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <span className="text-xs font-bold text-foreground">
                                            {room.pricePerNight?.toLocaleString("fr-FR")} XAF
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={
                                                room.status === "ACTIVE"
                                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 gap-1.5"
                                                    : "border-muted-foreground/20 bg-muted/60 text-muted-foreground gap-1.5"
                                            }
                                        >
                                            <span
                                                className={`size-1.5 rounded-full ${
                                                    room.status === "ACTIVE" ? "bg-emerald-500" : "bg-muted-foreground/70"
                                                }`}
                                            />
                                            {room.status === "ACTIVE" ? "Disponible" : "Masquée"}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-52 rounded-xl">
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={`/partner/listings/hotels/${hotelId}/rooms/${room.id}/edit`}
                                                        className="cursor-pointer gap-2.5"
                                                    >
                                                        <Pencil className="size-4 text-muted-foreground" />
                                                        <span>Modifier les détails</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={`/partner/listings/hotels/${hotelId}/rooms/${room.id}`}
                                                        className="cursor-pointer gap-2.5"
                                                    >
                                                        <Pencil className="size-4 text-muted-foreground" />
                                                        <span>Détails</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={`/partner/listings/hotels/${hotelId}/rooms/${room.id}/images`}
                                                        className="cursor-pointer gap-2.5"
                                                    >
                                                        <ImageIcon className="size-4 text-blue-500" />
                                                        <span>Photos de la chambre</span>
                                                    </Link>
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem
                                                    onClick={() => handleToggleStatus(room)}
                                                    disabled={toggleStatusMutation.isPending}
                                                    className={`cursor-pointer gap-2.5 ${
                                                        room.status === "ACTIVE"
                                                            ? "text-amber-600 dark:text-amber-400"
                                                            : "text-emerald-600 dark:text-emerald-400"
                                                    }`}
                                                >
                                                    {room.status === "ACTIVE" ? (
                                                        <>
                                                            <Ban className="size-4" />
                                                            <span>Masquer de la vente</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="size-4" />
                                                            <span>Rendre disponible</span>
                                                        </>
                                                    )}
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(room.id)}
                                                    disabled={deleteRoomMutation.isPending}
                                                    className="cursor-pointer gap-2.5 text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="size-4" />
                                                    <span>Supprimer</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    );
}

function RoomsSkeleton() {
    return (
        <Card className="overflow-hidden border border-border/60 p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-16 rounded-lg shrink-0" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
            ))}
        </Card>
    );
}