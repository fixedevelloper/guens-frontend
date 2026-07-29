"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Check, Loader2, Building2, Images } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useAuth } from "@/context/auth-context";
import { useHotelQuery, useUpdateHotelMutation } from "@/hooks/use-partner-queries";
import { CityAutocompleteInput } from "@/components/partner/city-autocomplete-input";
import { cn } from "@/lib/utils";
import { AMENITIES_OPTIONS, HotelFormData } from "@/types/hotel-form";

interface PageProps {
    params: Promise<{
        locale: string;
        id: string;
    }>;
}

export default function EditHotelPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const partnerId = user?.partnerId ?? "";

    const { data: hotel, isLoading } = useHotelQuery(partnerId, id);
    const updateHotelMutation = useUpdateHotelMutation(partnerId, id);

    const [form, setForm] = useState<HotelFormData | null>(null);

    useEffect(() => {
        if (!hotel) return;
        setForm({
            name: hotel.name,
            starRating: hotel.starRating ?? 3,
            coverImageUrl: hotel.coverImageUrl ?? "",
            description: hotel.description ?? "",
            city: hotel.city,
            country: hotel.country,
            address: hotel.address,
            phone: "",
            email: "",
            checkInTime: hotel.checkInTime ?? "",
            checkOutTime: hotel.checkOutTime ?? "",
            amenities: hotel.amenities,
        });
    }, [hotel]);

    const isSubmitting = updateHotelMutation.isPending;

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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

        try {
            await updateHotelMutation.mutateAsync(form);
            toast.success("Hôtel mis à jour avec succès !");
            router.push("/partner/listings");
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'hôtel:", error);
            const message =
                axios.isAxiosError(error) && typeof error.response?.data?.message === "string"
                    ? error.response.data.message
                    : "Impossible de mettre à jour l'hôtel pour le moment.";
            toast.error(message);
        }
    }

    if (isLoading || !form) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-24 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                Chargement de l&apos;hôtel...
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
                        Retour aux hôtels
                    </Button>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                        <Building2 className="size-6 text-primary" />
                        Modifier l&apos;hôtel
                    </h1>
                    <p className="text-xs font-semibold text-muted-foreground mt-1">
                        ID : <span className="font-mono text-foreground">{id}</span>
                    </p>
                </div>

                <Button variant="outline" size="sm" asChild className="rounded-xl font-bold text-xs h-9 gap-2">
                    <Link href={`/partner/listings/hotels/${id}/images`}>
                        <Images className="size-4" />
                        Gérer les photos
                    </Link>
                </Button>
            </div>

            <Card className="border border-border/60 shadow-sm rounded-2xl overflow-hidden bg-card">
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-bold">
                                Nom de l&apos;établissement *
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                value={form.name}
                                onChange={handleChange}
                                className="rounded-xl text-xs h-10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="starRating" className="text-xs font-bold">
                                Classement (étoiles) *
                            </Label>
                            <Input
                                id="starRating"
                                name="starRating"
                                type="number"
                                min={1}
                                max={5}
                                required
                                value={form.starRating}
                                onChange={handleChange}
                                className="rounded-xl text-xs h-10 w-32"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-bold">
                                Description
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
                                Adresse *
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

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="checkInTime" className="text-xs font-bold">
                                    Heure d&apos;arrivée (check-in)
                                </Label>
                                <Input
                                    id="checkInTime"
                                    name="checkInTime"
                                    type="time"
                                    value={form.checkInTime}
                                    onChange={handleChange}
                                    className="rounded-xl text-xs h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="checkOutTime" className="text-xs font-bold">
                                    Heure de départ (check-out)
                                </Label>
                                <Input
                                    id="checkOutTime"
                                    name="checkOutTime"
                                    type="time"
                                    value={form.checkOutTime}
                                    onChange={handleChange}
                                    className="rounded-xl text-xs h-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xs font-bold">Équipements</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                                {AMENITIES_OPTIONS.map((amenity) => {
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
