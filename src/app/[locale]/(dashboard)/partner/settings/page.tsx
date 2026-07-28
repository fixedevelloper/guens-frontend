"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { usePartnerQuery, useUpdatePartnerMutation } from "@/hooks/use-partner-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface FormState {
    companyName: string;
    contactName: string;
    phone: string;
    city: string;
    country: string;
    fleetOrRoomsCount: string;
    description: string;
    logoUrl: string;
}

export default function PartnerSettingsPage() {
    const { user } = useAuth();
    const partnerId = user?.partnerId;

    // 1. Récupération des données du partenaire via React Query
    const { data: partner, isLoading, isError } = usePartnerQuery(partnerId);
    const updateMutation = useUpdatePartnerMutation();

    const [form, setForm] = useState<FormState>({
        companyName: "",
        contactName: "",
        phone: "",
        city: "",
        country: "",
        fleetOrRoomsCount: "",
        description: "",
        logoUrl: "",
    });

    // 2. Synchronisation du formulaire avec les données chargées
    useEffect(() => {
        if (partner) {
            setForm({
                companyName: partner.companyName ?? "",
                contactName: partner.contactName ?? "",
                phone: partner.phone ?? "",
                city: partner.city ?? "",
                country: partner.country ?? "",
                fleetOrRoomsCount:
                    partner.fleetOrRoomsCount?.toString() ??
                    "",
                description: partner.description ?? "",
                logoUrl: partner.contactName ?? "",
            });
        }
    }, [partner]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { id, value } = e.target;
        setForm((prev) => ({ ...prev, [id]: value }));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!partnerId) {
            toast.error("Identifiant du partenaire introuvable.");
            return;
        }

        updateMutation.mutate(
            { partnerId, data: form },
            {
                onSuccess: () => {
                    toast.success("Paramètres mis à jour avec succès");
                },
                onError: (error) => {
                    const message =
                        error instanceof Error
                            ? error.message
                            : "Erreur lors de la mise à jour des paramètres";
                    toast.error(message);
                    console.error(error);
                },
            }
        );
    }

    if (isLoading) {
        return <PartnerSettingsSkeleton />;
    }

    if (isError || !partner) {
        return (
            <div className="p-4 text-sm text-red-500 rounded-md bg-red-50 dark:bg-red-950/30">
                Impossible de charger les informations du partenaire.
            </div>
        );
    }

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Paramètres du compte</h2>
                    <p className="text-sm text-muted-foreground">
                        Gérez les informations de votre entreprise et vos coordonnées de contact.
                    </p>
                </div>
                {partner.partnerType && (
                    <Badge variant="outline" className="text-xs uppercase font-semibold">
                        {partner.partnerType}
                    </Badge>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Légal / Immuable */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="registrationNumber">N° d'immatriculation (RCCM/NIF)</Label>
                        <Input
                            id="registrationNumber"
                            value={partner.registrationNumber ?? ""}
                            disabled
                            className="bg-muted text-muted-foreground cursor-not-allowed"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Adresse Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={partner.email ?? ""}
                            disabled
                            className="bg-muted text-muted-foreground cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Informations entreprise & contact principal */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="companyName">Nom de l'entreprise</Label>
                        <Input
                            id="companyName"
                            value={form.companyName}
                            onChange={handleChange}
                            placeholder="Ex: GuenTours SARL"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contactName">Nom du responsable / contact</Label>
                        <Input
                            id="contactName"
                            value={form.contactName}
                            onChange={handleChange}
                            placeholder="Ex: Jean Dupont"
                            required
                        />
                    </div>
                </div>

                {/* Coordonnées & Capacité */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="+237 6..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">Ville</Label>
                        <Input
                            id="city"
                            value={form.city}
                            onChange={handleChange}
                            placeholder="Ex: Douala"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="country">Pays</Label>
                        <Input
                            id="country"
                            value={form.country}
                            onChange={handleChange}
                            placeholder="Ex: Cameroun"
                            required
                        />
                    </div>
                </div>

                {/* Capacité / Flotte */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="fleetOrRoomsCount">Taille de la flotte / Nombre de chambres</Label>
                        <Input
                            id="fleetOrRoomsCount"
                            type="number"
                            min="0"
                            value={form.fleetOrRoomsCount}
                            onChange={handleChange}
                            placeholder="Ex: 12"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="logoUrl">URL du Logo (Optionnel)</Label>
                        <Input
                            id="logoUrl"
                            type="url"
                            value={form.logoUrl}
                            onChange={handleChange}
                            placeholder="https://..."
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description">Description de l'activité</Label>
                    <Textarea
                        id="description"
                        rows={4}
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Présentez brièvement vos services et vos atouts..."
                    />
                </div>

                <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Enregistrement…" : "Enregistrer les modifications"}
                </Button>
            </form>
        </div>
    );
}

function PartnerSettingsSkeleton() {
    return (
        <div className="max-w-2xl space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96" />
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-36" />
            </div>
        </div>
    );
}