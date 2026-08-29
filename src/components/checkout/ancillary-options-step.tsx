// components/checkout/ancillary-options-step.tsx
"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Luggage, UtensilsCrossed, Armchair, ShieldCheck, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AncillaryOptionResponse, AncillaryType } from "@/lib/api/types";

interface AncillaryOptionsStepProps {
  options: AncillaryOptionResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
  /** Number of travelers the options were quoted for - drives the seat grid's traveler tabs. */
  travelerCount: number;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onContinue: () => void;
  onSkip: () => void;
}

const LIST_SECTIONS: { type: AncillaryType; icon: typeof Luggage; titleKey: string }[] = [
  { type: "BAGGAGE", icon: Luggage, titleKey: "baggageSection" },
  { type: "MEAL", icon: UtensilsCrossed, titleKey: "mealSection" },
  { type: "INSURANCE", icon: ShieldCheck, titleKey: "insuranceSection" },
];

/** "T1"/"T2"/... -> 1-based traveler number for display; null (booking-level, e.g. INSURANCE)
 *  renders as "for all travelers" instead. */
function travelerNumber(paxRef: string | null): number | null {
  if (!paxRef) return null;
  const digits = paxRef.replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

export function AncillaryOptionsStep({
  options,
  isLoading,
  isError,
  travelerCount,
  selectedIds,
  onChange,
  onContinue,
  onSkip,
}: AncillaryOptionsStepProps) {
  const t = useTranslations("AncillaryOptions");
  const locale = useLocale();

  const byId = useMemo(() => new Map((options ?? []).map((o) => [o.id, o])), [options]);

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  }

  /** Seats are exclusive: picking a new one for a given (segment, traveler) drops whichever seat
   *  that same traveler had previously picked on that segment - a traveler can't sit in two seats. */
  function toggleSeat(option: AncillaryOptionResponse) {
    if (selectedIds.includes(option.id)) {
      onChange(selectedIds.filter((id) => id !== option.id));
      return;
    }
    const sameSlot = (id: string) => {
      const o = byId.get(id);
      return Boolean(o && o.type === "SEAT" && o.segmentId === option.segmentId && o.paxRef === option.paxRef);
    };
    onChange([...selectedIds.filter((id) => !sameSlot(id)), option.id]);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !options) {
    return (
      <Alert className="rounded-2xl border-destructive/30 bg-destructive/5 text-destructive">
        <AlertDescription className="flex items-center justify-between gap-4 py-1">
          <span className="text-sm font-medium">{t("loadError")}</span>
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onSkip}>
            {t("skip")}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const seatOptions = options.filter((option) => option.type === "SEAT");
  const seatSegmentIds = Array.from(new Set(seatOptions.map((option) => option.segmentId ?? "")));

  const selectedTotal = options
    .filter((option) => selectedIds.includes(option.id))
    .reduce((sum, option) => sum + Number(option.price.amount), 0);
  const currency = options[0]?.price.currency;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold tracking-tight text-foreground">{t("title")}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="space-y-5">
        {seatSegmentIds.length > 0 && (
          <div className="rounded-2xl border border-border/60 bg-background p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                <Armchair className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{t("seatSection")}</h3>
            </div>
            {seatSegmentIds.map((segmentId) => (
              <SeatGrid
                key={segmentId}
                seatOptions={seatOptions.filter((option) => (option.segmentId ?? "") === segmentId)}
                travelerCount={travelerCount}
                selectedIds={selectedIds}
                onToggle={toggleSeat}
                locale={locale}
              />
            ))}
          </div>
        )}

        {LIST_SECTIONS.map(({ type, icon: Icon, titleKey }) => {
          const sectionOptions = options.filter((option) => option.type === type);
          if (sectionOptions.length === 0) return null;

          return (
            <div key={type} className="rounded-2xl border border-border/60 bg-background p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Icon className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">{t(titleKey)}</h3>
              </div>

              <div className="space-y-2">
                {sectionOptions.map((option) => {
                  const selected = selectedIds.includes(option.id);
                  const number = travelerNumber(option.paxRef);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggle(option.id)}
                      aria-pressed={selected}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all outline-none active:scale-[0.99]",
                        selected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                          : "border-border/60 hover:border-border hover:bg-slate-50/50 dark:hover:bg-zinc-900/30"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-full border text-white transition-colors",
                            selected ? "border-primary bg-primary" : "border-muted-foreground/45 bg-transparent"
                          )}
                        >
                          {selected && <Check className="size-2.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {number !== null ? t("forTraveler", { index: number }) : t("forAllTravelers")}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-foreground whitespace-nowrap">
                        {formatMoney(option.price, locale)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">
            {selectedTotal > 0 && currency ? formatMoney({ amount: selectedTotal, currency }, locale) : "—"}
          </span>
          <span className="text-xs text-muted-foreground">{t("selectedCount", { count: selectedIds.length })}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" className="rounded-xl text-muted-foreground hover:text-foreground" onClick={onSkip}>
            {t("skip")}
          </Button>
          <Button type="button" className="rounded-xl shadow-sm px-5" onClick={onContinue}>
            {t("continue")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** One segment's real cabin grid (rows/columns/aisle from `seatLayout`, priced per seat). A
 *  traveler-count > 1 gets tabs to switch which passenger's price/availability is shown - the
 *  same physical seat is a different `AncillaryOptionResponse` (different price/eligibility) per
 *  traveler, per Travel Terminus's per-passenger pricing model. */
function SeatGrid({
  seatOptions,
  travelerCount,
  selectedIds,
  onToggle,
  locale,
}: {
  seatOptions: AncillaryOptionResponse[];
  travelerCount: number;
  selectedIds: string[];
  onToggle: (option: AncillaryOptionResponse) => void;
  locale: string;
}) {
  const t = useTranslations("AncillaryOptions");
  const [activeTraveler, setActiveTraveler] = useState(0);

  const layout = seatOptions.find((o) => o.seatLayout)?.seatLayout;
  if (!layout || layout.totalRows <= 0) {
    return null;
  }

  const columns = layout.seatGroups.length > 0 ? layout.seatGroups.join("").split("") : [];
  const halfColumns = Math.ceil(columns.length / 2);
  const activePaxRef = `T${activeTraveler + 1}`;
  const byCode = new Map(
      seatOptions.filter((o) => o.paxRef === activePaxRef).map((o) => [o.code ?? "", o])
  );
  const selectedForActiveTraveler = seatOptions.find(
      (o) => o.paxRef === activePaxRef && selectedIds.includes(o.id)
  );

  return (
    <div className="space-y-3">
      {travelerCount > 1 && (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: travelerCount }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveTraveler(i)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold border transition-colors",
                activeTraveler === i
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/60 text-muted-foreground hover:border-border"
              )}
            >
              {t("forTraveler", { index: i + 1 })}
            </button>
          ))}
        </div>
      )}

      <div className="relative overflow-x-auto rounded-2xl border border-border/40 bg-slate-50/40 dark:bg-zinc-950/20 py-6 px-4 flex justify-center">
        <div className="inline-grid gap-2 min-w-max">
          {Array.from({ length: layout.totalRows }, (_, i) => i + 1).map((row) => (
            <div key={row} className="flex items-center gap-1.5 justify-center">
              <span className="w-5 shrink-0 text-center text-[10px] font-bold text-muted-foreground/60">{row}</span>
              {columns.map((column, colIdx) => {
                const code = `${row}${column}`;
                const seatOption = byCode.get(code);
                const selected = seatOption ? selectedIds.includes(seatOption.id) : false;
                const available = Boolean(seatOption);
                const isAisle = colIdx === halfColumns;
                return (
                  <div key={code} className="flex items-center">
                    {isAisle && <div className="w-6 sm:w-8" />}
                    <button
                      type="button"
                      disabled={!available}
                      onClick={() => seatOption && onToggle(seatOption)}
                      aria-pressed={selected}
                      title={seatOption ? formatMoney(seatOption.price, locale) : undefined}
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center text-[10px] font-bold transition-all",
                        "rounded-t-[7px] rounded-b-[4px] border-b-2 active:scale-95",
                        !available && [
                          "cursor-not-allowed border-transparent bg-muted/40 text-muted-foreground/30",
                          "border-b-muted/20",
                        ],
                        available && !selected && [
                          "border-border bg-background text-foreground hover:bg-accent hover:border-accent-foreground/20",
                          "border-b-slate-300 dark:border-b-zinc-700 shadow-xs",
                        ],
                        selected && [
                          "border-primary bg-primary text-primary-foreground",
                          "border-b-primary-dark shadow-sm scale-102 font-extrabold",
                        ]
                      )}
                    >
                      {column}
                    </button>
                  </div>
                );
              })}
              <span className="w-5 shrink-0 text-center text-[10px] font-bold text-muted-foreground/60">{row}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        {selectedForActiveTraveler
          ? `${t("forTraveler", { index: activeTraveler + 1 })} — ${selectedForActiveTraveler.label} — ${formatMoney(selectedForActiveTraveler.price, locale)}`
          : t("noSeatSelected", { index: activeTraveler + 1 })}
      </div>
    </div>
  );
}
