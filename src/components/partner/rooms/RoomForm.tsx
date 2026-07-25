"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Save, Bed, Check, Image as ImageIcon, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageSelectModal } from "@/components/partner/media/ImageSelectModal";
import { UserImage } from "../../../types/hotel-form";

// Aligné sur le Record DTO Java : RoomTypeRequest
export interface RoomTypeRequestPayload {
    name: string;
    maxAdults: number;
    maxChildren: number;
    bedType: string;
    sizeSqm?: number | null;
    basePrice: number;
    currency: string;
    totalRooms: number;
    coverImageUrl?: string | null;
}

export interface RoomFormData {
    name: string;
    description: string;
    basePrice: number;
    currency: string;
    totalRooms: number;
    bedType: string;
    maxAdults: number;
    maxChildren: number;
    sizeSqm?: number;
    coverImageUrl: string;
    amenities: string[];
}

const COMMON_AMENITIES = [
    "Wifi haut débit",
    "Climatisation",
    "Télévision 4K",
    "Insonorisation",
    "Minibar",
    "Coffre-fort",
    "Balcon / Vue",
    "Baignoire",
    "Sèche-cheveux",
    "Espace de travail",
];

interface RoomFormProps {
    hotelId: string;
    initialData?: Partial<RoomFormData>;
    isEditing?: boolean;
    onSubmit: (payload: RoomTypeRequestPayload) => Promise<void>;
}

