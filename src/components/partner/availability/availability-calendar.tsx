"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AvailabilityDayInfo {
    status: "available" | "unavailable";
    label: string;
    priceOverride?: number | null;
}

interface AvailabilityCalendarProps {
    month: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
    getDayInfo: (dateISO: string) => AvailabilityDayInfo | undefined;
    onDayClick: (dateISO: string) => void;
    selectedDate?: string | null;
    rangeStart?: string | null;
    rangeEnd?: string | null;
    isLoading?: boolean;
}

const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTH_LABELS = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export function toISODate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function addMonths(date: Date, delta: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

/** Toutes les dates ISO (bornes incluses) entre from et to, dans l'ordre. */
export function eachISODateInRange(fromISO: string, toISO: string): string[] {
    const dates: string[] = [];
    const cursor = new Date(`${fromISO}T00:00:00`);
    const end = new Date(`${toISO}T00:00:00`);
    while (cursor <= end) {
        dates.push(toISODate(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
}

function buildMonthGrid(month: Date): { date: Date; inCurrentMonth: boolean }[] {
    const first = startOfMonth(month);
    const firstWeekday = (first.getDay() + 6) % 7; // Lundi = 0
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - firstWeekday);

    const days: { date: Date; inCurrentMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
        const d = new Date(gridStart);
        d.setDate(gridStart.getDate() + i);
        days.push({ date: d, inCurrentMonth: d.getMonth() === month.getMonth() });
    }
    return days;
}

export function AvailabilityCalendar({
    month,
    onPrevMonth,
    onNextMonth,
    onToday,
    getDayInfo,
    onDayClick,
    selectedDate,
    rangeStart,
    rangeEnd,
    isLoading,
}: AvailabilityCalendarProps) {
    const days = buildMonthGrid(month);
    const todayISO = toISODate(new Date());

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">
                        {MONTH_LABELS[month.getMonth()]} {month.getFullYear()}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg text-xs font-bold px-2.5"
                        onClick={onToday}
                    >
                        Aujourd&apos;hui
                    </Button>
                    <Button type="button" variant="outline" size="icon" className="size-8 rounded-lg" onClick={onPrevMonth}>
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" className="size-8 rounded-lg" onClick={onNextMonth}>
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {WEEKDAY_LABELS.map((label) => (
                    <div key={label} className="py-1">
                        {label}
                    </div>
                ))}
            </div>

            <div className={cn("grid grid-cols-7 gap-1", isLoading && "opacity-50 pointer-events-none")}>
                {days.map(({ date, inCurrentMonth }) => {
                    const iso = toISODate(date);
                    const info = inCurrentMonth ? getDayInfo(iso) : undefined;
                    const isToday = iso === todayISO;
                    const isSelected = iso === selectedDate;
                    const isPast = iso < todayISO;
                    const inRange = Boolean(rangeStart && rangeEnd && iso >= rangeStart && iso <= rangeEnd);

                    if (!inCurrentMonth) {
                        return <div key={iso} className="h-16" />;
                    }

                    return (
                        <button
                            key={iso}
                            type="button"
                            onClick={() => onDayClick(iso)}
                            className={cn(
                                "relative flex flex-col items-center justify-center gap-1 rounded-xl border p-1.5 h-16 text-xs transition-all cursor-pointer",
                                "border-border/50 hover:border-primary/50",
                                isPast && "opacity-40",
                                isSelected && "border-primary ring-2 ring-primary/30",
                                inRange && !isSelected && "bg-primary/5 border-primary/30",
                                isToday && "bg-primary/5"
                            )}
                        >
                            <span className={cn("font-bold", isToday ? "text-primary" : "text-foreground")}>
                                {date.getDate()}
                            </span>
                            {info && (
                                <span
                                    className={cn(
                                        "rounded-md px-1.5 py-0.5 text-[10px] font-bold leading-none",
                                        info.status === "available"
                                            ? "bg-emerald-500/10 text-emerald-600"
                                            : "bg-red-500/10 text-red-600"
                                    )}
                                >
                                    {info.label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
