"use client";

import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Bed,
    Bath,
    Users,
    Ban,
    Play,
    Trash2,
    Loader2,
    Pencil,
    Images,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    MapPin,
} from "lucide-react";
import { toast } from "sonner";

import {
    usePropertyQuery,
    useSuspendPropertyMutation,
    useActivatePropertyMutation,
    useDeletePropertyMutation,
} from "@/hooks/use-partner-queries";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyAvailabilityManager } from "@/components/partner/properties/property-availability-manager";
import { PROPERTY_AMENITIES } from "@/lib/api/types";

export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const partnerId = user?.partnerId;
    const propertyId = params.id as string;

    const { data: property, isLoading, isError } = usePropertyQuery(partnerId ?? "", propertyId);
    const suspendMutation = useSuspendPropertyMutation(partnerId ?? "");
    const activateMutation = useActivatePropertyMutation(partnerId ?? "");
    const deleteMutation = useDeletePropertyMutation(partnerId ?? "");

    const isActioning = suspendMutation.isPending || activateMutation.isPending || deleteMutation.isPending;

    function handleSuspend() {
        suspendMutation.mutate(propertyId, {
            onSuccess: () => toast.warning("Le logement a été suspendu."),
            onError: () => toast.error("Impossible de suspendre ce logement."),
        });
    }

    function handleActivate() {
        activateMutation.mutate(propertyId, {
            onSuccess: () => toast.success("Le logement est à présent actif."),
            onError: () => toast.error("Erreur lors de l'activation."),
        });
    }

    function handleDelete() {
        if (!window.confirm("Supprimer définitivement ce logement ?")) return;
        deleteMutation.mutate(propertyId, {
            onSuccess: () => {
                toast.info("Logement supprimé.");
                router.push("/partner/listings");
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

    if (isError || !property) {
        return (
            <div className="max-w-md mx-auto my-12 text-center space-y-4">
                <div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                    <XCircle className="size-6" />
                </div>
                <h2 className="text-lg font-bold">Logement introuvable</h2>
                <p className="text-xs text-muted-foreground">
                    Ce logement n&apos;existe pas ou a été supprimé.
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

    const isActive = property.status === "ACTIVE";
    const amenityLabels = property.amenities.map(
        (id) => PROPERTY_AMENITIES.find((a) => a.id === id)?.label ?? id
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Navigation & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" asChild className="size-8 rounded-xl border-border/60">
                            <Link href="/partner/listings">
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <span className="text-xs font-semibold text-muted-foreground">Fiche du logement</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black tracking-tight">{property.title}</h1>
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
                        <Link href={`/partner/listings/properties/${propertyId}/images`}>
                            <Images className="size-3.5" />
                            Photos
                        </Link>
                    </Button>

                    <Button variant="outline" size="sm" asChild className="rounded-xl text-xs font-bold h-9 gap-1.5">
                        <Link href={`/partner/listings/properties/${propertyId}/edit`}>
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

            {/* Banner résumé */}
            <Card className="rounded-2xl border-border/60 shadow-xs bg-linear-to-br from-card to-muted/30 overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-around gap-6 text-center">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Prix
                            </span>
                            <div className="text-2xl font-black text-primary">
                                {property.pricePerNight} {property.currency}
                            </div>
                            <p className="text-[11px] text-muted-foreground">par nuit</p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
                                <Users className="size-3" /> Capacité
                            </span>
                            <div className="text-2xl font-black text-foreground">{property.maxGuests}</div>
                            <p className="text-[11px] text-muted-foreground">personne(s) max</p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
                                <Bed className="size-3" /> Chambres
                            </span>
                            <div className="text-2xl font-black text-foreground">{property.bedrooms}</div>
                            <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                                <Bath className="size-3" /> {property.bathrooms} salle(s) de bain
                            </p>
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
                        <span className="font-mono font-bold text-foreground">{property.id}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                        <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                            <MapPin className="size-3.5" /> Adresse
                        </span>
                        <span className="font-semibold text-foreground text-right">
                            {property.address}, {property.city}, {property.country}
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                        <span className="text-muted-foreground font-medium">Type de logement</span>
                        <span className="font-semibold text-foreground">{property.propertyType}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                        <span className="text-muted-foreground font-medium">Séjour minimum</span>
                        <span className="font-semibold text-foreground">
                            {property.minStayNights} nuit(s)
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

                    {property.description && (
                        <div className="pt-2">
                            <span className="text-muted-foreground font-medium block mb-1.5">Description</span>
                            <p className="text-foreground leading-relaxed">{property.description}</p>
                        </div>
                    )}

                    {amenityLabels.length > 0 && (
                        <div className="pt-3">
                            <span className="text-muted-foreground font-medium block mb-1.5">Équipements</span>
                            <div className="flex flex-wrap gap-1.5">
                                {amenityLabels.map((label) => (
                                    <Badge key={label} variant="secondary" className="rounded-lg text-[10px] font-bold">
                                        {label}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Disponibilité */}
            <PropertyAvailabilityManager partnerId={partnerId ?? ""} propertyId={propertyId} />
        </div>
    );
}