export function RoomForm({ hotelId, initialData, isEditing = false, onSubmit }: RoomFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [form, setForm] = useState<RoomFormData>({
        name: initialData?.name ?? "",
        description: initialData?.description ?? "",
        basePrice: initialData?.basePrice ?? 25000,
        currency: initialData?.currency ?? "XAF",
        totalRooms: initialData?.totalRooms ?? 1,
        bedType: initialData?.bedType ?? "1 Lit King Size",
        maxAdults: initialData?.maxAdults ?? 2,
        maxChildren: initialData?.maxChildren ?? 0,
        sizeSqm: initialData?.sizeSqm ?? 25,
        coverImageUrl: initialData?.coverImageUrl ?? "",
        amenities: initialData?.amenities ?? ["Wifi haut débit", "Climatisation"],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Sélection d'une image depuis la galerie/modal
    const handleSelectImage = (image: UserImage) => {
        setForm((prev) => ({ ...prev, coverImageUrl: image.url }));
        setIsModalOpen(false);
    };

    // Suppression de l'image de couverture
    const handleRemoveImage = () => {
        setForm((prev) => ({ ...prev, coverImageUrl: "" }));
    };

    const toggleAmenity = (item: string) => {
        setForm((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(item)
                ? prev.amenities.filter((a) => a !== item)
                : [...prev.amenities, item],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Payload DTO Spring Boot
        const payload: RoomTypeRequestPayload = {
            name: form.name.trim(),
            maxAdults: Number(form.maxAdults),
            maxChildren: Number(form.maxChildren),
            bedType: form.bedType.trim(),
            sizeSqm: form.sizeSqm ? Number(form.sizeSqm) : null,
            basePrice: Number(form.basePrice),
            currency: form.currency || "XAF",
            totalRooms: Number(form.totalRooms),
            coverImageUrl: form.coverImageUrl.trim() ? form.coverImageUrl.trim() : null,
        };

        try {
            await onSubmit(payload);
            toast.success(isEditing ? "Chambre mise à jour !" : "Chambre ajoutée avec succès !");
            router.push(`/partner/listings/hotels/${hotelId}/rooms`);
        } catch (error: any) {
            console.error("Erreur d'enregistrement:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto py-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="mb-2 gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="size-4" />
                        Retour aux chambres
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEditing ? "Modifier le type de chambre" : "Ajouter une nouvelle chambre"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Renseignez les caractéristiques, tarifs et médias de la chambre.
                    </p>
                </div>
            </div>

            <Card className="border shadow-sm">
                <CardContent className="pt-6 space-y-6">
                    {/* Informations principales */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Bed className="size-4 text-primary" />
                            Informations générales
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="name">Nom du type de chambre *</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Ex: Suite Deluxe avec vue mer"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Décrivez les atouts de cette chambre..."
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                                className="rounded-xl resize-none"
                            />
                        </div>
                    </div>

                    {/* Tarification, Devise & Quantité */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                        <div className="space-y-2 sm:col-span-1">
                            <Label htmlFor="basePrice">Prix de base par nuit *</Label>
                            <Input
                                id="basePrice"
                                name="basePrice"
                                type="number"
                                min="0"
                                value={form.basePrice}
                                onChange={(e) => setForm((p) => ({ ...p, basePrice: Number(e.target.value) }))}
                                required
                                className="rounded-xl"
                            />
                        </div>

                        <div className="space-y-2 sm:col-span-1">
                            <Label htmlFor="currency">Devise *</Label>
                            <Input
                                id="currency"
                                name="currency"
                                value={form.currency}
                                onChange={handleChange}
                                required
                                placeholder="XAF"
                                className="rounded-xl"
                            />
                        </div>

                        <div className="space-y-2 sm:col-span-1">
                            <Label htmlFor="totalRooms">Nombre total de chambres *</Label>
                            <Input
                                id="totalRooms"
                                name="totalRooms"
                                type="number"
                                min="1"
                                value={form.totalRooms}
                                onChange={(e) => setForm((p) => ({ ...p, totalRooms: Number(e.target.value) }))}
                                required
                                className="rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Literie, Surface & Capacité */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bedType">Type de literie</Label>
                            <Input
                                id="bedType"
                                name="bedType"
                                placeholder="Ex: 1 Lit King Size"
                                value={form.bedType}
                                onChange={handleChange}
                                className="rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sizeSqm">Superficie (m²)</Label>
                            <Input
                                id="sizeSqm"
                                name="sizeSqm"
                                type="number"
                                min="1"
                                value={form.sizeSqm ?? ""}
                                onChange={(e) => setForm((p) => ({ ...p, sizeSqm: Number(e.target.value) }))}
                                placeholder="Ex: 35"
                                className="rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxAdults">Max. Adultes *</Label>
                            <Input
                                id="maxAdults"
                                name="maxAdults"
                                type="number"
                                min="1"
                                value={form.maxAdults}
                                onChange={(e) => setForm((p) => ({ ...p, maxAdults: Number(e.target.value) }))}
                                required
                                className="rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxChildren">Max. Enfants *</Label>
                            <Input
                                id="maxChildren"
                                name="maxChildren"
                                type="number"
                                min="0"
                                value={form.maxChildren}
                                onChange={(e) => setForm((p) => ({ ...p, maxChildren: Number(e.target.value) }))}
                                required
                                className="rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Image de couverture */}
                    <div className="pt-4 border-t">
                        <div className="space-y-2">
                            <Label htmlFor="coverImageUrl" className="flex items-center gap-1.5">
                                <ImageIcon className="size-4 text-muted-foreground" />
                                Image de couverture de la chambre
                            </Label>

                            {form.coverImageUrl ? (
                                <div className="relative aspect-video w-full max-h-56 rounded-2xl overflow-hidden border bg-muted/20 group shadow-sm">
                                    <img
                                        src={form.coverImageUrl}
                                        alt="Couverture de la chambre"
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => setIsModalOpen(true)}
                                            className="gap-1.5 rounded-xl shadow-md"
                                        >
                                            <Edit2 className="size-3.5" />
                                            Changer
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            onClick={handleRemoveImage}
                                            className="gap-1.5 rounded-xl shadow-md"
                                        >
                                            <Trash2 className="size-3.5" />
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Input
                                        id="coverImageUrl"
                                        name="coverImageUrl"
                                        placeholder="https://domaine.com/images/chambre.jpg"
                                        value={form.coverImageUrl}
                                        onChange={handleChange}
                                        className="flex-1 rounded-xl"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsModalOpen(true)}
                                        className="gap-2 shrink-0 rounded-xl border-dashed hover:border-primary hover:bg-primary/5"
                                    >
                                        <ImageIcon className="size-4 text-primary" />
                                        Galerie d'images
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Équipements */}
                    <div className="pt-4 border-t space-y-3">
                        <Label>Équipements inclus</Label>
                        <div className="flex flex-wrap gap-2">
                            {COMMON_AMENITIES.map((amenity) => {
                                const selected = form.amenities.includes(amenity);
                                return (
                                    <Badge
                                        key={amenity}
                                        variant={selected ? "default" : "outline"}
                                        onClick={() => toggleAmenity(amenity)}
                                        className={`cursor-pointer px-3 py-1.5 rounded-xl transition-all ${
                                            selected
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "hover:bg-muted text-muted-foreground"
                                        }`}
                                    >
                                        {selected && <Check className="size-3.5 mr-1" />}
                                        {amenity}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions de validation */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                            className="rounded-xl"
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="gap-2 rounded-xl">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    {isEditing ? "Mettre à jour" : "Créer la chambre"}
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Modal de sélection d'image */}
            <ImageSelectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectImage={handleSelectImage}
                title="Sélectionner la couverture de la chambre"
            />
        </form>
    );
}