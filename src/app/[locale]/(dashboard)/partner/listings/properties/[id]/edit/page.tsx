"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
    ArrowLeft,
    Check,
    Loader2,
    Building2,
    Images,
} from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useAuth } from "@/context/auth-context";
import { usePropertyQuery, useUpdatePropertyMutation } from "@/hooks/use-partner-queries";
import { CityAutocompleteInput } from "@/components/partner/city-autocomplete-input";
import { cn } from "@/lib/utils";
import { PROPERTY_AMENITIES, PropertyFormData, PropertyType } from "@/lib/api/types";

interface LocalPropertyFormState extends Omit<PropertyFormData, "pricePerNight"> {
    pricePerNight: number | "";
}

interface PageProps {
    params: Promise<{
        locale: string;
        id: string;
    }>;
}

export default function EditPropertyPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const partnerId = user?.partnerId ?? "";

    const { data: property, isLoading } = usePropertyQuery(partnerId, id);
    const updatePropertyMutation = useUpdatePropertyMutation(partnerId, id);

    const [form, setForm] = useState<LocalPropertyFormState | null>(null);

    useEffect(() => {
        if (!property) return;
        setForm({
            title: property.title,
            propertyType: property.propertyType,
            address: property.address,
            city: property.city,
            country: property.country,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            maxGuests: property.maxGuests,
            amenities: property.amenities,
            pricePerNight: property.pricePerNight,
            currency: property.currency,
            minStayNights: property.minStayNights,
            description: property.description ?? "",
        });
    }, [property]);

    const isSubmitting = updatePropertyMutation.isPending;

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value, type } = e.target;
        setForm((prev) =>
            prev
                ? {
                      ...prev,
                      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
                  }
                : prev
        );
    }

    function handleSelectChange(name: keyof LocalPropertyFormState, value: string) {
        setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    }

    function handleCityCountryChange(city: string, country: string) {
        setForm((prev) => (prev ? { ...prev, city, country } : prev));
    }

    function toggleAmenity(amenityId: string) {
        setForm((prev) =>
            prev
                ? {
                      ...prev,
                      amenities: prev.amenities.includes(amenityId)
                          ? prev.amenities.filter((item) => item !== amenityId)
                          : [...prev.amenities, amenityId],
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

        if (!form.pricePerNight || Number(form.pricePerNight) <= 0) {
            toast.error("Veuillez indiquer un prix par nuit valide.");
            return;
        }

        const payload: PropertyFormData = {
            ...form,
            pricePerNight: Number(form.pricePerNight) || 0,
            bedrooms: Number(form.bedrooms) || 0,
            bathrooms: Number(form.bathrooms) || 1,
            maxGuests: Number(form.maxGuests) || 1,
            minStayNights: Number(form.minStayNights) || 1,
        };

        try {
            await updatePropertyMutation.mutateAsync(payload);
            toast.success("Logement mis à jour avec succès !");
            router.push("/partner/listings");
        } catch (error) {
            console.error("Erreur lors de la mise à jour du logement:", error);
            const message =
                axios.isAxiosError(error) && typeof error.response?.data?.message === "string"
                    ? error.response.data.message
                    : "Impossible de mettre à jour le logement pour le moment.";
            toast.error(message);
        }
    }

    if (isLoading || !form) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-24 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                Chargement du logement...
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl space-y-8 py-6 px-4">
            {/* En-tête */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="mb-2 gap-1.5 text-muted-foreground hover:text-foreground rounded-xl"
                    >
                        <ArrowLeft className="size-4" />
                        Retour aux hébergements
                    </Button>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                        <Building2 className="size-6 text-primary" />
                        Modifier le logement
                    </h1>
                    <p className="text-xs font-semibold text-muted-foreground mt-1">
                        ID : <span className="font-mono text-foreground">{id}</span>
                    </p>
                </div>

                <Button variant="outline" size="sm" asChild className="rounded-xl font-bold text-xs h-9 gap-2">
                    <Link href={`/partner/listings/properties/${id}/images`}>
                        <Images className="size-4" />
                        Gérer les photos
                    </Link>
                </Button>
            </div>

            <Card className="border border-border/60 shadow-sm rounded-2xl overflow-hidden bg-card">
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-xs font-bold">
                                Titre de l&apos;annonce *
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                required
                                value={form.title}
                                onChange={handleChange}
                                className="rounded-xl text-xs h-10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="propertyType" className="text-xs font-bold">
                                Type d&apos;hébergement *
                            </Label>
                            <Select
                                value={form.propertyType}
                                onValueChange={(val) => handleSelectChange("propertyType", val as PropertyType)}
                            >
                                <SelectTrigger id="propertyType" className="rounded-xl text-xs h-10">
                                    <SelectValue placeholder="Sélectionnez le type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="APARTMENT">Appartement</SelectItem>
                                    <SelectItem value="HOUSE">Maison</SelectItem>
                                    <SelectItem value="VILLA">Villa</SelectItem>
                                    <SelectItem value="STUDIO">Studio</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-bold">
                                Description du logement
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={5}
                                className="rounded-xl text-xs resize-none"
                                maxLength={2000}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-xs font-bold">
                                Adresse ou Quartier *
                            </Label>
                            <Input
                                id="address"
                                name="address"
                                required
                                value={form.address}
                                onChange={handleChange}
                                className="rounded-xl text-xs h-10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold">Ville *</Label>
                            <CityAutocompleteInput
                                cityValue={form.city}
                                countryValue={form.country}
                                onSelectCity={handleCityCountryChange}
                                className="rounded-xl text-xs h-10"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="bedrooms" className="text-xs font-bold">
                                    Chambres
                                </Label>
                                <Input
                                    id="bedrooms"
                                    name="bedrooms"
                                    type="number"
                                    min={0}
                                    value={form.bedrooms}
                                    onChange={handleChange}
                                    className="rounded-xl text-xs h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bathrooms" className="text-xs font-bold">
                                    Salles de bain
                                </Label>
                                <Input
                                    id="bathrooms"
                                    name="bathrooms"
                                    type="number"
                                    min={1}
                                    value={form.bathrooms}
                                    onChange={handleChange}
                                    className="rounded-xl text-xs h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="maxGuests" className="text-xs font-bold">
                                    Max. Hôtes
                                </Label>
                                <Input
                                    id="maxGuests"
                                    name="maxGuests"
                                    type="number"
                                    min={1}
                                    value={form.maxGuests}
                                    onChange={handleChange}
                                    className="rounded-xl text-xs h-10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2 space-y-2">
                                <Label htmlFor="pricePerNight" className="text-xs font-bold">
                                    Prix par nuit *
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="pricePerNight"
                                        name="pricePerNight"
                                        type="number"
                                        min={0}
                                        required
                                        value={form.pricePerNight}
                                        onChange={handleChange}
                                        className="rounded-xl text-xs h-10 flex-1"
                                    />
                                    <Select
                                        value={form.currency}
                                        onValueChange={(val) => handleSelectChange("currency", val)}
                                    >
                                        <SelectTrigger className="w-24 rounded-xl text-xs h-10">
                                            <SelectValue placeholder="Devise" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="XAF">XAF</SelectItem>
                                            <SelectItem value="EUR">EUR (€)</SelectItem>
                                            <SelectItem value="USD">USD ($)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="minStayNights" className="text-xs font-bold">
                                    Séjour min (nuits)
                                </Label>
                                <Input
                                    id="minStayNights"
                                    name="minStayNights"
                                    type="number"
                                    min={1}
                                    value={form.minStayNights}
                                    onChange={handleChange}
                                    className="rounded-xl text-xs h-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xs font-bold">Équipements inclus</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                                {PROPERTY_AMENITIES.map((amenity) => {
                                    const isSelected = form.amenities.includes(amenity.id);
                                    return (
                                        <button
                                            key={amenity.id}
                                            type="button"
                                            onClick={() => toggleAmenity(amenity.id)}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all text-left",
                                                isSelected
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-border/60 hover:bg-muted/50 text-muted-foreground"
                                            )}
                                        >
                                            <span>{amenity.label}</span>
                                            {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                                        </button>
                                    );
                                })}
                            </div>
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
