"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ChevronLeft, Check, Loader2, Car } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PickupLocationsInput } from "@/components/partner/pickup-locations-input";

import { useAuth } from "@/context/auth-context";
import { useUpdateVehicleMutation, useVehicleQuery } from "@/hooks/use-partner-queries";
import type { Transmission, VehicleCategory, VehicleRegistrationRequest } from "@/lib/api/types";

const CATEGORY_LABELS: Record<VehicleCategory, string> = {
    ECONOMY: "Économique",
    COMPACT: "Compacte",
    SUV: "SUV",
    LUXURY: "Luxe",
    VAN: "Van",
    MINIBUS: "Minibus",
};

const TRANSMISSION_LABELS: Record<Transmission, string> = {
    MANUAL: "Manuelle",
    AUTOMATIC: "Automatique",
};

interface PageProps {
    params: Promise<{
        locale: string;
        id: string;
    }>;
}

export default function EditVehiclePage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const partnerId = user?.partnerId ?? "";

    const { data: vehicle, isLoading } = useVehicleQuery(partnerId, id);
    const updateVehicleMutation = useUpdateVehicleMutation(partnerId, id);

    const [form, setForm] = useState<VehicleRegistrationRequest | null>(null);

    useEffect(() => {
        if (!vehicle) return;
        setForm({
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            category: vehicle.category,
            transmission: vehicle.transmission,
            seats: vehicle.seats,
            airConditioning: vehicle.airConditioning,
            pricePerDay: vehicle.pricePerDay,
            currency: vehicle.currency,
            unitsCount: vehicle.unitsCount,
            pickupLocations: vehicle.pickupLocations,
        });
    }, [vehicle]);

    const isSubmitting = updateVehicleMutation.isPending;

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value, type } = e.target;
        setForm((prev) =>
            prev
                ? {
                      ...prev,
                      [name]: type === "number" ? Number(value) || 0 : value,
                  }
                : prev
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!partnerId || !form) {
            toast.error("Identifiant partenaire introuvable. Veuillez vous reconnecter.");
            return;
        }

        if (form.pickupLocations.length === 0) {
            toast.error("Ajoutez au moins une ville de prise en charge.");
            return;
        }

        try {
            await updateVehicleMutation.mutateAsync(form);
            toast.success("Véhicule mis à jour avec succès !");
            router.push("/partner/listings");
        } catch (error) {
            console.error("Erreur lors de la mise à jour du véhicule:", error);
            const message =
                axios.isAxiosError(error) && typeof error.response?.data?.message === "string"
                    ? error.response.data.message
                    : "Une erreur est survenue lors de la mise à jour du véhicule.";
            toast.error(message);
        }
    }

    if (isLoading || !form) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-24 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                Chargement du véhicule...
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl space-y-8 py-6 px-4">
            {/* En-tête */}
            <div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="mb-2 gap-1.5 text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="size-4" />
                    Retour aux véhicules
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Car className="size-6 text-primary" />
                    Modifier le véhicule
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Mettez à jour les informations de votre véhicule.
                </p>
            </div>

            {/* Formulaire */}
            <Card className="border shadow-sm">
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="brand">Marque *</Label>
                                <Input
                                    id="brand"
                                    name="brand"
                                    placeholder="ex: Toyota"
                                    required
                                    value={form.brand}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="model">Modèle *</Label>
                                <Input
                                    id="model"
                                    name="model"
                                    placeholder="ex: Corolla"
                                    required
                                    value={form.model}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="year">Année *</Label>
                                <Input
                                    id="year"
                                    name="year"
                                    type="number"
                                    min={1990}
                                    max={new Date().getFullYear() + 1}
                                    required
                                    value={form.year}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="seats">Nombre de places *</Label>
                                <Input
                                    id="seats"
                                    name="seats"
                                    type="number"
                                    min={1}
                                    required
                                    value={form.seats}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unitsCount">Véhicules disponibles *</Label>
                                <Input
                                    id="unitsCount"
                                    name="unitsCount"
                                    type="number"
                                    min={1}
                                    required
                                    value={form.unitsCount}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="category">Catégorie *</Label>
                                <Select
                                    value={form.category}
                                    onValueChange={(val) =>
                                        setForm((prev) => (prev ? { ...prev, category: val as VehicleCategory } : prev))
                                    }
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(Object.keys(CATEGORY_LABELS) as VehicleCategory[]).map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {CATEGORY_LABELS[category]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="transmission">Transmission *</Label>
                                <Select
                                    value={form.transmission}
                                    onValueChange={(val) =>
                                        setForm((prev) => (prev ? { ...prev, transmission: val as Transmission } : prev))
                                    }
                                >
                                    <SelectTrigger id="transmission">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(Object.keys(TRANSMISSION_LABELS) as Transmission[]).map((transmission) => (
                                            <SelectItem key={transmission} value={transmission}>
                                                {TRANSMISSION_LABELS[transmission]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="airConditioning">Climatisation</Label>
                                <p className="text-xs text-muted-foreground">
                                    Le véhicule est-il équipé de la climatisation ?
                                </p>
                            </div>
                            <Switch
                                id="airConditioning"
                                checked={form.airConditioning}
                                onCheckedChange={(checked) =>
                                    setForm((prev) => (prev ? { ...prev, airConditioning: checked } : prev))
                                }
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="pricePerDay">Prix par jour *</Label>
                                <Input
                                    id="pricePerDay"
                                    name="pricePerDay"
                                    type="number"
                                    min={0}
                                    step="any"
                                    required
                                    value={form.pricePerDay}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currency">Devise *</Label>
                                <Input
                                    id="currency"
                                    name="currency"
                                    placeholder="XAF"
                                    required
                                    value={form.currency}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Villes de prise en charge *</Label>
                            <p className="text-xs text-muted-foreground">
                                Les villes où vos clients pourront récupérer ce véhicule.
                            </p>
                            <PickupLocationsInput
                                value={form.pickupLocations}
                                onChange={(pickupLocations) =>
                                    setForm((prev) => (prev ? { ...prev, pickupLocations } : prev))
                                }
                            />
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-end pt-4 border-t">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        Enregistrer les modifications
                                        <Check className="size-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
