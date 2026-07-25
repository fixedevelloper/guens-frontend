// components/search/hotel-filters.tsx
"use client";

import { useLocale, useTranslations } from "next-intl";
import { SlidersHorizontal, Star, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { formatMoney } from "@/lib/format";
import { DEFAULT_HOTEL_FILTERS, type HotelFilterOptions, type HotelFilterState } from "@/lib/filters";

const RATING_STEPS = [0, 3, 3.5, 4, 4.5];

interface HotelFiltersProps {
  options: HotelFilterOptions;
  value: HotelFilterState;
  onChange: (next: HotelFilterState) => void;
}

export function HotelFilters({ options, value, onChange }: HotelFiltersProps) {
  const t = useTranslations("Filters");
  const locale = useLocale();
  const currentMax = value.maxPrice ?? options.maxPrice;

  function toggleRoomType(roomType: string) {
    const next = value.roomTypes.includes(roomType)
        ? value.roomTypes.filter((r) => r !== roomType)
        : [...value.roomTypes, roomType];
    onChange({ ...value, roomTypes: next });
  }

  const isDefault =
      value.maxPrice === null &&
      value.roomTypes.length === 0 &&
      value.minRating === 0;

  return (
      <div className="space-y-6">

        {/* EN-TÊTE DU FILTRE */}
        <div className="flex items-center justify-between pb-1">
          <h3 className="hidden lg:flex items-center gap-2 text-sm font-black tracking-wide text-foreground uppercase">
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            {t("title") ?? "Filtres"}
          </h3>
          {!isDefault && (
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange(DEFAULT_HOTEL_FILTERS)}
                  className="text-xs font-bold text-primary hover:bg-primary/5 hover:text-primary gap-1.5 px-2.5 py-1.5 h-auto rounded-lg transition-colors ml-auto"
              >
                <RotateCcw className="size-3" />
                {t("reset") ?? "Réinitialiser"}
              </Button>
          )}
        </div>

        <div className="grid gap-6">

          {/* FILTRE : BUDGET MAX */}
          <div className="grid gap-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-muted-foreground/90 tracking-wider uppercase">
                {t("maxPrice") ?? "Budget maximum"}
              </Label>
              <span className="text-sm font-black text-foreground tracking-tight bg-slate-50 dark:bg-zinc-900/50 border border-border/40 px-2.5 py-0.5 rounded-md">
              {formatMoney({ amount: currentMax, currency: "EUR" }, locale)}
            </span>
            </div>
            <Slider
                min={options.minPrice}
                max={options.maxPrice}
                step={1}
                value={[currentMax]}
                onValueChange={([v]) => onChange({ ...value, maxPrice: v })}
                className="py-1"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/60 font-semibold tracking-wide">
              <span>{formatMoney({ amount: options.minPrice, currency: "EUR" }, locale)}</span>
              <span>{formatMoney({ amount: options.maxPrice, currency: "EUR" }, locale)}</span>
            </div>
          </div>

          <Separator className="bg-border/55" />

          {/* FILTRE : NOTE MINIMALE */}
          <div className="grid gap-3">
            <Label className="text-xs font-bold text-muted-foreground/90 tracking-wider uppercase">
              {t("minRating") ?? "Note minimale"}
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {RATING_STEPS.map((rating) => {
                const isSelected = value.minRating === rating;
                return (
                    <Button
                        key={rating}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => onChange({ ...value, minRating: rating })}
                        className={`rounded-xl text-xs font-bold gap-1 transition-all py-4 px-3 ${
                            isSelected
                                ? "bg-primary text-primary-foreground shadow-2xs hover:bg-primary/95"
                                : "border-border/80 hover:bg-slate-50 dark:hover:bg-zinc-900/40 text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {rating === 0 ? (
                          t("anyRating") ?? "Toutes"
                      ) : (
                          <>
                            <span>{rating}</span>
                            <Star className={`size-3 shrink-0 ${isSelected ? "fill-primary-foreground text-primary-foreground" : "fill-amber-400 text-amber-400"}`} />
                          </>
                      )}
                    </Button>
                );
              })}
            </div>
          </div>

          {/* FILTRE : OPTIONS DE CHAMBRES */}
          {options.roomTypes.length > 1 && (
              <>
                <Separator className="bg-border/55" />
                <div className="grid gap-3.5">
                  <Label className="text-xs font-bold text-muted-foreground/90 tracking-wider uppercase">
                    {t("roomTypes") ?? "Type de chambre"}
                  </Label>
                  <div className="grid gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {options.roomTypes.map((roomType) => {
                      const checked = value.roomTypes.includes(roomType);
                      return (
                          <div
                              key={roomType}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 ${
                                  checked
                                      ? "bg-slate-50/50 dark:bg-zinc-900/20 border-border/90"
                                      : "border-border/40 hover:bg-slate-50/30 hover:border-border/60"
                              }`}
                          >
                            <Checkbox
                                id={`room-${roomType}`}
                                checked={checked}
                                onCheckedChange={() => toggleRoomType(roomType)}
                                className="rounded-md border-border/80 text-primary focus-visible:ring-primary/20"
                            />
                            <Label
                                htmlFor={`room-${roomType}`}
                                className="text-xs font-semibold text-foreground/80 cursor-pointer select-none flex-1 truncate capitalize"
                            >
                              {roomType.toLowerCase()}
                            </Label>
                          </div>
                      );
                    })}
                  </div>
                </div>
              </>
          )}
        </div>
      </div>
  );
}