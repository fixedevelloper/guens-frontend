"use client";

import { useState } from "react";
import {
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    ArrowUpDown,
    Building2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    MapPin,
    Pencil,
    Plus,
    Search,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { HotelCityAdminResponse, HotelCityUpsertRequest } from "@/lib/api/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
    useAdminCitiesQuery,
    useCreateCityMutation,
    useDeleteCityMutation,
    useUpdateCityMutation,
} from "@/hooks/use-admin";

const EMPTY_FORM: HotelCityUpsertRequest = {
    cityName: "",
    countryName: "",
    latitude: 0,
    longitude: 0,
};

type SortField = "cityName" | "countryName";
type SortDirection = "asc" | "desc";

const SORTABLE_COLUMNS: { field: SortField; label: string }[] = [
    { field: "cityName", label: "Ville" },
    { field: "countryName", label: "Pays" },
];

export default function AdminCitiesPage() {
    const [page, setPage] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const [sortField, setSortField] = useState<SortField>("cityName");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCity, setEditingCity] = useState<HotelCityAdminResponse | null>(null);
    const [form, setForm] = useState<HotelCityUpsertRequest>(EMPTY_FORM);

    const debouncedSearch = useDebouncedValue(searchInput, 300).trim();

    const { data, isLoading, isFetching } = useAdminCitiesQuery(page, {
        q: debouncedSearch,
        sort: `${sortField},${sortDirection}`,
    });
    const createMutation = useCreateCityMutation();
    const updateMutation = useUpdateCityMutation();
    const deleteMutation = useDeleteCityMutation();

    const cities = data?.content ?? [];
    const isSaving = createMutation.isPending || updateMutation.isPending;

    function handleSearchChange(value: string) {
        setSearchInput(value);
        setPage(0);
    }

    function handleSort(field: SortField) {
        if (field === sortField) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
        setPage(0);
    }

    function openCreateDialog() {
        setEditingCity(null);
        setForm(EMPTY_FORM);
        setIsDialogOpen(true);
    }

    function openEditDialog(city: HotelCityAdminResponse) {
        setEditingCity(city);
        setForm({
            cityName: city.cityName,
            countryName: city.countryName,
            latitude: city.latitude,
            longitude: city.longitude,
        });
        setIsDialogOpen(true);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const mutation = editingCity
            ? updateMutation.mutateAsync({ id: editingCity.id, payload: form })
            : createMutation.mutateAsync(form);

        mutation
            .then(() => {
                toast.success(editingCity ? "Ville mise à jour." : "Ville ajoutée.");
                setIsDialogOpen(false);
            })
            .catch((error) => {
                const message = error?.response?.data?.message ?? "Une erreur est survenue.";
                toast.error(message);
            });
    }

    function handleDelete(city: HotelCityAdminResponse) {
        if (!window.confirm(`Supprimer "${city.cityName}, ${city.countryName}" ? Cette action est irréversible.`)) {
            return;
        }
        deleteMutation.mutate(city.id, {
            onError: () => toast.error("Impossible de supprimer cette ville."),
        });
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* Header & Fil d'ariane */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            asChild
                            className="size-8 rounded-xl border-border/60"
                        >
                            <Link href="/admin/geo/sync">
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <span className="text-xs font-semibold text-muted-foreground">
                            Administration Système
                        </span>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <Building2 className="size-6 text-primary" />
                        Villes & Destinations
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Ce référentiel est utilisé pour l&apos;autocomplétion ville lors de la création
                        d&apos;hôtels et de biens meublés par les partenaires.
                    </p>
                </div>

                <Button onClick={openCreateDialog} className="rounded-xl font-bold text-xs gap-2 h-9">
                    <Plus className="size-4" />
                    Ajouter une ville
                </Button>
            </div>

            {/* Recherche */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                    placeholder="Rechercher une ville ou un pays..."
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9"
                />
                {isFetching && !isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
                )}
            </div>

            {/* Table */}
            <div className="rounded-2xl border bg-card text-card-foreground shadow-xs overflow-hidden">
                {isLoading ? (
                    <div className="p-6 space-y-4 animate-pulse">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-10 w-full bg-muted rounded-lg" />
                        ))}
                    </div>
                ) : cities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mb-4 border border-border/50">
                            <MapPin className="size-7" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground">
                            {debouncedSearch ? "Aucune ville trouvée" : "Aucune ville enregistrée"}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1">
                            {debouncedSearch
                                ? `Aucun résultat pour "${debouncedSearch}".`
                                : "Ajoutez une ville manuellement, ou lancez une synchronisation depuis la page précédente."}
                        </p>
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow className="hover:bg-transparent">
                                    {SORTABLE_COLUMNS.map(({ field, label }) => {
                                        const isActive = sortField === field;
                                        const SortIcon = !isActive ? ArrowUpDown : sortDirection === "asc" ? ArrowUp : ArrowDown;
                                        return (
                                            <TableHead key={field} className="text-xs font-semibold uppercase tracking-wider">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSort(field)}
                                                    className={`flex items-center gap-1.5 hover:text-foreground transition-colors ${
                                                        isActive ? "text-foreground" : ""
                                                    }`}
                                                >
                                                    {label}
                                                    <SortIcon className="size-3.5" />
                                                </button>
                                            </TableHead>
                                        );
                                    })}
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider">
                                        Coordonnées
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cities.map((city) => {
                                    const isDeleting = deleteMutation.isPending && deleteMutation.variables === city.id;
                                    return (
                                        <TableRow key={city.id} className="group transition-colors hover:bg-muted/30">
                                            <TableCell className="font-semibold text-sm">{city.cityName}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{city.countryName}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground font-mono">
                                                {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openEditDialog(city)}
                                                        className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium"
                                                    >
                                                        <Pencil className="size-3.5" />
                                                        Modifier
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={isDeleting}
                                                        onClick={() => handleDelete(city)}
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

                        {data && data.totalPages > 1 && (
                            <div className="flex items-center justify-between border-t bg-muted/20 px-6 py-4 text-xs text-muted-foreground">
                                <span>
                                    Page <strong className="text-foreground">{data.number + 1}</strong> sur{" "}
                                    <strong className="text-foreground">{data.totalPages}</strong> —{" "}
                                    <strong className="text-foreground">{data.totalElements}</strong> ville(s) au total
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={page === 0}
                                        onClick={() => setPage((p) => p - 1)}
                                        className="h-8 rounded-lg px-2.5"
                                    >
                                        <ChevronLeft className="size-4 mr-1" />
                                        Précédent
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={page + 1 >= data.totalPages}
                                        onClick={() => setPage((p) => p + 1)}
                                        className="h-8 rounded-lg px-2.5"
                                    >
                                        Suivant
                                        <ChevronRight className="size-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Dialogue de création/édition */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingCity ? "Modifier la ville" : "Ajouter une ville"}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cityName">Ville *</Label>
                            <Input
                                id="cityName"
                                required
                                value={form.cityName}
                                onChange={(e) => setForm((prev) => ({ ...prev, cityName: e.target.value }))}
                                placeholder="ex: Douala"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="countryName">Pays *</Label>
                            <Input
                                id="countryName"
                                required
                                value={form.countryName}
                                onChange={(e) => setForm((prev) => ({ ...prev, countryName: e.target.value }))}
                                placeholder="ex: Cameroun"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude *</Label>
                                <Input
                                    id="latitude"
                                    type="number"
                                    step="any"
                                    required
                                    value={form.latitude}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude *</Label>
                                <Input
                                    id="longitude"
                                    type="number"
                                    step="any"
                                    required
                                    value={form.longitude}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))
                                    }
                                />
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
                                {editingCity ? "Enregistrer" : "Ajouter"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
