"use client";

import React, { useState } from "react";
import {
    Plane,
    Building2,
    RefreshCw,
    CheckCircle2,
    Clock,
    AlertCircle,
    Database,
    ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import {useSyncAirportsMutation, useSyncCitiesMutation} from "../../../../../../hooks/use-admin";

export default function GeoSyncAdminPage() {
    // États locaux pour conserver le dernier résultat de synchronisation
    const [airportsSyncedCount, setAirportsSyncedCount] = useState<number | null>(null);
    const [citiesSyncedCount, setCitiesSyncedCount] = useState<number | null>(null);

    // Mutations React Query issues de nos hooks personnalisés
    const syncAirportsMutation = useSyncAirportsMutation();
    const syncCitiesMutation = useSyncCitiesMutation();

    // Handlers avec callbacks success/error
    const handleSyncAirports = () => {
        syncAirportsMutation.mutate(undefined, {
            onSuccess: (data) => {
                setAirportsSyncedCount(data.synced);
                toast.success(`Synchronisation terminée : ${data.synced} aéroports mis à jour.`);
            },
            onError: (error) => {
                console.error("Erreur sync aéroports:", error);
                toast.error("Échec de la synchronisation des aéroports.");
            },
        });
    };

    const handleSyncCities = () => {
        syncCitiesMutation.mutate(undefined, {
            onSuccess: (data) => {
                setCitiesSyncedCount(data.synced);
                toast.success(`Synchronisation terminée : ${data.synced} villes mises à jour.`);
            },
            onError: (error) => {
                console.error("Erreur sync villes:", error);
                toast.error("Échec de la synchronisation des villes.");
            },
        });
    };

    const isGlobalSyncing = syncAirportsMutation.isPending || syncCitiesMutation.isPending;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* Header & Fil d'ariane */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            asChild
                            className="size-8 rounded-xl border-border/60"
                        >
                            <Link href="/admin">
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <span className="text-xs font-semibold text-muted-foreground">
                            Administration Système
                        </span>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <Database className="size-6 text-primary" />
                        Données Référentielles Géo
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-semibold py-1">
                        <Clock className="size-3.5 mr-1" />
                        Auto-Sync 30j
                    </Badge>
                </div>
            </div>

            {/* Information Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
                <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                    La mise à jour de la base de données géo s'effectue automatiquement tous les 30 jours.
                    Utilisez les actions ci-dessous pour **forcer un rechargement immédiat** des référentiels d'aéroports et de villes depuis les fournisseurs externes.
                </p>
            </div>

            {/* Grille des Cartes de Synchronisation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CARTE : Aéroports */}
                <Card className="rounded-2xl border-border/60 shadow-xs flex flex-col justify-between">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Plane className="size-5" />
                            </div>
                            {airportsSyncedCount !== null && (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-bold">
                                    <CheckCircle2 className="size-3 mr-1" />
                                    {airportsSyncedCount} éléments
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-base font-bold mt-3">
                            Référentiel Aéroports
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Met à jour les codes IATA, noms d'aéroports, villes rattachées et positions géographiques.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                        <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-xs text-muted-foreground font-mono">
                            POST /api/admin/geo/airports/sync
                        </div>

                        <Button
                            className="w-full rounded-xl font-bold text-xs h-10 gap-2"
                            onClick={handleSyncAirports}
                            disabled={isGlobalSyncing}
                        >
                            <RefreshCw
                                className={`size-4 ${syncAirportsMutation.isPending ? "animate-spin" : ""}`}
                            />
                            {syncAirportsMutation.isPending
                                ? "Synchronisation en cours..."
                                : "Synchroniser les aéroports"}
                        </Button>
                    </CardContent>
                </Card>

                {/* CARTE : Villes & Hôtels */}
                <Card className="rounded-2xl border-border/60 shadow-xs flex flex-col justify-between">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="size-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
                                <Building2 className="size-5" />
                            </div>
                            {citiesSyncedCount !== null && (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-bold">
                                    <CheckCircle2 className="size-3 mr-1" />
                                    {citiesSyncedCount} éléments
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-base font-bold mt-3">
                            Référentiel Villes & Destinations
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Recharge la liste des villes éligibles aux réservations d'hôtels et destinations touristiques.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                        <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-xs text-muted-foreground font-mono">
                            POST /api/admin/geo/cities/sync
                        </div>

                        <Button
                            className="w-full rounded-xl font-bold text-xs h-10 gap-2"
                            variant="secondary"
                            onClick={handleSyncCities}
                            disabled={isGlobalSyncing}
                        >
                            <RefreshCw
                                className={`size-4 ${syncCitiesMutation.isPending ? "animate-spin" : ""}`}
                            />
                            {syncCitiesMutation.isPending
                                ? "Synchronisation en cours..."
                                : "Synchroniser les villes"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}