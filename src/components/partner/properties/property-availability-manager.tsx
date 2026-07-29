"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarRange, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { usePropertyAvailabilityQuery, useUpsertPropertyAvailabilityMutation } from "@/hooks/use-partner-queries";
import { upsertPropertyAvailability } from "@/lib/api/partner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    AvailabilityCalendar,
    addMonths,
    eachISODateInRange,
    endOfMonth,
    startOfMonth,
    toISODate,
    type AvailabilityDayInfo,
} from "@/components/partner/availability/availability-calendar";

const MAX_BULK_DAYS = 90;

interface PropertyAvailabilityManagerProps {
    partnerId: string;
    propertyId: string;
}

export function PropertyAvailabilityManager({ partnerId, propertyId }: PropertyAvailabilityManagerProps) {
    const queryClient = useQueryClient();
    const [month, setMonth] = useState(() => startOfMonth(new Date()));
    const monthFrom = toISODate(startOfMonth(month));
    const monthTo = toISODate(endOfMonth(month));

    const { data: availability, isLoading } = usePropertyAvailabilityQuery(partnerId, propertyId, monthFrom, monthTo);
    const upsertMutation = useUpsertPropertyAvailabilityMutation(partnerId, propertyId);

    const byDate = useMemo(() => {
        const map = new Map<string, { isAvailable: boolean; priceOverride: number | null }>();
        for (const a of availability ?? []) {
            map.set(a.stayDate, { isAvailable: a.isAvailable, priceOverride: a.priceOverride });
        }
        return map;
    }, [availability]);

    function getDayInfo(dateISO: string): AvailabilityDayInfo | undefined {
        const entry = byDate.get(dateISO);
        if (!entry) return undefined;
        return {
            status: entry.isAvailable ? "available" : "unavailable",
            label: entry.isAvailable ? "Ouvert" : "Fermé",
            priceOverride: entry.priceOverride,
        };
    }

    // --- Édition d'un jour précis ---
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [dayValue, setDayValue] = useState(true);

    function handleDayClick(dateISO: string) {
        setSelectedDate(dateISO);
        setDayValue(byDate.get(dateISO)?.isAvailable ?? true);
        setBulkMode(false);
    }

    function handleSaveDay(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedDate) return;
        upsertMutation.mutate(
            { stayDate: selectedDate, isAvailable: dayValue },
            {
                onSuccess: () => {
                    toast.success("Disponibilité mise à jour.");
                    setSelectedDate(null);
                },
                onError: () => toast.error("Erreur lors de la mise à jour."),
            }
        );
    }

    // --- Modification groupée sur une période ---
    const [bulkMode, setBulkMode] = useState(false);
    const [rangeFrom, setRangeFrom] = useState("");
    const [rangeTo, setRangeTo] = useState("");
    const [bulkValue, setBulkValue] = useState(true);
    const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

    function openBulkMode() {
        setSelectedDate(null);
        setBulkMode(true);
        setRangeFrom(monthFrom);
        setRangeTo(monthTo);
        setBulkValue(true);
    }

    async function handleApplyBulk(e: React.FormEvent) {
        e.preventDefault();
        if (!rangeFrom || !rangeTo || rangeFrom > rangeTo) {
            toast.error("Sélectionnez une période valide.");
            return;
        }

        const dates = eachISODateInRange(rangeFrom, rangeTo);
        if (dates.length > MAX_BULK_DAYS) {
            toast.error(`La période sélectionnée dépasse ${MAX_BULK_DAYS} jours. Réduisez-la.`);
            return;
        }

        setBulkProgress({ done: 0, total: dates.length });

        let failures = 0;
        for (let i = 0; i < dates.length; i++) {
            try {
                await upsertPropertyAvailability(partnerId, propertyId, { stayDate: dates[i], isAvailable: bulkValue });
            } catch {
                failures++;
            }
            setBulkProgress({ done: i + 1, total: dates.length });
        }

        await queryClient.invalidateQueries({ queryKey: ["partner-property-availability", partnerId, propertyId] });
        setBulkProgress(null);

        if (failures === 0) {
            toast.success(`Disponibilité appliquée sur ${dates.length} jour(s).`);
            setBulkMode(false);
        } else {
            toast.error(`${failures} jour(s) sur ${dates.length} n'ont pas pu être mis à jour.`);
        }
    }

    return (
        <Card className="rounded-2xl border-border/60 shadow-xs">
            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold">Calendrier de disponibilité</CardTitle>
                <Button
                    type="button"
                    variant={bulkMode ? "default" : "outline"}
                    size="sm"
                    className="h-8 rounded-lg text-xs font-bold gap-1.5"
                    onClick={() => (bulkMode ? setBulkMode(false) : openBulkMode())}
                >
                    <CalendarRange className="size-3.5" />
                    Modification groupée
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <AvailabilityCalendar
                    month={month}
                    onPrevMonth={() => setMonth((m) => addMonths(m, -1))}
                    onNextMonth={() => setMonth((m) => addMonths(m, 1))}
                    onToday={() => setMonth(startOfMonth(new Date()))}
                    getDayInfo={getDayInfo}
                    onDayClick={handleDayClick}
                    selectedDate={selectedDate}
                    rangeStart={bulkMode ? rangeFrom : null}
                    rangeEnd={bulkMode ? rangeTo : null}
                    isLoading={isLoading}
                />

                {selectedDate && !bulkMode && (
                    <form
                        onSubmit={handleSaveDay}
                        className="flex flex-wrap items-end gap-3 rounded-xl border border-primary/30 bg-primary/[0.03] p-4"
                    >
                        <div>
                            <Label className="text-xs">Date</Label>
                            <p className="h-9 flex items-center text-sm font-bold">{selectedDate}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="text-xs">Disponible</Label>
                            <Switch checked={dayValue} onCheckedChange={setDayValue} />
                        </div>
                        <Button type="submit" size="sm" disabled={upsertMutation.isPending} className="gap-1.5 rounded-xl text-xs h-9">
                            {upsertMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                            Enregistrer
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 rounded-xl text-xs h-9"
                            onClick={() => setSelectedDate(null)}
                        >
                            <X className="size-3.5" />
                            Annuler
                        </Button>
                    </form>
                )}

                {bulkMode && (
                    <form
                        onSubmit={handleApplyBulk}
                        className="flex flex-wrap items-end gap-3 rounded-xl border border-primary/30 bg-primary/[0.03] p-4"
                    >
                        <div>
                            <Label className="text-xs">Du</Label>
                            <Input
                                type="date"
                                required
                                value={rangeFrom}
                                onChange={(e) => setRangeFrom(e.target.value)}
                                className="h-9 rounded-lg text-xs"
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Au</Label>
                            <Input
                                type="date"
                                required
                                value={rangeTo}
                                onChange={(e) => setRangeTo(e.target.value)}
                                className="h-9 rounded-lg text-xs"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="text-xs">Disponible</Label>
                            <Switch checked={bulkValue} onCheckedChange={setBulkValue} />
                        </div>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={bulkProgress !== null}
                            className="gap-1.5 rounded-xl text-xs h-9"
                        >
                            {bulkProgress ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    {bulkProgress.done}/{bulkProgress.total}
                                </>
                            ) : (
                                <>
                                    <Check className="size-3.5" />
                                    Appliquer à la période
                                </>
                            )}
                        </Button>
                    </form>
                )}

                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-sm bg-emerald-500/40" /> Disponible
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-sm bg-red-500/40" /> Fermé
                    </span>
                    <span>Cliquez sur un jour pour définir sa disponibilité.</span>
                </div>
            </CardContent>
        </Card>
    );
}
