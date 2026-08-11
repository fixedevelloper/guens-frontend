"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
    ArrowLeft,
    UploadCloud,
    Trash2,
    Star,
    Image as ImageIcon,
    CheckCircle2,
    Images,
    Building2,
    Loader2,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import {
    addHotelImage,
    deleteHotelImage,
    getHotel,
    setPrimaryHotelImage,
} from "@/lib/api/partner";
import { HotelImageResponse } from "@/lib/api/types";
import { ImageSelectModal } from "../../../../../../../../components/partner/media/ImageSelectModal";

export interface HotelImageItem {
    id: string;
    url: string;
    isPrimary: boolean;
    name?: string;
}

function toHotelImageItem(image: HotelImageResponse): HotelImageItem {
    return {
        id: image.id,
        url: image.url,
        isPrimary: image.isPrimary,
        name: image.caption ?? undefined,
    };
}

interface PageProps {
    params: Promise<{
        locale: string;
        id: string;
    }>;
}

export default function HotelImagesPage({ params }: PageProps) {
    const { id } = use(params);
    const t = useTranslations("HotelImages");
    const { partnerId } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [images, setImages] = useState<HotelImageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        if (!partnerId) return;

        let cancelled = false;
        setLoading(true);
        setLoadError(null);

        getHotel(partnerId, id)
            .then((hotel) => {
                if (cancelled) return;
                setImages(hotel.images.map(toHotelImageItem));
            })
            .catch((error) => {
                console.error("Erreur lors du chargement des images de l'hôtel:", error);
                if (!cancelled) setLoadError(t("errorLoadImages"));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [partnerId, id, t]);

    const handleSelectImage = async (selectedImage: { url: string; name: string }) => {
        if (!partnerId) return;
        setIsModalOpen(false);

        const existing = images.find((img) => img.url === selectedImage.url);

        try {
            const hotel = existing
                ? await setPrimaryHotelImage(partnerId, id, existing.id)
                : await addHotelImage(partnerId, id, {
                    url: selectedImage.url,
                    caption: selectedImage.name,
                    isPrimary: true,
                });
            setImages(hotel.images.map(toHotelImageItem));
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'image:", error);
            toast.error(t("errorAddImage"));
        }
    };

    const handleSetPrimary = async (imageId: string) => {
        if (!partnerId) return;

        try {
            const hotel = await setPrimaryHotelImage(partnerId, id, imageId);
            setImages(hotel.images.map(toHotelImageItem));
        } catch (error) {
            console.error("Erreur lors de la définition de la couverture:", error);
            toast.error(t("errorSetPrimary"));
        }
    };

    const handleDelete = async (imageId: string) => {
        if (!partnerId) return;

        const previous = images;
        setImages((prev) => prev.filter((img) => img.id !== imageId));

        try {
            await deleteHotelImage(partnerId, id, imageId);
        } catch (error) {
            console.error("Erreur lors de la suppression de l'image:", error);
            toast.error(t("errorDeleteImage"));
            setImages(previous);
        }
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
                                {t("title")}
                            </h1>
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground">
                            {t("hotelId")} <span className="font-mono text-foreground">{id}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                        className="rounded-xl font-bold text-xs gap-2 border-border/70 h-9"
                    >
                        <Images className="size-4 text-primary" />
                        <span>{t("changeCover")}</span>
                    </Button>

                    <Badge variant="outline" className="rounded-lg px-2.5 py-1 text-xs font-bold">
                        {t("photoCount", { count: images.length })}
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
                        {t("uploadTitle")}
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-md mt-1 mb-4 font-medium">
                        {t("uploadDescription")}
                    </p>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                        className="rounded-xl font-bold text-xs cursor-pointer h-9 px-4 gap-2"
                    >
                        <ImageIcon className="size-3.5" />
                        {t("openGallery")}
                    </Button>
                </CardContent>
            </Card>

            {/* GRILLE D'IMAGES DE L'HÔTEL */}
            {loading ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" />
                    {t("loadingGallery")}
                </div>
            ) : loadError ? (
                <div className="text-center py-12 text-destructive text-sm font-medium">
                    {loadError}
                </div>
            ) : images.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                            {t("sectionTitle")}
                        </h2>
                        <span className="text-[11px] font-semibold text-muted-foreground hidden sm:inline">
                            {t("primaryImageHelp")}
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
                                    alt={img.name ?? t("imageAlt")}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />

                                {/* Badge Couverture */}
                                {img.isPrimary && (
                                    <Badge className="absolute top-2.5 left-2.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-extrabold gap-1 shadow-md">
                                        <CheckCircle2 className="size-3" />
                                        {t("primaryBadge")}
                                    </Badge>
                                )}

                                {/* Overlay d'actions au survol */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                    <Button
                                        size="icon"
                                        variant={img.isPrimary ? "default" : "secondary"}
                                        className="rounded-xl size-9 shadow-lg"
                                        onClick={() => handleSetPrimary(img.id)}
                                        title={t("setPrimaryTooltip")}
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
                                        title={t("deleteTooltip")}
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
                title={t("modalTitle")}
            />
        </div>
    );
}