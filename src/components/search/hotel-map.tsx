"use client";

import { useLocale, useTranslations } from "next-intl";
import { MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { hotelOfferKey } from "@/lib/filters";
import { stringHash } from "@/lib/hash";
import type { HarmonizedHotelOffer } from "@/lib/api/types";

/** Deterministic pseudo-position so pins don't jitter across re-renders/filtering - there's
 *  no real geocoding here (no maps API key/tiles in this environment), just a stylized panel
 *  that conveys "these results are spread across the city" and keeps list/map in sync. */
function pinPosition(seed: string): { top: number; left: number } {
  const hash = stringHash(seed);
  const a = Math.abs(hash % 1000) / 1000;
  const b = Math.abs((hash >> 3) % 1000) / 1000;
  return { top: 12 + a * 70, left: 8 + b * 82 };
}

interface HotelMapProps {
  offers: HarmonizedHotelOffer[];
  hoveredKey: string | null;
  onHoverChange: (key: string | null) => void;
  onSelect: (key: string) => void;
}

export function HotelMap({ offers, hoveredKey, onHoverChange, onSelect }: HotelMapProps) {
  const t = useTranslations("HotelMap");
  const locale = useLocale();

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div
          className={cn(
            "relative h-[420px] overflow-hidden rounded-lg border",
            "bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)]",
            "bg-[size:28px_28px] bg-accent/40"
          )}
        >
          {offers.map((offer, index) => {
            const key = hotelOfferKey(offer, index);
            const { top, left } = pinPosition(key);
            const price = Math.min(...offer.quotes.map((q) => Number(q.price.amount)));
            const isActive = hoveredKey === key;

            return (
              <button
                key={key}
                type="button"
                style={{ top: `${top}%`, left: `${left}%` }}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-full cursor-pointer transition-transform",
                  isActive ? "z-10 scale-110" : "z-0"
                )}
                onMouseEnter={() => onHoverChange(key)}
                onMouseLeave={() => onHoverChange(null)}
                onClick={() => onSelect(key)}
              >
                <span
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold whitespace-nowrap shadow-sm",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border"
                  )}
                >
                  <MapPin className="size-3.5" />
                  {formatMoney({ amount: price, currency: offer.quotes[0].price.currency }, locale)}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
