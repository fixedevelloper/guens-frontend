"use client";

import { useState } from "react";
import { CalendarDays, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import {
    useFareAvailabilityQuery,
    useUpsertFareAvailabilityMutation,
} from "@/hooks/use-partner-queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}
function inDaysISO(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

interface AvailabilityManagerProps {
    partnerId: string;
    fareId: string;
}

export function AvailabilityManager({ partnerId, fareId }: AvailabilityManagerProps) {
    const [range] = useState({ from: todayISO(), to: inDaysISO(30) });
    const { data: availability, isLoading } = useFareAvailabilityQuery(partnerId, fareId, range.from, range.to);
    const upsertMutation = useUpsertFareAvailabilityMutation(partnerId, fareId);

    const [form, setForm] = useState({ flightDate: todayISO(), seatsAvailable: "" });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        upsertMutation.mutate(
            { flightDate: form.flightDate, seatsAvailable: Number(form.seatsAvailable) },
            {
                onSuccess: () => {
                    toast.success("Disponibilité mise à jour.");
                    setForm({ flightDate: todayISO(), seatsAvailable: "" });
                },
                onError: () => toast.error("Erreur lors de la mise à jour."),
            }
        );
    }

    return (
        <Card className="rounded-2xl border-border/60 shadow-xs">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <CalendarDays className="size-4 text-primary" />
                    Disponibilité (30 prochains jours)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-xl border border-border/50 p-4">
                    <div>
                        <Label className="text-xs">Date</Label>
                        <Input
                            type="date"
                            required
                            value={form.flightDate}
                            onChange={(e) => setForm({ ...form, flightDate: e.target.value })}
                            className="h-9 rounded-lg text-xs"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Sièges disponibles</Label>
                        <Input
                            type="number"
                            min={0}
                            required
                            value={form.seatsAvailable}
                            onChange={(e) => setForm({ ...form, seatsAvailable: e.target.value })}
                            className="h-9 rounded-lg text-xs w-32"
                        />
                    </div>
                    <Button type="submit" size="sm" disabled={upsertMutation.isPending} className="gap-1.5 rounded-xl text-xs h-9">
                        {upsertMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                        Définir
                    </Button>
                </form>

                {isLoading ? (
                    <p className="text-xs text-muted-foreground">Chargement…</p>
                ) : !availability || availability.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Aucune disponibilité définie sur cette période.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-xs">Date</TableHead>
                                <TableHead className="text-xs">Sièges</TableHead>
                                <TableHead className="text-xs">Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {availability.map((a) => (
                                <TableRow key={a.id}>
                                    <TableCell className="text-xs font-medium">{a.flightDate}</TableCell>
                                    <TableCell className="text-xs">{a.seatsAvailable}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{a.status}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}