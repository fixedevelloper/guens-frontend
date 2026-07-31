"use client";

import { useState } from "react";
import { Loader2, Pencil, PieChart, Plus, Power } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { normalizeApiError } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import { useLocale } from "next-intl";
import type { ShareholderResponse } from "@/lib/api/types";
import {
    useCreateShareholderMutation,
    useShareholdersQuery,
    useUpdateShareholderMutation,
} from "@/hooks/use-admin";

interface FormState {
    name: string;
    percentage: string;
}

const EMPTY_FORM: FormState = { name: "", percentage: "" };

export default function AdminShareholdersPage() {
    const locale = useLocale();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingShareholder, setEditingShareholder] = useState<ShareholderResponse | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);

    const { data: shareholders, isLoading, isError } = useShareholdersQuery();
    const createMutation = useCreateShareholderMutation();
    const updateMutation = useUpdateShareholderMutation();
    const isSaving = createMutation.isPending || updateMutation.isPending;

    const activeTotal = (shareholders ?? [])
        .filter((s) => s.active)
        .reduce((sum, s) => sum + Number(s.percentage), 0);

    function openCreateDialog() {
        setEditingShareholder(null);
        setForm(EMPTY_FORM);
        setIsDialogOpen(true);
    }

    function openEditDialog(shareholder: ShareholderResponse) {
        setEditingShareholder(shareholder);
        setForm({ name: shareholder.name, percentage: String(shareholder.percentage) });
        setIsDialogOpen(true);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const percentage = parseFloat(form.percentage);

        const mutation = editingShareholder
            ? updateMutation.mutateAsync({
                  id: editingShareholder.id,
                  payload: { name: form.name, percentage },
              })
            : createMutation.mutateAsync({ name: form.name, percentage });

        mutation
            .then(() => {
                toast.success(editingShareholder ? "Actionnaire mis à jour." : "Actionnaire ajouté.");
                setIsDialogOpen(false);
            })
            .catch((error) => {
                toast.error(normalizeApiError(error).message);
            });
    }

    function toggleActive(shareholder: ShareholderResponse) {
        updateMutation.mutate(
            { id: shareholder.id, payload: { active: !shareholder.active } },
            {
                onSuccess: () =>
                    toast.success(shareholder.active ? "Actionnaire désactivé." : "Actionnaire réactivé."),
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
                        <PieChart className="size-6 text-primary" />
                        Actionnaires
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                        Chaque commission gagnée sur une réservation est automatiquement répartie entre les
                        actionnaires actifs selon leur pourcentage - indépendamment de tout compte
                        utilisateur, revendeur ou partenaire.
                    </p>
                </div>

                <Button onClick={openCreateDialog} className="rounded-xl font-bold text-xs gap-2 h-9 shrink-0">
                    <Plus className="size-4" />
                    Ajouter un actionnaire
                </Button>
            </div>

            {/* Total attribué */}
            {shareholders && shareholders.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Part active attribuée :</span>
                    <Badge
                        variant={activeTotal > 100 ? "destructive" : "secondary"}
                        className="rounded-full font-bold"
                    >
                        {activeTotal}% / 100%
                    </Badge>
                </div>
            )}

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
                        Erreur lors du chargement des actionnaires.
                    </div>
                ) : !shareholders || shareholders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mb-4 border border-border/50">
                            <PieChart className="size-7" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground">Aucun actionnaire enregistré</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1">
                            Ajoutez un actionnaire pour commencer à répartir les commissions gagnées.
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">Nom</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                                    Pourcentage
                                </TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">Statut</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                                    Solde perçu
                                </TableHead>
                                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shareholders.map((shareholder) => {
                                const isToggling =
                                    updateMutation.isPending && updateMutation.variables?.id === shareholder.id;
                                return (
                                    <TableRow key={shareholder.id} className="group transition-colors hover:bg-muted/30">
                                        <TableCell className="font-semibold text-sm">{shareholder.name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground font-mono">
                                            {shareholder.percentage}%
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={shareholder.active ? "success" : "outline"}
                                                className="rounded-full"
                                            >
                                                {shareholder.active ? "Actif" : "Inactif"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {shareholder.balance.length > 0
                                                ? shareholder.balance
                                                      .map((m) => formatMoney(m, locale))
                                                      .join(" / ")
                                                : "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditDialog(shareholder)}
                                                    className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium"
                                                >
                                                    <Pencil className="size-3.5" />
                                                    Modifier
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isToggling}
                                                    onClick={() => toggleActive(shareholder)}
                                                    className={
                                                        shareholder.active
                                                            ? "h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-rose-600 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-700"
                                                            : "h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700"
                                                    }
                                                >
                                                    {isToggling ? (
                                                        <Loader2 className="size-3.5 animate-spin" />
                                                    ) : (
                                                        <Power className="size-3.5" />
                                                    )}
                                                    {shareholder.active ? "Désactiver" : "Réactiver"}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Dialogue de création/édition */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingShareholder ? "Modifier l'actionnaire" : "Ajouter un actionnaire"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom *</Label>
                            <Input
                                id="name"
                                required
                                value={form.name}
                                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="ex: Jean Dupont"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="percentage">Pourcentage *</Label>
                            <Input
                                id="percentage"
                                type="number"
                                min={0}
                                max={100}
                                step="0.01"
                                required
                                value={form.percentage}
                                onChange={(e) => setForm((prev) => ({ ...prev, percentage: e.target.value }))}
                                placeholder="ex: 30"
                            />
                        </div>

                        {editingShareholder && (
                            <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
                                <Label htmlFor="active" className="text-sm font-medium">
                                    Actionnaire actif
                                </Label>
                                <Switch
                                    id="active"
                                    checked={editingShareholder.active}
                                    onCheckedChange={(checked) => {
                                        updateMutation.mutate(
                                            { id: editingShareholder.id, payload: { active: checked } },
                                            {
                                                onSuccess: (updated) => setEditingShareholder(updated),
                                            }
                                        );
                                    }}
                                />
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isSaving} className="rounded-xl gap-2">
                                {isSaving && <Loader2 className="size-4 animate-spin" />}
                                {editingShareholder ? "Enregistrer" : "Ajouter"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
