// components/hotel-detail/hotel-detail-page-content.tsx
"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  MapPin,
  Star,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Compass,
  ThumbsUp,
} from "lucide-react";

import { HotelGallery } from "@/components/hotel-detail/hotel-gallery";
import { HotelRoomList } from "@/components/hotel-detail/hotel-room-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHotelDetail, useHotelRooms } from "@/hooks/use-search";
import type { HotelDetail } from "@/lib/api/types";

interface HotelDetailPageContentProps {
  hotelId: string;
  offerId: string | null;
  hotelName?: string;
  rating?: number;
  address?: string;
  nights?: number;
}

export function HotelDetailPageContent({
  hotelId,
  offerId,
  hotelName: initialHotelName = "Hôtel",
  rating: initialRating = 4,
  address: initialAddress,
  nights = 1,
}: HotelDetailPageContentProps) {
  const t = useTranslations("HotelDetail");
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // 1. Récupération des offres de chambres
  const {
    data: rooms = [],
    isLoading: isRoomsLoading,
    isError: isRoomsError,
    refetch: refetchRooms,
  } = useHotelRooms(offerId);

  // 2. Récupération des détails complets de l'hôtel (Backend API)
  const {
    data: hotel,
    isLoading: isHotelLoading,
    isError: isHotelError,
    refetch: refetchHotel,
  } = useHotelDetail(offerId) as {
    data: HotelDetail | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const isLoading = isRoomsLoading || isHotelLoading;
  const isError = isRoomsError || isHotelError;

  const handleRefetch = () => {
    refetchRooms();
    refetchHotel();
  };

  // Résolution dynamique des informations
  const name = hotel?.name || initialHotelName;
  const address = hotel?.address || initialAddress;
  const city = hotel?.city;
  const country = hotel?.country;
  const postalCode = hotel?.postalCode;
  const rating = hotel?.hotelRating ?? initialRating;
  const reviewScore = hotel?.hotelReview ? parseFloat(hotel.hotelReview) : null;
  const descriptionContent = hotel?.description?.content;
  const facilities = hotel?.facilities || [];

  // Agrégation et extraction des URLs d'images (HotelImages + RoomImages)
  const galleryImages = useMemo(() => {
    const hotelImgUrls = (hotel?.hotelImages || []).map((img) => img.url);
    const roomImgUrls = (rooms || []).flatMap((room) => room.roomImages || []);
    const combined = [...hotelImgUrls, ...roomImgUrls].filter(
      (img): img is string => Boolean(img) && typeof img === "string" && img.trim().length > 0
    );
    return Array.from(new Set(combined));
  }, [rooms, hotel]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-8">
      {/* 1. EN-TÊTE STYLE BOOKING.COM */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-2 border-b border-border/40">
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-lg px-2.5 py-1 text-xs font-bold gap-1 bg-primary/10 text-primary">
              <Sparkles className="size-3.5 fill-primary" />
              {t("hotelBadge") ?? "Établissement Recommandé"}
            </Badge>

            {/* Étoiles de l'hôtel */}
            {rating > 0 && (
              <div className="flex items-center text-amber-500 gap-0.5 bg-amber-500/10 px-2 py-0.5 rounded-md">
                {Array.from({ length: Math.min(Math.round(rating), 5) }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-current" />
                ))}
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            {name}
          </h1>

          {/* Localisation complète */}
          {(address || city || country) && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground font-medium">
              <MapPin className="size-4 shrink-0 text-primary" />
              <span>
                {[address, postalCode, city, country].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* MÉTROLOGIE AVIS / NOTE BOOKING */}
        {reviewScore && (
          <div className="flex items-center gap-3 bg-card border border-border/60 p-3 rounded-2xl shadow-2xs shrink-0 self-start">
            <div className="text-right space-y-0.5">
              <div className="text-sm font-extrabold text-foreground">
               {reviewScore >= 8.5
  ? t("excellent")
  : reviewScore >= 7.5
    ? t("veryGood")
    : t("good")}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium"> {t("basedOnReviews")}</p>
            </div>
            <div className="size-11 rounded-xl bg-primary text-primary-foreground font-black text-lg flex items-center justify-center shadow-xs">
              {reviewScore.toFixed(1)}
            </div>
          </div>
        )}
      </div>

      {/* 2. GALERIE PHOTO DYNAMIQUE */}
      <HotelGallery hotelName={name} images={galleryImages} />

      {/* 3. GRILLE DE DÉTAILS : DESCRIPTION, ÉQUIPEMENTS & FICHE SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE PRINCIPALE (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* DESCRIPTION DE L'ÉTABLISSEMENT */}
          {descriptionContent && (
            <Card className="rounded-2xl border border-border/50 bg-card shadow-2xs overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/40 border-b border-border/40 pb-3.5">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Info className="size-5 text-primary" />
                  {t("aboutTitle") ?? "À propos de cet établissement"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div
                  className={`prose dark:prose-invert max-w-none text-sm text-muted-foreground/90 font-medium leading-relaxed
                             [&>p]:mb-3 [&>b]:text-foreground [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 ${
                               !isDescExpanded ? "line-clamp-4" : ""
                             }`}
                  dangerouslySetInnerHTML={{ __html: descriptionContent }}
                />
                {descriptionContent.length > 250 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="p-0 h-auto font-bold text-xs text-primary hover:bg-transparent hover:underline gap-1"
                  >
                    {isDescExpanded ? (
                      <>
                        {t("showLess") ?? "Afficher moins"} <ChevronUp className="size-3.5" />
                      </>
                    ) : (
                      <>
                        {t("showMore") ?? "Lire la suite"} <ChevronDown className="size-3.5" />
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* ÉQUIPEMENTS & SERVICES POPULAIRES */}
          {facilities.length > 0 && (
            <Card className="rounded-2xl border border-border/50 bg-card shadow-2xs">
              <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/40 border-b border-border/40 pb-3.5">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ThumbsUp className="size-5 text-primary" />
                  {t("facilitiesTitle") ?? "Équipements les plus appréciés"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {facilities.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/30 text-xs font-semibold text-foreground"
                    >
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* SIDEBAR D'INFORMATIONS PRATIQUES (1/3) */}
        <div className="space-y-6">
          <Card className="rounded-2xl border border-border/50 bg-card shadow-2xs sticky top-20">
            <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/40 border-b border-border/40 pb-3.5">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Compass className="size-4 text-primary" />
                {t("contactTitle") ?? "Contact & Emplacement"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs font-medium">
              
              {/* Adresse détaillée */}
              {(address || city) && (
                <div className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground block"> {t("address")}</span>
                    <p>{[address, city, postalCode, country].filter(Boolean).join(", ")}</p>
                  </div>
                </div>
              )}

              {/* Téléphone */}
              {hotel?.phone && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="size-4 text-primary shrink-0" />
                  <div>
                    <span className="font-bold text-foreground block">{t("phone")}</span>
                    <a href={`tel:${hotel.phone}`} className="hover:underline text-foreground">
                      {hotel.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Email */}
              {hotel?.email && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="size-4 text-primary shrink-0" />
                  <div>
                    <span className="font-bold text-foreground block"> {t("email")}</span>
                    <a href={`mailto:${hotel.email}`} className="hover:underline text-foreground truncate block max-w-[200px]">
                      {hotel.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Coordonnées GPS / Carte */}
              {hotel?.latitude && hotel?.longitude && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl text-xs font-bold gap-2"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${hotel.latitude},${hotel.longitude}`,
                        "_blank"
                      )
                    }
                  >
                    <MapPin className="size-3.5 text-primary" />
                    {t("viewOnMap")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. SECTION DES CHAMBRES ET DISPONIBILITÉS */}
      <section className="space-y-4 pt-4 border-t border-border/40">
        {isLoading ? (
          <RoomListSkeleton />
        ) : isError ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-3">
            <AlertCircle className="size-8 text-destructive mx-auto" />
            <p className="text-sm font-semibold text-foreground">
              {t("roomsError") ?? "Impossible de charger les offres de chambres pour le moment."}
            </p>
            <Button size="sm" variant="outline" onClick={handleRefetch} className="gap-2 rounded-xl">
              <RefreshCw className="size-3.5" />
              {t("retry") ?? "Réessayer"}
            </Button>
          </div>
        ) : (
          <HotelRoomList roomOffers={rooms} nights={nights} />
        )}
      </section>
    </div>
  );
}

/**
 * Composant Squelette pendant la charge React Query
 */
function RoomListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-64 rounded-lg" />
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
            <Skeleton className="h-6 w-1/3 rounded-md" />
            <div className="flex justify-between items-center pt-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-3 w-32 rounded-md" />
              </div>
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}