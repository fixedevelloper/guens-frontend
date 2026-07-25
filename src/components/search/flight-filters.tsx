"use client";

import { useLocale, useTranslations } from "next-intl";
import { SlidersHorizontal, RefreshCw, Plane, CircleDollarSign, GitCommit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";
import { DEFAULT_FLIGHT_FILTERS, type FlightFilterOptions, type FlightFilterState } from "@/lib/filters";

const STOPS_OPTIONS = [
  { value: "ALL", labelKey: "allStops" },
  { value: "DIRECT", labelKey: "direct" },
  { value: "1", labelKey: "oneStop" },
  { value: "2+", labelKey: "twoPlusStops" },
] as const;

interface FlightFiltersProps {
  options: FlightFilterOptions;
  value: FlightFilterState;
  onChange: (next: FlightFilterState) => void;
}

export function FlightFilters({ options, value, onChange }: FlightFiltersProps) {
  const t = useTranslations("Filters");
  const locale = useLocale();
  const currentMax = value.maxPrice ?? options.maxPrice;

  function toggleAirline(airline: string) {
    const next = value.airlines.includes(airline)
        ? value.airlines.filter((a) => a !== airline)
        : [...value.airlines, airline];
    onChange({ ...value, airlines: next });
  }

  const isDefault =
      value.maxPrice === null &&
      value.airlines.length === 0 &&
      value.stops === DEFAULT_FLIGHT_FILTERS.stops;

  return (
      <div className="space-y-6">
        {/* Header du panneau */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-primary" />
            <span className="font-bold text-sm tracking-tight text-foreground uppercase">
            {t("title")}
          </span>
          </div>
          {!isDefault && (
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange(DEFAULT_FLIGHT_FILTERS)}
                  className="h-8 rounded-full text-xs font-semibold hover:bg-primary/5 text-primary gap-1 px-3"
              >
                <RefreshCw className="size-3" />
                {t("reset")}
              </Button>
          )}
        </div>

        <Separator className="bg-border/60" />

        {/* 1. SECTION BUDGET MAXIMAL */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <CircleDollarSign className="size-3.5 text-primary/80" />
            {t("maxPrice")}
          </span>
            <Badge variant="secondary" className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-slate-100 dark:bg-zinc-900 border text-foreground">
              {formatMoney({ amount: currentMax, currency: "EUR" }, locale)}
            </Badge>
          </div>
          <div className="px-1 py-2">
            <Slider
                min={options.minPrice}
                max={options.maxPrice}
                step={1}
                value={[currentMax]}
                onValueChange={([v]) => onChange({ ...value, maxPrice: v })}
                className="cursor-pointer"
            />
            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold mt-2">
              <span>{formatMoney({ amount: options.minPrice, currency: "EUR" }, locale)}</span>
              <span>{formatMoney({ amount: options.maxPrice, currency: "EUR" }, locale)}</span>
            </div>
          </div>
        </div>

        <Separator className="bg-border/60" />

        {/* 2. SECTION ESCALES */}
        <div className="space-y-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
          <GitCommit className="size-3.5 text-primary/80" />
          {t("stops")}
        </span>
          <div className="flex flex-wrap gap-2">
            {STOPS_OPTIONS.map((stop) => {
              const isSelected = value.stops === stop.value;
              return (
                  <button
                      key={stop.value}
                      type="button"
                      onClick={() => onChange({ ...value, stops: stop.value })}
                      className={`flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 active:scale-[0.97] ${
                          isSelected
                              ? "bg-primary/10 text-primary border-primary/40 shadow-sm"
                              : "bg-background text-muted-foreground border-border/80 hover:border-border-hover hover:text-foreground"
                      }`}
                  >
                    {t(stop.labelKey)}
                  </button>
              );
            })}
          </div>
        </div>

        {/* 3. SECTION COMPAGNIES AÉRIENNES */}
        {options.airlines.length > 1 && (
            <>
              <Separator className="bg-border/60" />
              <div className="space-y-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Plane className="size-3.5 text-primary/80" />
              {t("airlines")}
            </span>
                <div className="flex flex-wrap gap-2">
                  {options.airlines.map((airline) => {
                    const isSelected = value.airlines.includes(airline);
                    return (
                        <button
                            key={airline}
                            type="button"
                            onClick={() => toggleAirline(airline)}
                            className={`flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 active:scale-[0.97] ${
                                isSelected
                                    ? "bg-primary/10 text-primary border-primary/40 shadow-sm"
                                    : "bg-background text-muted-foreground border-border/80 hover:border-border-hover hover:text-foreground"
                            }`}
                        >
                          {airline}
                        </button>
                    );
                  })}
                </div>
              </div>
            </>
        )}
      </div>
  );
}