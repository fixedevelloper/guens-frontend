"use client";

import { useState } from "react";
import { Plus, Loader2, Ban, Play, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

import {
    useVehiclesQuery,
    useSuspendVehicleMutation,
    useActivateVehicleMutation,
    useDeleteVehicleMutation,
} from "@/hooks/use-partner-queries";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function VehicleListings({ partnerId }: { partnerId: string }) {
    const [page, setPage] = useState(0);
    const { data, isLoading } = useVehiclesQuery(partnerId, page);
    const suspendMutation = useSuspendVehicleMutation(partnerId);
    const activateMutation = useActivateVehicleMutation(partnerId);
    const deleteMutation = useDeleteVehicleMutation(partnerId);

    const vehicles = data?.content ?? [];
    const actioningId =
        suspendMutation.variables ?? activateMutation.variables ?? deleteMutation.variables ?? null;
    const isActioning = suspendMutation.isPending || activateMutation.isPending || deleteMutation.isPending;

    function handleDelete(vehicleId: string) {
        if (!window.confirm("Supprimer ce véhicule ? Cette action est irréversible.")) return;
        deleteMutation.mutate(vehicleId);
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Mes véhicules</h2>
                <Button size="sm" className="gap-1.5">
                    <Plus className="size-4" />
                    Ajouter un véhicule
                </Button>
            </div>

            {isLoading ? (
                <p className="text-sm text-muted-foreground">Chargement…</p>
            ) : vehicles.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun véhicule enregistré pour le moment.</p>
            ) : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Véhicule</TableHead>
                                <TableHead>Catégorie</TableHead>
                                <TableHead>Prix / jour</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vehicles.map((vehicle) => (
                                <TableRow key={vehicle.id}>
                                    <TableCell className="font-medium">{vehicle.brand} {vehicle.model}</TableCell>
                                    <TableCell>{vehicle.category}</TableCell>
                                    <TableCell>{vehicle.pricePerDay} {vehicle.currency}</TableCell>
                                    <TableCell>
                    <span className={vehicle.status === "ACTIVE" ? "text-emerald-600" : "text-muted-foreground"}>
                      {vehicle.status === "ACTIVE" ? "Actif" : "Suspendu"}
                    </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1.5">
                                            {vehicle.status === "ACTIVE" ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isActioning && actioningId === vehicle.id}
                                                    onClick={() => suspendMutation.mutate(vehicle.id)}
                                                    className="gap-1.5 rounded-lg"
                                                >
                                                    {suspendMutation.isPending && actioningId === vehicle.id ? (
                                                        <Loader2 className="size-3.5 animate-spin" />
                                                    ) : (
                                                        <Ban className="size-3.5" />
                                                    )}
                                                    Suspendre
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isActioning && actioningId === vehicle.id}
                                                    onClick={() => activateMutation.mutate(vehicle.id)}
                                                    className="gap-1.5 rounded-lg text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                                                >
                                                    {activateMutation.isPending && actioningId === vehicle.id ? (
                                                        <Loader2 className="size-3.5 animate-spin" />
                                                    ) : (
                                                        <Play className="size-3.5" />
                                                    )}
                                                    Activer
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={isActioning && actioningId === vehicle.id}
                                                onClick={() => handleDelete(vehicle.id)}
                                                className="gap-1.5 rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10"
                                            >
                                                {deleteMutation.isPending && actioningId === vehicle.id ? (
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="size-3.5" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {data && data.totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {data.number + 1} sur {data.totalPages} — {data.totalElements} véhicule(s)
              </span>
                            <div className="flex gap-1.5">
                                <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-lg">
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <Button size="sm" variant="outline" disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg">
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}