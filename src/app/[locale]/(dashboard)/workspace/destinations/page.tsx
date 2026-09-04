"use client";

import { useState } from "react";
import {
    Loader2,
    MapPin,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
    EyeOff,
} from "lucide-react";
import { toast } from "sonner";

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
import type { FeaturedDestinationAdminResponse, FeaturedDestinationUpsertRequest } from "@/lib/api/types";
import {
    useAdminDestinationsQuery,
    useCreateDestinationMutation,
    useDeleteDestinationMutation,
    useRefreshDestinationsFromBookingsMutation,
    useUpdateDestinationMutation,
} from "@/hooks/use-admin";

const EMPTY_FORM: FeaturedDestinationUpsertRequest = {
    cityName: "",
    countryName: "",
    destinationCode: "",
    imageUrl: "",
    displayOrder: 0,
    active: true,
};

export default function AdminDestinationsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDestination, setEditingDestination] = useState<FeaturedDestinationAdminResponse | null>(null);
    const [form, setForm] = useState<FeaturedDestinationUpsertRequest>(EMPTY_FORM);

    const { data, isLoading } = useAdminDestinationsQuery();
    const createMutation = useCreateDestinationMutation();
    const updateMutation = useUpdateDestinationMutation();
    const deleteMutation = useDeleteDestinationMutation();
    const refreshMutation = useRefreshDestinationsFromBookingsMutation();

    const destinations = data ?? [];
    const isSaving = createMutation.isPending || updateMutation.isPending;

    function openCreateDialog() {
        setEditingDestination(null);
        setForm({ ...EMPTY_FORM, displayOrder: destinations.length });
        setIsDialogOpen(true);
    }

    function openEditDialog(destination: FeaturedDestinationAdminResponse) {
        setEditingDestination(destination);
        setForm({
            cityName: destination.cityName,
            countryName: destination.countryName,
            destinationCode: destination.destinationCode ?? "",
            imageUrl: destination.imageUrl ?? "",
            displayOrder: destination.displayOrder,
            active: destination.active,
        });
        setIsDialogOpen(true);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const payload: FeaturedDestinationUpsertRequest = {
            ...form,
            destinationCode: form.destinationCode?.trim() || undefined,
            imageUrl: form.imageUrl?.trim() || undefined,
        };

        const mutation = editingDestination
            ? updateMutation.mutateAsync({ id: editingDestination.id, payload })
            : createMutation.mutateAsync(payload);

        mutation
            .then(() => {
                toast.success(editingDestination ? "Destination mise à jour." : "Destination ajoutée.");
                setIsDialogOpen(false);
            })
            .catch((error) => {
                const message = error?.response?.data?.message ?? "Une erreur est survenue.";
                toast.error(message);
            });
    }

    function handleDelete(destination: FeaturedDestinationAdminResponse) {
        if (!window.confirm(`Retirer "${destination.cityName}, ${destination.countryName}" des destinations mises en avant ?`)) {
            return;
        }
        deleteMutation.mutate(destination.id, {
            onError: () => toast.error("Impossible de supprimer cette destination."),
        });
    }

    function handleRefresh() {
        refreshMutation.mutate(undefined, {
            onSuccess: (result) => {
                toast.success(
                    result.added > 0
                        ? `${result.added} nouvelle(s) destination(s) suggérée(s) à partir des réservations.`
                        : "Aucune nouvelle destination à suggérer pour le moment."
                );
            },
            onError: () => toast.error("Impossible de lancer la suggestion automatique."),
        });
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground">Administration Système</span>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <MapPin className="size-6 text-primary" />
                        Destinations mises en avant
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                        Affichées sur la page d&apos;accueil. Suggérées automatiquement à partir des réservations de
                        vol les plus fréquentes, puis modifiables ici (image, ordre, visibilité).
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={refreshMutation.isPending}
                        className="rounded-xl font-bold text-xs gap-2 h-9"
                    >
                        {refreshMutation.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <RefreshCw className="size-4" />
                        )}
                        Suggérer depuis les réservations
                    </Button>
                    <Button onClick={openCreateDialog} className="rounded-xl font-bold text-xs gap-2 h-9">
                        <Plus className="size-4" />
                        Ajouter
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border bg-card text-card-foreground shadow-xs overflow-hidden">
                {isLoading ? (
                    <div className="p-6 space-y-4 animate-pulse">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-10 w-full bg-muted rounded-lg" />
                        ))}
                    </div>
                ) : destinations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mb-4 border border-border/50">
                            <MapPin className="size-7" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground">Aucune destination enregistrée</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1">
                            Ajoutez-en une manuellement, ou lancez la suggestion automatique à partir des réservations.
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">Ordre</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">Ville</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">Pays</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">Code</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wider">Statut</TableHead>
                                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {destinations.map((destination) => {
                                const isDeleting = deleteMutation.isPending && deleteMutation.variables === destination.id;
                                return (
                                    <TableRow key={destination.id} className="group transition-colors hover:bg-muted/30">
                                        <TableCell className="text-sm text-muted-foreground font-mono">
                                            {destination.displayOrder}
                                        </TableCell>
                                        <TableCell className="font-semibold text-sm">
                                            <div className="flex items-center gap-2">
                                                {destination.imageUrl ? (
                                                    <span
                                                        className="size-8 shrink-0 rounded-lg bg-cover bg-center border border-border/40"
                                                        style={{ backgroundImage: `url('${destination.imageUrl}')` }}
                                                    />
                                                ) : (
                                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground border border-border/40">
                                                        <MapPin className="size-3.5" />
                                                    </span>
                                                )}
                                                {destination.cityName}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{destination.countryName}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground font-mono">
                                            {destination.destinationCode ?? "—"}
                                        </TableCell>
                                        <TableCell>
                                            {destination.active ? (
                                                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                    Visible
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-800 dark:text-slate-400">
                                                    <EyeOff className="size-3" />
                                                    Masquée
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditDialog(destination)}
                                                    className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium"
                                                >
                                                    <Pencil className="size-3.5" />
                                                    Modifier
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isDeleting}
                                                    onClick={() => handleDelete(destination)}
                                                    className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-rose-600 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-700"
                                                >
                                                    {isDeleting ? (
                                                        <Loader2 className="size-3.5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="size-3.5" />
                                                    )}
                                                    Supprimer
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
                        <DialogTitle>{editingDestination ? "Modifier la destination" : "Ajouter une destination"}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cityName">Ville *</Label>
                            <Input
                                id="cityName"
                                required
                                value={form.cityName}
                                onChange={(e) => setForm((prev) => ({ ...prev, cityName: e.target.value }))}
                                placeholder="ex: Paris"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="countryName">Pays *</Label>
                            <Input
                                id="countryName"
                                required
                                value={form.countryName}
                                onChange={(e) => setForm((prev) => ({ ...prev, countryName: e.target.value }))}
                                placeholder="ex: France"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="destinationCode">Code aéroport/ville (IATA)</Label>
                            <Input
                                id="destinationCode"
                                value={form.destinationCode ?? ""}
                                onChange={(e) => setForm((prev) => ({ ...prev, destinationCode: e.target.value.toUpperCase() }))}
                                placeholder="ex: CDG"
                                maxLength={10}
                            />
                            <p className="text-xs text-muted-foreground">
                                Utilisé pour pointer directement vers la recherche de vols pour cette ville. Laissez
                                vide si aucun code ne correspond.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">URL de l&apos;image</Label>
                            <Input
                                id="imageUrl"
                                type="url"
                                value={form.imageUrl ?? ""}
                                onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="displayOrder">Ordre d&apos;affichage</Label>
                                <Input
                                    id="displayOrder"
                                    type="number"
                                    value={form.displayOrder}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, displayOrder: parseInt(e.target.value, 10) || 0 }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="active">Visible sur le site</Label>
                                <div className="flex h-9 items-center">
                                    <Switch
                                        id="active"
                                        checked={form.active}
                                        onCheckedChange={(checked) => setForm((prev) => ({ ...prev, active: checked }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                className="rounded-xl"
                            >
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isSaving} className="rounded-xl gap-2">
                                {isSaving && <Loader2 className="size-4 animate-spin" />}
                                {editingDestination ? "Enregistrer" : "Ajouter"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
