// components/checkout/seat-map.tsx
"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFlightSeatMap } from "@/hooks/use-search";
import { cn } from "@/lib/utils";

interface SeatMapProps {
  offerId: string;
  seatCount: number;
  selectedSeats: string[];
  onChange: (seats: string[]) => void;
  onContinue: () => void;
  onSkip: () => void;
}

export function SeatMap({ offerId, seatCount, selectedSeats, onChange, onContinue, onSkip }: SeatMapProps) {
  const t = useTranslations("SeatSelection");
  const query = useFlightSeatMap(offerId);

  function toggleSeat(seatNumber: string, available: boolean) {
    if (!available) return;
    if (selectedSeats.includes(seatNumber)) {
      onChange(selectedSeats.filter((s) => s !== seatNumber));
      return;
    }
    if (selectedSeats.length >= seatCount) {
      onChange([...selectedSeats.slice(1), seatNumber]);
      return;
    }
    onChange([...selectedSeats, seatNumber]);
  }

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Alert className="rounded-2xl border-destructive/30 bg-destructive/5 text-destructive">
        <AlertDescription className="flex items-center justify-between gap-4 py-1">
          <span className="text-sm font-medium">{t("unavailable") ?? "Plan de cabine indisponible"}</span>
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onSkip}>
            {t("skip")}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const { rows, columns, seats } = query.data;
  const seatByNumber = new Map(seats.map((s) => [s.seatNumber, s]));

  // Déterminer où placer l'allée (généralement au milieu des colonnes)
  const halfColumns = Math.ceil(columns.length / 2);

  return (
    <div className="space-y-6">
      {/* En-tête simplifié (sans CardHeader lourd) */}
      <div className="space-y-1">
        <h2 className="text-lg font-bold tracking-tight text-foreground">{t("title")}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t("instructions", { count: seatCount })}
        </p>
      </div>

      {/* Légende épurée */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground bg-slate-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-border/40">
        <span className="flex items-center gap-2">
          <span className="size-3.5 rounded-t-[4px] rounded-b-[2px] border border-border bg-background" />
          {t("legendAvailable")}
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3.5 rounded-t-[4px] rounded-b-[2px] border border-primary/20 bg-primary" />
          {t("legendSelected")}
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3.5 rounded-t-[4px] rounded-b-[2px] bg-muted/60" />
          {t("legendOccupied")}
        </span>
      </div>

      {/* Cabine d'avion */}
      <div className="relative overflow-x-auto rounded-2xl border border-border/40 bg-slate-50/40 dark:bg-zinc-950/20 py-8 px-4 flex justify-center">
        <div className="inline-grid gap-2 min-w-max">
          {/* Grille des sièges */}
          {Array.from({ length: rows }, (_, i) => i + 1).map((row) => (
            <div key={row} className="flex items-center gap-1.5 justify-center">
              {/* Numéro de rangée à gauche */}
              <span className="w-5 shrink-0 text-center text-[10px] font-bold text-muted-foreground/60">
                {row}
              </span>

              {columns.map((column, colIdx) => {
                const seatNumber = `${row}${column}`;
                const seat = seatByNumber.get(seatNumber);
                const selected = selectedSeats.includes(seatNumber);
                const available = seat?.available ?? false;

                const isAisle = colIdx === halfColumns;

                return (
                  <div key={seatNumber} className="flex items-center">
                    {/* Espacement de l'allée centrale */}
                    {isAisle && <div className="w-6 sm:w-8" />}

                    <button
                      type="button"
                      disabled={!available}
                      onClick={() => toggleSeat(seatNumber, available)}
                      aria-pressed={selected}
                      className={cn(
                        // Forme ergonomique inspirée d'un vrai siège d'avion
                        "flex size-8 shrink-0 items-center justify-center text-[10px] font-bold transition-all",
                        "rounded-t-[7px] rounded-b-[4px] border-b-2 active:scale-95",
                        
                        // Siège occupé / Indisponible
                        !available && [
                          "cursor-not-allowed border-transparent bg-muted/40 text-muted-foreground/30",
                          "border-b-muted/20"
                        ],
                        
                        // Siège disponible (non sélectionné)
                        available && !selected && [
                          "border-border bg-background text-foreground hover:bg-accent hover:border-accent-foreground/20",
                          "border-b-slate-300 dark:border-b-zinc-700 shadow-xs"
                        ],
                        
                        // Siège sélectionné
                        selected && [
                          "border-primary bg-primary text-primary-foreground",
                          "border-b-primary-dark shadow-sm scale-102 font-extrabold"
                        ]
                      )}
                    >
                      {column}
                    </button>
                  </div>
                );
              })}

              {/* Numéro de rangée à droite pour l'équilibre */}
              <span className="w-5 shrink-0 text-center text-[10px] font-bold text-muted-foreground/60">
                {row}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Barre d'actions du bas */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">
            {selectedSeats.length > 0 ? selectedSeats.join(", ") : "Aucun sélectionné"}
          </span>
          <span className="text-xs text-muted-foreground">
            {t("selectedCount", { selected: selectedSeats.length, total: seatCount })}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="ghost" 
            className="rounded-xl text-muted-foreground hover:text-foreground"
            onClick={onSkip}
          >
            {t("skip")}
          </Button>
          <Button 
            type="button" 
            className="rounded-xl shadow-sm px-5"
            onClick={onContinue} 
            disabled={selectedSeats.length === 0}
          >
            {t("continue")}
          </Button>
        </div>
      </div>
    </div>
  );
}