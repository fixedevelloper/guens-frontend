// components/search/hotel-results.tsx
"use client";

import { useLocale, useTranslations } from "next-intl";
import { Star, MapPin, Building2, ChevronRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { hotelOfferKey } from "@/lib/filters";
import { galleryHues } from "@/lib/hotel-mock-content";
import { useHotelStore } from "@/store/useHotelStore";
import type { HarmonizedHotelOffer, HotelSearchParams } from "@/lib/api/types";

interface HotelResultsListProps {
  offers: HarmonizedHotelOffer[];
  nights: number;
  params: HotelSearchParams;
  hoveredKey: string | null;
  onHoverChange: (key: string | null) => void;
  isReseller: boolean;
}

export function HotelResultsList({ offers, nights, params, hoveredKey, onHoverChange, isReseller = false }: HotelResultsListProps) {
  const t = useTranslations("Filters");

  if (offers.length === 0) {
    return (
        <Alert className="rounded-2xl border-dashed border-border/80 bg-slate-50/20 py-6 text-center">
          <AlertDescription className="text-sm text-muted-foreground font-medium">
            {t("noMatch") ?? "Aucun hébergement ne correspond à vos filtres actuels."}
          </AlertDescription>
        </Alert>
    );
  }

  return (
      <div className="grid gap-4.5">
        {offers.map((offer, index) => {
          const key = hotelOfferKey(offer, index);
          return (
              <HotelOfferCard
                  key={key}
                  offer={offer}
                  nights={nights}
                  params={params}
                  id={key}
                  isActive={hoveredKey === key}
                  onHoverChange={(hovering) => onHoverChange(hovering ? key : null)}
                  isReseller={isReseller}
              />
          );
        })}
      </div>
  );
}

function HotelOfferCard({
                          offer,
                          nights,
                          params,
                          id,
                          isActive,
                          onHoverChange,
                          isReseller
                        }: {
  offer: HarmonizedHotelOffer;
  nights: number;
  params: HotelSearchParams;
  id: string;
  isActive: boolean;
  onHoverChange: (hovering: boolean) => void;
  isReseller?: boolean;
}) {
  const t = useTranslations("SearchResults");
  const locale = useLocale();
  const hue = galleryHues(offer.hotelName)[0];
  const minPrice = Math.min(...offer.quotes.map((q) => Number(q.price.amount)));
  const currency = offer.quotes[0].price.currency;

  const selectOffer = useHotelStore((state) => state.selectOffer);

  function slugify(text: string) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
  }

  const hotelSlug = slugify(offer.hotelName);

  const searchUrlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchUrlParams.set(key, String(value));
    }
  });
  searchUrlParams.set("offerId", offer.bestOfferId);

  const basePath = isReseller ? "/dashboard/reseller" : "";
  const detailHref = `${basePath}/hotels/${hotelSlug}?${searchUrlParams.toString()}`;

  // Enregistre l'offre choisie dans le store avant la navigation, pour que la page de détail
  // (hotelDetail, roomOffers...) démarre à partir de la bonne offre sans devoir la re-fetcher
  // depuis les query params.
  function handleSelect() {
    selectOffer(offer);
  }

  return (
      <Card
          id={id}
          onMouseEnter={() => onHoverChange(true)}
          onMouseLeave={() => onHoverChange(false)}
          className={cn(
              "scroll-mt-6 overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300",
              "hover:shadow-md hover:border-border/90",
              isActive
                  ? "ring-1 ring-primary/80 border-primary/20 shadow-sm bg-primary/[0.01] scale-[1.005]"
                  : "shadow-2xs"
          )}
      >
        <div className="flex flex-col sm:flex-row h-full">

          <div
              className="relative flex h-32 items-center justify-center overflow-hidden text-white/80 sm:h-auto sm:w-44 sm:shrink-0 transition-opacity duration-300"
              style={{ background: `linear-gradient(135deg, hsl(${hue} 55% 44%), hsl(${(hue + 35) % 360} 55% 30%))` }}
          >
            {offer.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={offer.coverImageUrl}
                    alt={offer.hotelName}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-cover"
                />
            ) : (
                <>
                  <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />
                  <Building2 className="size-9 stroke-[1.5] drop-shadow-xs animate-pulse duration-4000" />
                </>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-between gap-4 p-5 sm:flex-row sm:items-stretch">

            <div className="flex flex-col justify-between gap-3.5">
              <div className="space-y-1.5">
                <h4 className="text-base sm:text-lg font-black tracking-tight text-foreground hover:text-primary transition-colors duration-150 line-clamp-1">
                  {offer.hotelName}
                </h4>

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-muted-foreground font-semibold">
                <span className="flex items-center gap-1 text-foreground/80">
                  <MapPin className="size-3.5 text-muted-foreground/80" />
                  {offer.cityCode}
                </span>
                  <span className="text-border/80">•</span>
                  <span className="capitalize">{offer.roomType.toLowerCase()}</span>
                  <span className="text-border/80">•</span>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 font-black">
                  <Star className="size-3 fill-current text-amber-500" />
                    {offer.rating.toFixed(1)}
                </span>
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between gap-4 border-t border-dashed border-border/60 pt-4 sm:flex-col sm:items-end sm:justify-between sm:border-t-0 sm:border-l sm:border-border/40 sm:pl-5 sm:pt-0 sm:shrink-0 sm:text-right">

              <div className="space-y-0.5">
                <div className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">
                  {t("night", { count: nights }) ?? `${nights} nuits`} • {t("totalStay") ?? "Séjour complet"}
                </div>
                <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  {formatMoney({ amount: minPrice, currency }, locale)}
                </div>
              </div>

              <Button
                  asChild
                  className="rounded-xl font-bold text-xs gap-1 py-4.5 px-4.5 shadow-2xs transition-all active:scale-97 group"
              >
                <Link href={detailHref} onClick={handleSelect} className="group inline-flex items-center gap-1">
                  {t("selectOffer") ?? "Choisir cette offre"}
                  <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>

            </div>

          </div>
        </div>
      </Card>
  );
}