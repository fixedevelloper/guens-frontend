"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Ticket } from "lucide-react";
import { toast } from "sonner";

import {
    useFaresQuery,
    useCreateFareMutation,
    useDeleteFareMutation,
} from "@/hooks/use-partner-queries";
import type { CabinClass } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const CABIN_LABELS: Record<CabinClass, string> = {
    ECONOMY: "Économique",
    PREMIUM_ECONOMY: "Premium Économique",
    BUSINESS: "Affaires",
    FIRST: "Première",
};

interface FareManagerProps {
    partnerId: string;
    flightId: string;
    onSelectFare?: (fareId: string) => void;
    selectedFareId?: string | null;
}

export function FareManager({ partnerId, flightId, onSelectFare, selectedFareId }: FareManagerProps) {
    const { data: fares, isLoading } = useFaresQuery(partnerId, flightId);
    const createMutation = useCreateFareMutation(partnerId, flightId);
    const deleteMutation = useDeleteFareMutation(partnerId, flightId);

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        cabinClass: "ECONOMY" as CabinClass,
        basePrice: "",
        currency: "XAF",
        baggageAllowanceKg: "",
        totalSeats: "",
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        createMutation.mutate(
            {
                cabinClass: form.cabinClass,
                basePrice: Number(form.basePrice),
                currency: form.currency,
                baggageAllowanceKg: Number(form.baggageAllowanceKg),
                totalSeats: Number(form.totalSeats),
            },
            {
                onSuccess: () => {
                    toast.success("Tarif ajouté.");
                    setShowForm(false);
                    setForm({ cabinClass: "ECONOMY", basePrice: "", currency: "XAF", baggageAllowanceKg: "", totalSeats: "" });
                },
                onError: () => toast.error("Erreur lors de l'ajout du tarif."),
            }
        );
    }

    function handleDelete(fareId: string) {
        if (!window.confirm("Supprimer ce tarif ? Les disponibilités associées seront aussi supprimées.")) return;
        deleteMutation.mutate(fareId, {
            onSuccess: () => toast.info("Tarif supprimé."),
            onError: () => toast.error("Erreur lors de la suppression."),
        });
    }

    return (
        <Card className="rounded-2xl border-border/60 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Ticket className="size-4 text-primary" />
                    Tarifs par classe
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)} className="gap-1.5 rounded-xl text-xs h-8">
                    <Plus className="size-3.5" />
                    Ajouter
                </Button>
            </CardHeader>
            <CardContent className="space-y-3">
                {showForm && (
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 rounded-xl border border-border/50 p-4 sm:grid-cols-4">
                        <div className="col-span-2 sm:col-span-1">
                            <Label className="text-xs">Classe</Label>
                            <Select value={form.cabinClass} onValueChange={(v) => setForm({ ...form, cabinClass: v as CabinClass })}>
                                <SelectTrigger className="h-9 rounded-lg text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(CABIN_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value} className="text-xs">
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Prix de base</Label>
                            <Input type="number" min={0} required value={form.basePrice}
                                   onChange={(e) => setForm({ ...form, basePrice: e.target.value })} className="h-9 rounded-lg text-xs" />
                        </div>
                        <div>
                            <Label className="text-xs">Devise</Label>
                            <Input required value={form.currency}
                                   onChange={(e) => setForm({ ...form, currency: e.target.value })} className="h-9 rounded-lg text-xs" />
                        </div>
                        <div>
                            <Label className="text-xs">Bagages (kg)</Label>
                            <Input type="number" min={0} required value={form.baggageAllowanceKg}
                                   onChange={(e) => setForm({ ...form, baggageAllowanceKg: e.target.value })} className="h-9 rounded-lg text-xs" />
                        </div>
                        <div>
                            <Label className="text-xs">Sièges totaux</Label>
                            <Input type="number" min={1} required value={form.totalSeats}
                                   onChange={(e) => setForm({ ...form, totalSeats: e.target.value })} className="h-9 rounded-lg text-xs" />
                        </div>
                        <div className="col-span-2 flex items-end gap-2 sm:col-span-4">
                            <Button type="submit" size="sm" disabled={createMutation.isPending} className="rounded-xl text-xs h-9 gap-1.5">
                                {createMutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
                                Enregistrer
                            </Button>
                        </div>
                    </form>
                )}

                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full rounded-xl" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                ) : !fares || fares.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Aucun tarif configuré pour ce vol.</p>
                ) : (
                    <div className="space-y-1.5">
                        {fares.map((fare) => (
                            <button
                                key={fare.id}
                                type="button"
                                onClick={() => onSelectFare?.(fare.id)}
                                className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs transition-colors ${
                                    selectedFareId === fare.id
                                        ? "border-primary bg-primary/5"
                                        : "border-border/50 hover:bg-muted/40"
                                }`}
                            >
                                <div>
                                    <p className="font-bold">{CABIN_LABELS[fare.cabinClass]}</p>
                                    <p className="text-muted-foreground">
                                        {fare.basePrice} {fare.currency} · {fare.totalSeats} sièges · {fare.baggageAllowanceKg}kg bagages
                                    </p>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    disabled={deleteMutation.isPending && deleteMutation.variables === fare.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(fare.id);
                                    }}
                                    className="size-7 rounded-lg text-destructive hover:bg-destructive/10"
                                >
                                    {deleteMutation.isPending && deleteMutation.variables === fare.id ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="size-3.5" />
                                    )}
                                </Button>
                            </button>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}