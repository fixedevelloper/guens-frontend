"use client";

import { use, useState } from "react";
import { useTranslations } from "next-intl";
import {
    ArrowLeft,
    UploadCloud,
    Trash2,
    Star,
    Image as ImageIcon,
    CheckCircle2,
    Images,
    Building2,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {ImageSelectModal} from "../../../../../../../../components/partner/media/ImageSelectModal";

export interface HotelImageItem {
    id: string;
    url: string;
    isPrimary: boolean;
    name?: string;
}

interface PageProps {
    params: Promise<{
        locale: string;
        id: string;
    }>;
}

export default function HotelImagesPage({ params }: PageProps) {
    // Dépaquetage du paramètre asynchrone Next.js 15
    const { id } = use(params);
    const t = useTranslations("HotelImages");

    // État de la modale
    const [isModalOpen, setIsModalOpen] = useState(false);

    // État des images (Mock initial d'API)
    const [images, setImages] = useState<HotelImageItem[]>([
        {
            id: "h-img-1",
            url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
            isPrimary: true,
            name: "facade-principale.jpg",
        },
        {
            id: "h-img-2",
            url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
            isPrimary: false,
            name: "reception-lobby.jpg",
        },
        {
            id: "h-img-3",
            url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
            isPrimary: false,
            name: "piscine-exterieure.jpg",
        },
    ]);

    // Sélection d'image depuis la modale
    const handleSelectImage = (selectedImage: { id: string; url: string }) => {
        setImages((prev) => {
            const exists = prev.some((img) => img.id === selectedImage.id);

            if (exists) {
                // Définit l'image existante comme image de couverture
                return prev.map((img) => ({
                    ...img,
                    isPrimary: img.id === selectedImage.id,
                }));
            } else {
                // Ajoute la nouvelle image et la définit comme couverture
                return [
                    ...prev.map((img) => ({ ...img, isPrimary: false })),
                    { id: selectedImage.id, url: selectedImage.url, isPrimary: true },
                ];
            }
        });

        setIsModalOpen(false);
    };

    // Définir une photo de couverture
    const handleSetPrimary = (id: string) => {
        setImages((prev) =>
            prev.map((img) => ({
                ...img,
                isPrimary: img.id === id,
            }))
        );
    };

    // Supprimer une image de la galerie
    const handleDelete = (id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
    };

    return (
        <div className="space-y-6">
            {/* HEADER & BOUTONS D'ACTION */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" asChild className="rounded-xl size-9 shrink-0">
                        <Link href={`/listings/hotels/${id}`}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <Building2 className="size-4 text-primary shrink-0" />
                            <h1 className="text-lg font-black tracking-tight sm:text-xl">
                                {t("title") ?? "Galerie de l'établissement"}
                            </h1>
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground">
                            ID Hôtel : <span className="font-mono text-foreground">{id}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* BOUTON SÉLECTION MODALE */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                        className="rounded-xl font-bold text-xs gap-2 border-border/70 h-9"
                    >
                        <Images className="size-4 text-primary" />
                        <span>{t("changeCover") ?? "Sélectionner la couverture"}</span>
                    </Button>

                    <Badge variant="outline" className="rounded-lg px-2.5 py-1 text-xs font-bold">
                        {images.length} {images.length > 1 ? "photos" : "photo"}
                    </Badge>
                </div>
            </div>

            {/* BANNIÈRE DE TÉLÉCHARGEMENT OU CHOIX DE MÉDIATHÈQUE */}
            <Card className="border-2 border-dashed border-border/60 hover:border-primary/50 transition-all rounded-2xl bg-card/50">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                        <UploadCloud className="size-6" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                        {t("uploadTitle") ?? "Ajouter des visuels pour cet hôtel"}
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-md mt-1 mb-4 font-medium">
                        Mettez en valeur la façade, la réception, le restaurant et les équipements extérieurs.
                    </p>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                        className="rounded-xl font-bold text-xs cursor-pointer h-9 px-4 gap-2"
                    >
                        <ImageIcon className="size-3.5" />
                        {t("openGallery") ?? "Ouvrir la médiathèque"}
                    </Button>
                </CardContent>
            </Card>

            {/* GRILLE D'IMAGES DE L'HÔTEL */}
            {images.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                            {t("sectionTitle") ?? "Photos de l'hôtel"}
                        </h2>
                        <span className="text-[11px] font-semibold text-muted-foreground hidden sm:inline">
              La photo marquée "Couverture" apparaîtra dans les résultats de recherche.
            </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((img) => (
                            <div
                                key={img.id}
                                className={cn(
                                    "group relative aspect-16/10 rounded-2xl overflow-hidden border bg-slate-100 dark:bg-zinc-900 transition-all",
                                    img.isPrimary
                                        ? "border-primary ring-2 ring-primary/20 shadow-xs"
                                        : "border-border/50 hover:border-border"
                                )}
                            >
                                <img
                                    src={img.url}
                                    alt={img.name ?? "Hotel photo"}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />

                                {/* Badge Couverture */}
                                {img.isPrimary && (
                                    <Badge className="absolute top-2.5 left-2.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-extrabold gap-1 shadow-md">
                                        <CheckCircle2 className="size-3" />
                                        Couverture
                                    </Badge>
                                )}

                                {/* Overlay d'actions au survol */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                    <Button
                                        size="icon"
                                        variant={img.isPrimary ? "default" : "secondary"}
                                        className="rounded-xl size-9 shadow-lg"
                                        onClick={() => handleSetPrimary(img.id)}
                                        title="Définir comme couverture de l'hôtel"
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
                                        title="Supprimer la photo"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODALE DE SÉLECTION D'IMAGE */}
            <ImageSelectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectImage={handleSelectImage}
                title="Sélectionner la couverture de l'hôtel"
            />
        </div>
    );
}