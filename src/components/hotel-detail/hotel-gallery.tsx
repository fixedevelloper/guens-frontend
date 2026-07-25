// components/hotel-detail/hotel-gallery.tsx
"use client";

import { useState, useMemo } from "react";
import { Building2, Sparkles, Compass, ShieldCheck, Images } from "lucide-react";
import { galleryHues } from "@/lib/hotel-mock-content";

interface HotelGalleryProps {
  hotelName?: string;
  images?: string[];
}

export function HotelGallery({ hotelName = "Hôtel", images = [] }: HotelGalleryProps) {
  // Sécurisation des teintes générées
  const hues = useMemo(() => {
    try {
      const generated = galleryHues(hotelName || "Hotel");
      if (Array.isArray(generated) && generated.length >= 4) {
        return generated;
      }
    } catch {
      // Fallback silencieux si galleryHues échoue
    }
    return [210, 240, 270, 300]; // Teintes HSL par défaut
  }, [hotelName]);

  // Filtrage et déduplication rigoureuse des images
  const validImages = useMemo(() => {
    if (!Array.isArray(images)) return [];
    const cleaned = images.filter((img): img is string => Boolean(img) && typeof img === "string" && img.trim().length > 0);
    return Array.from(new Set(cleaned));
  }, [images]);

  // Si l'hôtel n'a aucune image valide, on bascule sur la galerie abstraite
  if (validImages.length === 0) {
    return <FallbackAbstractGallery hotelName={hotelName} hues={hues} />;
  }

  const heroImage = validImages[0];
  const sideImages = validImages.slice(1, 5);

  return (
    <div className="relative w-full">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-3 h-[300px] sm:h-[380px] md:h-[420px] w-full overflow-hidden rounded-2xl">
        {/* IMAGE PRINCIPALE (HERO) */}
        <div className="col-span-1 sm:col-span-2 row-span-2 relative h-full w-full overflow-hidden group bg-muted">
          <GalleryImage
            src={heroImage}
            alt={`${hotelName} - Principal`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
        </div>

        {/* PETITES IMAGES SECONDAIRES (DESKTOP) */}
        {sideImages.map((imgUrl, index) => (
          <div
            key={`side-img-${index}-${imgUrl.slice(-10)}`}
            className="col-span-1 hidden sm:block relative h-full w-full overflow-hidden group bg-muted"
          >
            <GalleryImage
              src={imgUrl}
              alt={`${hotelName} - Vue ${index + 2}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-0" />
          </div>
        ))}

        {/* Remplissage si moins de 5 images */}
        {sideImages.length < 4 &&
          Array.from({ length: 4 - sideImages.length }).map((_, i) => (
            <Tile
              key={`fallback-tile-${i}`}
              hue={hues[(i + sideImages.length + 1) % hues.length]}
              className="col-span-1 hidden sm:flex h-full"
            >
              <Building2 className="size-6 text-white/40" />
            </Tile>
          ))}
      </div>

      {/* Badge du nombre total de photos */}
      {validImages.length > 1 && (
        <div className="absolute bottom-3 right-3 z-10">
          <div className="flex items-center gap-1.5 rounded-xl bg-black/70 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white shadow-md border border-white/10 select-none">
            <Images className="size-3.5" />
            <span>{validImages.length} photos</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Rendu d'image sécurisé avec fallback en cas d'erreur de chargement
 */
function GalleryImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
        <Building2 className="size-8 opacity-40" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}

/**
 * Galerie géométrique abstraite fallback quand l'API ne fournit aucune photo
 */
function FallbackAbstractGallery({ hotelName, hues }: { hotelName: string; hues: number[] }) {
  const subIcons = [
    <Sparkles key="1" className="size-5 opacity-40 mix-blend-overlay shrink-0 animate-pulse" />,
    <Compass key="2" className="size-5 opacity-40 mix-blend-overlay shrink-0" />,
    <ShieldCheck key="3" className="size-5 opacity-40 mix-blend-overlay shrink-0" />,
  ];

  // Garantit qu'on a toujours au moins 4 valeurs valides
  const safeHues = hues.length >= 4 ? hues : [210, 240, 270, 300];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 h-[300px] sm:h-[380px] md:h-[420px] w-full">
      <Tile hue={safeHues[0]} className="col-span-1 sm:col-span-2 row-span-2 h-full">
        <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />
        <div className="relative flex flex-col items-center gap-3 text-center p-6 z-10">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-lg">
            <Building2 className="size-10 text-white drop-shadow-md" />
          </div>
          <span className="text-[10px] font-black tracking-widest text-white/70 uppercase">
            {hotelName}
          </span>
        </div>
      </Tile>

      {safeHues.slice(1, 4).map((hue, i) => (
        <Tile key={`abstract-tile-${i}`} hue={hue} className="col-span-1 h-full hidden sm:flex">
          <div className="absolute -top-12 -right-12 size-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 size-24 rounded-full bg-black/10 blur-lg pointer-events-none" />
          <div className="z-10 p-3 rounded-xl bg-black/10 backdrop-blur-xs border border-white/5">
            {subIcons[i] || subIcons[0]}
          </div>
        </Tile>
      ))}
    </div>
  );
}

interface TileProps {
  hue?: number;
  className: string;
  children: React.ReactNode;
}

function Tile({ hue = 210, className, children }: TileProps) {
  const safeHue = typeof hue === "number" && !isNaN(hue) ? hue : 210;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl flex items-center justify-center text-white/80 transition-all duration-300 hover:scale-[1.015] hover:shadow-md ${className}`}
      style={{
        background: `linear-gradient(135deg, hsl(${safeHue} 55% 44%), hsl(${(safeHue + 35) % 360} 55% 28%))`,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
      {children}
    </div>
  );
}