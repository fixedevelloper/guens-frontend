// components/hotel-detail/hotel-amenities.tsx
"use client";

import { useTranslations } from "next-intl";
import {
  Wifi,
  Waves,
  SquareParking,
  Coffee,
  Wind,
  Dumbbell,
  UtensilsCrossed,
  Sparkles,
  Bus,
  Dog,
  Clock,
  Check,
  type LucideIcon,
} from "lucide-react";

interface HotelAmenitiesProps {
  amenities: string[];
}

// 1. Dictionnaire direct pour les clés courtes (ex: "wifi", "ac", etc.)
const EXACT_ICON_MAP: Record<string, LucideIcon> = {
  wifi: Wifi,
  pool: Waves,
  parking: SquareParking,
  breakfast: Coffee,
  ac: Wind,
  gym: Dumbbell,
  restaurant: UtensilsCrossed,
  spa: Sparkles,
  shuttle: Bus,
  pets: Dog,
  frontdesk: Clock,
};

/**
 * Associe une icône à la volée en analysant le texte fournisseur
 * ou retourne une icône par défaut (Check) pour éviter tout crash React.
 */
function getAmenityIcon(facility: string): LucideIcon {
  const normalized = facility.toLowerCase().trim();

  // Recherche directe
  if (EXACT_ICON_MAP[normalized]) {
    return EXACT_ICON_MAP[normalized];
  }

  // Correspondance par mots-clés sur texte brut fournisseur
  if (normalized.includes("wifi") || normalized.includes("internet")) return Wifi;
  if (normalized.includes("park") || normalized.includes("garage")) return SquareParking;
  if (normalized.includes("pool") || normalized.includes("piscine")) return Waves;
  if (normalized.includes("breakfast") || normalized.includes("coffee")) return Coffee;
  if (normalized.includes("air") || normalized.includes("ac") || normalized.includes("climat")) return Wind;
  if (normalized.includes("gym") || normalized.includes("fitness")) return Dumbbell;
  if (normalized.includes("restaurant") || normalized.includes("bar") || normalized.includes("dining")) return UtensilsCrossed;
  if (normalized.includes("spa") || normalized.includes("massage")) return Sparkles;
  if (normalized.includes("shuttle") || normalized.includes("bus") || normalized.includes("navette")) return Bus;
  if (normalized.includes("pet") || normalized.includes("dog")) return Dog;
  if (normalized.includes("front desk") || normalized.includes("reception") || normalized.includes("24-hour")) return Clock;

  // Icône de fallback de sécurité
  return Check;
}

export function HotelAmenities({ amenities }: HotelAmenitiesProps) {
  const t = useTranslations("HotelDetail.amenities");

  // Filtrage de sécurité des chaînes vides
  const validAmenities = (amenities || []).filter(
    (item) => typeof item === "string" && item.trim().length > 0
  );

  if (validAmenities.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {validAmenities.map((facility, index) => {
        const Icon = getAmenityIcon(facility);

        // Si la clé existe dans i18n on traduit, sinon on affiche le texte brut du fournisseur
        let label = facility;
        if (t.has(facility as any)) {
          label = t(facility as any);
        }

        return (
          <div
            key={`${facility}-${index}`}
            className="flex items-center gap-3 rounded-xl border border-border/40 bg-card p-3 text-xs sm:text-sm font-semibold text-foreground/90 shadow-2xs hover:border-primary/20 hover:bg-slate-50/50 dark:hover:bg-zinc-900/40 transition-all duration-200 select-none group"
          >
            <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:scale-110 transition-transform duration-200 shrink-0">
              <Icon className="size-4 stroke-[2.2]" />
            </div>
            <span className="truncate capitalize">{label}</span>
          </div>
        );
      })}
    </div>
  );
}