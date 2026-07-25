"use client";

import { use, useState } from "react";
import { useTranslations } from "next-intl";
import {
    ArrowLeft,
    UploadCloud,
    Trash2,
    Star,
    Image as ImageIcon,
    Loader2,
    CheckCircle2,
    Images,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {ImageSelectModal} from "../../../../../../../../../../components/partner/media/ImageSelectModal";

export interface RoomImageItem {
    id: string;
    url: string;
    isPrimary: boolean;
    name?: string;
}

interface PageProps {
    params: Promise<{
        locale: string;
        hotelId: string;
        roomId: string;
    }>;
}

export default function RoomImagesPage({ params }: PageProps) {
    const { id, roomId } = use(params);
    const t = useTranslations("RoomImages");

    // État de la modale de sélection de couverture
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [images, setImages] = useState<RoomImageItem[]>([
        {
            id: "1",
            url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
            isPrimary: true,
            name: "lit-principal.jpg",
        },
        {
            id: "2",
            url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
            isPrimary: false,
            name: "salle-de-bain.jpg",
        },
    ]);

    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Callback appelé quand une image est choisie dans la modale
    const handleSelectImage = (selectedImage: { id: string; url: string }) => {
        setImages((prev) => {
            const exists = prev.some((img) => img.id === selectedImage.id);

            if (exists) {
                // Si l'image existe déjà, on la passe simplement en couverture principale
                return prev.map((img) => ({
                    ...img,
                    isPrimary: img.id === selectedImage.id,
                }));
            } else {
                // Si c'est une nouvelle image sélectionnée dans la bibliothèque globale
                return [
                    ...prev.map((img) => ({ ...img, isPrimary: false })),
                    { id: selectedImage.id, url: selectedImage.url, isPrimary: true },
                ];
            }
        });

        setIsModalOpen(false);
    };

    const handleSetPrimary = (id: string) => {
        setImages((prev) =>
            prev.map((img) => ({
                ...img,
                isPrimary: img.id === id,
            }))
        );
    };

    const handleDelete = (id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
    };

    return (
        <div className="space-y-6">
            {/* HEADER & BOUTONS */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" asChild className="rounded-xl size-9 shrink-0">
                        <Link href={`/listings/hotels/${id}`}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-lg font-black tracking-tight sm:text-xl">
                            {t("title") ?? "Galerie d'images de la chambre"}
                        </h1>
                        <p className="text-xs font-semibold text-muted-foreground">
                            ID Chambre : <span className="font-mono text-foreground">{roomId}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* BOUTON POUR OUVRIR LA MODALE DE SÉLECTION */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                        className="rounded-xl font-bold text-xs gap-2 border-border/70 h-9"
                    >
                        <Images className="size-4 text-primary" />
                        <span>Changer la couverture</span>
                    </Button>

                    <Badge variant="outline" className="rounded-lg px-2.5 py-1 text-xs font-bold">
                        {images.length} {images.length > 1 ? "images" : "image"}
                    </Badge>
                </div>
            </div>

            {/* ZONE DROP & UPLOAD */}
            <Card className="border-2 border-dashed border-border/60 hover:border-primary/50 transition-all rounded-2xl bg-card/50">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                        <UploadCloud className="size-6" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                        Glissez vos images ici ou parcourez
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4 font-medium">
                        PNG, JPG ou WEBP jusqu'à 5MB
                    </p>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                        className="rounded-xl font-bold text-xs cursor-pointer h-9 px-4 gap-2"
                    >
                        <ImageIcon className="size-3.5" />
                        Choisir dans la bibliothèque
                    </Button>
                </CardContent>
            </Card>

            {/* GRILLE D'IMAGES */}
            {images.length > 0 && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((img) => (
                            <div
                                key={img.id}
                                className={cn(
                                    "group relative aspect-4/3 rounded-2xl overflow-hidden border bg-slate-100 dark:bg-zinc-900 transition-all",
                                    img.isPrimary
                                        ? "border-primary ring-2 ring-primary/20 shadow-xs"
                                        : "border-border/50 hover:border-border"
                                )}
                            >
                                <img
                                    src={img.url}
                                    alt={img.name ?? "Room photo"}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />

                                {img.isPrimary && (
                                    <Badge className="absolute top-2.5 left-2.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-extrabold gap-1 shadow-md">
                                        <CheckCircle2 className="size-3" />
                                        Couverture
                                    </Badge>
                                )}

                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                    <Button
                                        size="icon"
                                        variant={img.isPrimary ? "default" : "secondary"}
                                        className="rounded-xl size-9 shadow-lg"
                                        onClick={() => handleSetPrimary(img.id)}
                                        title="Définir comme couverture"
                                    >
                                        <Star
                                            className={cn(
                                                "size-4",
                                                img.isPrimary && "fill-primary-foreground stroke-primary-foreground"
                                            )}
                                        />
                                    </Button>

                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="rounded-xl size-9 shadow-lg"
                                        onClick={() => handleDelete(img.id)}
                                        title="Supprimer"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* LA MODALE DE SÉLECTION D'IMAGE */}
            <ImageSelectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectImage={handleSelectImage}
                title="Sélectionner la couverture de l'hôtel"
            />
        </div>
    );
}