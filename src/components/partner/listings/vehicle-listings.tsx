"use client";

import { useState } from "react";
import {
    Plus,
    Loader2,
    Ban,
    Play,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Car,
    Images,
    Edit3,
    MoreHorizontal,
} from "lucide-react";
import { useTranslations } from "next-intl";

import {
    useVehiclesQuery,
    useSuspendVehicleMutation,
    useActivateVehicleMutation,
    useDeleteVehicleMutation,
} from "@/hooks/use-partner-queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VehicleListingsProps {
    partnerId: string;
}

export function VehicleListings({ partnerId }: VehicleListingsProps) {
    const t = useTranslations("PartnerVehicles");
    const [page, setPage] = useState(0);

    const { data, isLoading } = useVehiclesQuery(partnerId, page);
    const suspendMutation = useSuspendVehicleMutation(partnerId);
    const activateMutation = useActivateVehicleMutation(partnerId);
    const deleteMutation = useDeleteVehicleMutation(partnerId);

    const vehicles = data?.content ?? [];
    const actioningId =
        suspendMutation.variables ??
        activateMutation.variables ??
        deleteMutation.variables ??
        null;

    const isActioning =
        suspendMutation.isPending ||
        activateMutation.isPending ||
        deleteMutation.isPending;

    function handleDelete(vehicleId: string) {
        if (!window.confirm(t("deleteConfirm"))) return;
        deleteMutation.mutate(vehicleId);
    }

    return (
        <div className="space-y-5">
            {/* En-tête */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                        {t("title")}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t("subtitle")}
                    </p>
                </div>

                {vehicles.length > 0 && (
                    <Button size="sm" className="gap-2 rounded-xl shadow-sm" asChild>
                        <Link href="/partner/listings/vehicles/new">
                            <Plus className="size-4" />
                            {t("addVehicle")}
                        </Link>
                    </Button>
                )}
            </div>

            {/* État de chargement */}
            {isLoading ? (
                <Card className="border-border/60 bg-card/80">
                    <CardContent className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        {t("loading")}
                    </CardContent>
                </Card>
            ) : vehicles.length === 0 ? (
                /* État vide */
                <Card className="border-2 border-dashed border-border/60 bg-gradient-to-br from-background to-muted/20 shadow-none">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
                            <Car className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                            {t("emptyTitle")}
                        </h3>
                        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                            {t("emptyDescription")}
                        </p>
                        <Button size="sm" className="mt-6 gap-2 rounded-xl shadow-sm" asChild>
                            <Link href="/partner/listings/vehicles/new">
                                <Plus className="size-4" />
                                {t("emptyAddBtn")}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                /* Tableau de résultats */
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-semibold text-foreground">{t("colVehicle")}</TableHead>
                                    <TableHead className="font-semibold text-foreground">{t("colCategory")}</TableHead>
                                    <TableHead className="font-semibold text-foreground">{t("colPrice")}</TableHead>
                                    <TableHead className="font-semibold text-foreground">{t("colStatus")}</TableHead>
                                    <TableHead className="text-right font-semibold text-foreground">{t("colActions")}</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {vehicles.map((vehicle) => {
                                    const isActive = vehicle.status === "ACTIVE";
                                    const isBusy = isActioning && actioningId === vehicle.id;

                                    return (
                                        <TableRow key={vehicle.id} className="group hover:bg-muted/20">
                                            {/* Nom & Image / Identifiant */}
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
                                                        {vehicle.coverImageUrl || vehicle.coverImageUrl ? (
                                                            <img
                                                                src={vehicle.coverImageUrl || vehicle.coverImageUrl}
                                                                alt={`${vehicle.brand} ${vehicle.model}`}
                                                                className="size-full object-cover"
                                                            />
                                                        ) : (
                                                            <Car className="size-5" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="truncate font-semibold text-foreground">
                                                            {vehicle.brand} {vehicle.model}
                                                        </div>
                                                        <div className="truncate text-xs text-muted-foreground">
                                                            {vehicle.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Catégorie */}
                                            <TableCell>
                        <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {vehicle.category}
                        </span>
                                            </TableCell>

                                            {/* Prix */}
                                            <TableCell>
                        <span className="font-medium text-foreground">
                          {vehicle.pricePerDay} {vehicle.currency}
                        </span>
                                            </TableCell>

                                            {/* Statut */}
                                            <TableCell>
                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isActive
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-muted text-muted-foreground"
                            }`}
                        >
                          <span
                              className={`mr-1.5 size-1.5 rounded-full ${
                                  isActive ? "bg-emerald-500" : "bg-muted-foreground/60"
                              }`}
                          />
                            {isActive ? t("statusActive") : t("statusSuspended")}
                        </span>
                                            </TableCell>

                                            {/* Menu d'actions */}
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={isBusy}
                                                            className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                                                        >
                                                            {isBusy ? (
                                                                <Loader2 className="size-4 animate-spin" />
                                                            ) : (
                                                                <MoreHorizontal className="size-4" />
                                                            )}
                                                            <span className="sr-only">{t("colActions")}</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44 rounded-xl">
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={`/partner/listings/vehicles/${vehicle.id}/edit`}
                                                                className="flex items-center gap-2 cursor-pointer"
                                                            >
                                                                <Edit3 className="size-4 text-muted-foreground" />
                                                                <span>{t("edit")}</span>
                                                            </Link>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={`/partner/listings/vehicles/${vehicle.id}/images`}
                                                                className="flex items-center gap-2 cursor-pointer"
                                                            >
                                                                <Images className="size-4 text-muted-foreground" />
                                                                <span>{t("photos")}</span>
                                                            </Link>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />

                                                        {isActive ? (
                                                            <DropdownMenuItem
                                                                disabled={isBusy}
                                                                onClick={() => suspendMutation.mutate(vehicle.id)}
                                                                className="flex items-center gap-2 cursor-pointer text-amber-600 dark:text-amber-400"
                                                            >
                                                                <Ban className="size-4" />
                                                                <span>{t("suspend")}</span>
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                disabled={isBusy}
                                                                onClick={() => activateMutation.mutate(vehicle.id)}
                                                                className="flex items-center gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400"
                                                            >
                                                                <Play className="size-4" />
                                                                <span>{t("activate")}</span>
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuItem
                                                            disabled={isBusy}
                                                            onClick={() => handleDelete(vehicle.id)}
                                                            className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="size-4" />
                                                            <span>{t("delete")}</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {data && data.totalPages > 1 && (
                        <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-muted-foreground">
                {t("pageInfo", {
                    page: data.number + 1,
                    totalPages: data.totalPages,
                    totalElements: data.totalElements,
                })}
              </span>

                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={page === 0}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="rounded-xl"
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={page + 1 >= data.totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="rounded-xl"
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}