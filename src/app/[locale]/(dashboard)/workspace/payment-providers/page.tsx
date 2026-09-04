"use client";

import { useState } from "react";
import { CreditCard, Loader2, Plus, Power } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { normalizeApiError } from "@/lib/api/client";
import type { PaymentMethod, PaymentProviderRouteResponse } from "@/lib/api/types";
import {
    useAvailablePaymentProvidersQuery,
    useCreatePaymentProviderRouteMutation,
    usePaymentProviderRoutesQuery,
    useUpdatePaymentProviderRouteMutation,
} from "@/hooks/use-admin";

const PAYMENT_METHODS: PaymentMethod[] = ["CARD", "MOBILE_MONEY", "GOOGLE_PAY", "APPLE_PAY", "PAYPAL"];

interface FormState {
    countryCode: string;
    paymentMethod: PaymentMethod;
    providerName: string;
}

const EMPTY_FORM: FormState = { countryCode: "", paymentMethod: "CARD", providerName: "" };

export default function AdminPaymentProvidersPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);

    const { data: routes, isLoading, isError } = usePaymentProviderRoutesQuery();
    const { data: availableProviders } = useAvailablePaymentProvidersQuery();
    const createMutation = useCreatePaymentProviderRouteMutation();
    const updateMutation = useUpdatePaymentProviderRouteMutation();

    function openCreateDialog() {
        setForm({ ...EMPTY_FORM, providerName: availableProviders?.[0] ?? "" });
        setIsDialogOpen(true);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        createMutation.mutate(
            {
                countryCode: form.countryCode.trim() === "" ? null : form.countryCode.trim().toUpperCase(),
                paymentMethod: form.paymentMethod,
                providerName: form.providerName,
            },
            {
                onSuccess: () => {
                    toast.success("Règle de routage ajoutée.");
                    setIsDialogOpen(false);
                },
                onError: (error) => toast.error(normalizeApiError(error).message),
            }
        );
    }

    function toggleActive(route: PaymentProviderRouteResponse) {
        updateMutation.mutate(
            { id: route.id, payload: { active: !route.active } },
            {
                onSuccess: () => toast.success(route.active ? "Règle désactivée." : "Règle réactivée."),
                onError: (error) => toast.error(normalizeApiError(error).message),
            }
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground">Administration Système</span>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <CreditCard className="size-6 text-primary" />
                        Fournisseurs de paiement
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                        Choisissez quel fournisseur traite chaque moyen de paiement, pays par pays (ex : Flutterwave
                        pour les cartes au Cameroun, un autre opérateur pour le mobile money). Une règle sans pays
                        s&apos;applique par défaut partout où aucune règle plus précise n&apos;existe.
                    </p>
                </div>

                <Button onClick={openCreateDialog} className="rounded-xl font-bold text-xs gap-2 h-9 shrink-0">
                    <Plus className="size-4" />
                    Ajouter une règle
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-2xl border bg-card text-card-foreground shadow-xs overflow-hidden">
                {isLoading ? (
                    <div className="p-6 space-y-4 animate-pulse">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-10 w-full bg-muted rounded-lg" />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="p-6 text-sm text-destructive font-medium">
                        Erreur lors du chargement des règles de routage.
                    </div>
                ) : !routes || routes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mb-4 border border-border/50">
                            <CreditCard className="size-7" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground">Aucune règle de routage</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1">
                            Sans règle, tous les paiements passent par le fournisseur par défaut (Flutterwave).
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">Pays</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                                    Moyen de paiement
                                </TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                                    Fournisseur
                                </TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">Statut</TableHead>
                                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {routes.map((route) => {
                                const isToggling = updateMutation.isPending && updateMutation.variables?.id === route.id;
                                return (
                                    <TableRow key={route.id} className="group transition-colors hover:bg-muted/30">
                                        <TableCell className="text-sm font-semibold">
                                            {route.countryCode ?? (
                                                <span className="text-muted-foreground font-normal italic">Par défaut</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground font-mono">
                                            {route.paymentMethod}
                                        </TableCell>
                                        <TableCell className="text-sm font-semibold">{route.providerName}</TableCell>
                                        <TableCell>
                                            <Badge variant={route.active ? "success" : "outline"} className="rounded-full">
                                                {route.active ? "Actif" : "Inactif"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={isToggling}
                                                onClick={() => toggleActive(route)}
                                                className={
                                                    route.active
                                                        ? "h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-rose-600 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-700"
                                                        : "h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700"
                                                }
                                            >
                                                {isToggling ? (
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                ) : (
                                                    <Power className="size-3.5" />
                                                )}
                                                {route.active ? "Désactiver" : "Réactiver"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Dialogue de création */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Ajouter une règle de routage</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="countryCode">Pays (code ISO2, vide = règle par défaut)</Label>
                            <Input
                                id="countryCode"
                                maxLength={2}
                                value={form.countryCode}
                                onChange={(e) => setForm((prev) => ({ ...prev, countryCode: e.target.value }))}
                                placeholder="ex: CM (laisser vide pour tous les pays)"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Moyen de paiement *</Label>
                            <Select
                                value={form.paymentMethod}
                                onValueChange={(value) => setForm((prev) => ({ ...prev, paymentMethod: value as PaymentMethod }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAYMENT_METHODS.map((method) => (
                                        <SelectItem key={method} value={method}>
                                            {method}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Fournisseur *</Label>
                            <Select
                                value={form.providerName}
                                onValueChange={(value) => setForm((prev) => ({ ...prev, providerName: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir un fournisseur" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(availableProviders ?? []).map((provider) => (
                                        <SelectItem key={provider} value={provider}>
                                            {provider}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                                Annuler
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending || !form.providerName} className="rounded-xl gap-2">
                                {createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                                Ajouter
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
