"use client";

import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Bed,
    Users,
    Ruler,
    Ban,
    Play,
    Trash2,
    Loader2,
    Pencil,
    ShieldCheck,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
    useRoomTypeQuery,
    useToggleRoomStatusMutation,
    useDeleteRoomMutation,
} from "@/hooks/use-partner-queries";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomAvailabilityManager } from "@/components/partner/hotels/room-availability-manager";

export default function RoomTypeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const partnerId = user?.partnerId;
    const hotelId = params.id as string;
    const roomTypeId = params.roomId as string;

    const { data: room, isLoading, isError } = useRoomTypeQuery(partnerId ?? "", roomTypeId);
    const toggleMutation = useToggleRoomStatusMutation(partnerId ?? "", hotelId);
    const deleteMutation = useDeleteRoomMutation(partnerId ?? "", hotelId);

    const isActioning = toggleMutation.isPending || deleteMutation.isPending;

    function handleSuspend() {
        toggleMutation.mutate(
            { roomTypeId, status: "SUSPENDED" },
            {
                onSuccess: () => toast.warning("Le type de chambre a été suspendu."),
                onError: () => toast.error("Impossible de suspendre ce type de chambre."),
            }
        );
    }

    function handleActivate() {
        toggleMutation.mutate(
            { roomTypeId, status: "ACTIVE" },
            {
                onSuccess: () => toast.success("Le type de chambre est à présent actif."),
                onError: () => toast.error("Erreur lors de l'activation."),
            }
        );
    }

    function handleDelete() {
        if (!window.confirm("Supprimer définitivement ce type de chambre ?")) return;
        deleteMutation.mutate(roomTypeId, {
            onSuccess: () => {
                toast.info("Type de chambre supprimé.");
                router.push(`/partner/listings/hotels/${hotelId}/rooms`);
            },
            onError: () => toast.error("Erreur lors de la suppression."),
        });
    }

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                <Skeleton className="h-8 w-48 rounded-xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    if (isError || !room) {
        return (
            <div className="max-w-md mx-auto my-12 text-center space-y-4">
                <div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                    <XCircle className="size-6" />
                </div>
                <h2 className="text-lg font-bold">Type de chambre introuvable</h2>
                <p className="text-xs text-muted-foreground">
                    Ce type de chambre n'existe pas ou a été supprimé.
                </p>
                <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-bold">
                    <Link href={`/partner/listings/hotels/${hotelId}/rooms`}>
                        <ArrowLeft className="size-4 mr-1.5" />
                        Retour à la liste
                    </Link>
                </Button>
            </div>
        );
    }

    const isActive = room.status === "ACTIVE";

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Navigation & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" asChild className="size-8 rounded-xl border-border/60">
                            <Link href={`/partner/listings/hotels/${hotelId}/rooms`}>
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <span className="text-xs font-semibold text-muted-foreground">Fiche du type de chambre</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black tracking-tight">{room.name}</h1>
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

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild className="rounded-xl text-xs font-bold h-9 gap-1.5">
                        <Link href={`/partner/listings/hotels/${hotelId}/rooms/${roomTypeId}/edit`}>
                            <Pencil className="size-3.5" />
                            Modifier
                        </Link>
                    </Button>

                    {isActive ? (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isActioning}
                            onClick={handleSuspend}
                            className="rounded-xl text-xs font-bold h-9 gap-1.5"
                        >
                            {toggleMutation.isPending ? (
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
                            {toggleMutation.isPending ? (
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

            {/* Banner résumé */}
            <Card className="rounded-2xl border-border/60 shadow-xs bg-linear-to-br from-card to-muted/30 overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-around gap-6 text-center">
                        <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Prix de base
              </span>
                            <div className="text-2xl font-black text-primary">
                                {room.basePrice} {room.currency}
                            </div>
                            <p className="text-[11px] text-muted-foreground">par nuit</p>
                        </div>

                        <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
                <Users className="size-3" /> Capacité
              </span>
                            <div className="text-2xl font-black text-foreground">
                                {room.maxAdults + room.maxChildren}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                {room.maxAdults} adulte(s), {room.maxChildren} enfant(s)
                            </p>
                        </div>

                        <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
                <Bed className="size-3" /> Chambres
              </span>
                            <div className="text-2xl font-black text-foreground">{room.totalRooms}</div>
                            <p className="text-[11px] text-muted-foreground">unités physiques</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Spécifications */}
            <Card className="rounded-2xl border-border/60 shadow-xs">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <ShieldCheck className="size-4 text-primary" />
                        Spécifications
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                        <span className="text-muted-foreground font-medium">Identifiant interne</span>
                        <span className="font-mono font-bold text-foreground">{room.id}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-border/40">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Bed className="size-3.5" /> Type de lit
            </span>
                        <span className="font-semibold text-foreground">{room.bedType ?? "—"}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-border/40">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Ruler className="size-3.5" /> Superficie
            </span>
                        <span className="font-semibold text-foreground">
              {room.sizeSqm ? `${room.sizeSqm} m²` : "—"}
            </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                        <span className="text-muted-foreground font-medium">Statut</span>
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

            {/* Disponibilité */}
            <RoomAvailabilityManager partnerId={partnerId ?? ""} roomTypeId={roomTypeId} />
        </div>
    );
}