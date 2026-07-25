"use client";

import { useState } from "react";
import { Building2, Star, Image as ImageIcon, Edit2, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HotelFormData } from "@/types/hotel-form";
import { ImageSelectModal } from "@/components/partner/media/ImageSelectModal";
import { UserImage } from "@/types/media";

interface StepGeneralInfoProps {
    form: HotelFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onStarChange: (rating: number) => void;
    onCoverImageChange?: (url: string) => void;
}

export function StepGeneralInfo({
                                    form,
                                    onChange,
                                    onStarChange,
                                    onCoverImageChange,
                                }: StepGeneralInfoProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mise à jour de l'URL dans le state global du formulaire
    const handleSelectImage = (image: UserImage) => {
        if (onCoverImageChange) {
            onCoverImageChange(image.url);
        } else {
            // Fallback avec événement synthétique si handler dédié non fourni
            onChange({
                target: { name: "coverImageUrl", value: image.url },
            } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    // Supprimer l'image de couverture
    const handleRemoveImage = () => {
        if (onCoverImageChange) {
            onCoverImageChange("");
        } else {
            onChange({
                target: { name: "coverImageUrl", value: "" },
            } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    return (
        <div className="space-y-5 animate-in fade-in-50 duration-200">
            {/* Titre de l'étape */}
            <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Building2 className="size-5 text-primary" />
                    Informations générales
                </h3>
                <p className="text-xs text-muted-foreground">
                    Identité principale de votre établissement.
                </p>
            </div>

            {/* Nom de l'hôtel */}
            <div className="space-y-2">
                <Label htmlFor="name">Nom de l'hôtel *</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="ex: Le Grand Palais Hôtel"
                    required
                    value={form.name}
                    onChange={onChange}
                />
            </div>

            {/* Étoiles / Classement */}
            <div className="space-y-2">
                <Label>Classement (Étoiles)</Label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((stars) => (
                        <button
                            key={stars}
                            type="button"
                            onClick={() => onStarChange(stars)}
                            className={`flex items-center gap-1 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${
                                form.starRating === stars
                                    ? "border-amber-400 bg-amber-500/10 text-amber-600 ring-2 ring-amber-400/20"
                                    : "border-border hover:bg-muted"
                            }`}
                        >
                            <span>{stars}</span>
                            <Star className="size-4 fill-amber-400 text-amber-400" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Image de couverture avec Modal */}
            <div className="space-y-2">
                <Label htmlFor="coverImageUrl" className="flex items-center gap-1.5">
                    <ImageIcon className="size-4 text-muted-foreground" />
                    Image de couverture de l'établissement
                </Label>

                {form.coverImageUrl ? (
                    /* Aperçu si une image est sélectionnée */
                    <div className="relative aspect-video w-full max-h-56 rounded-2xl overflow-hidden border bg-muted/20 group shadow-sm">
                        <img
                            src={form.coverImageUrl}
                            alt="Couverture de l'hôtel"
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
                    /* Saisie Manuelle ou Bouton Modal si aucune image */
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                            id="coverImageUrl"
                            name="coverImageUrl"
                            placeholder="https://domaine.com/images/hotel.jpg"
                            value={form.coverImageUrl}
                            onChange={onChange}
                            className="flex-1"
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

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description de l'établissement</Label>
                <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    placeholder="Présentez les atouts de votre hôtel, l'ambiance, la proximité des transports..."
                    value={form.description}
                    onChange={onChange}
                />
            </div>

            {/* Modal de sélection d'image */}
            <ImageSelectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectImage={handleSelectImage}
                title="Sélectionner la couverture de l'hôtel"
            />
        </div>
    );
}