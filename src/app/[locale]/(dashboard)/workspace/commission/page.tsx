"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
    Banknote,
    Hash,
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCw,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { useCommissionWalletQuery } from "@/hooks/use-admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatMoney } from "@/lib/format";

export default function AdminCommissionPage() {
    const t = useTranslations("Dashboard");
    const locale = useLocale();
    const walletQuery = useCommissionWalletQuery();

    // États locaux pour le filtrage et la pagination
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Extraction sécurisée des données
    const walletData = walletQuery.data;
    const entries = walletData?.entries ?? [];

    // Filtrage dynamique des transactions
    const filteredEntries = entries.filter((entry) => {
        const matchesSearch =
            entry.reference?.toLowerCase().includes(search.toLowerCase()) ||
            entry.description?.toLowerCase().includes(search.toLowerCase()) ||
            entry.id.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || entry.status?.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredEntries.length / itemsPerPage) || 1;
    const paginatedEntries = filteredEntries.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="grid gap-6 p-6">
            {/* En-tête de la page */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{t("commissionWallet")}</h1>
                    <p className="text-sm text-muted-foreground">{t("commissionSubtitle")}</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-fit gap-2"
                    onClick={() => walletQuery.refetch()}
                    disabled={walletQuery.isFetching}
                >
                    <RefreshCw className={`size-4 ${walletQuery.isFetching ? "animate-spin" : ""}`} />
                    {t("refresh") ?? "Actualiser"}
                </Button>
            </div>

            {walletQuery.isLoading ? (
                <div className="grid gap-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Skeleton className="h-32 w-full rounded-xl" />
                        <Skeleton className="h-32 w-full rounded-xl" />
                    </div>
                    <Skeleton className="h-96 w-full rounded-xl" />
                </div>
            ) : walletQuery.isError ? (
                <Alert variant="destructive">
                    <AlertDescription>{t("loadError")}</AlertDescription>
                </Alert>
            ) : (
                <>
                    {/* Cartes de statistiques (KPIs) */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {t("walletBalance")}
                                </CardTitle>
                                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                    <Banknote className="size-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {walletData && walletData.balances.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {walletData.balances.map((balance) => (
                                            <div
                                                key={balance.currency}
                                                className="flex items-baseline justify-between gap-4 border-b border-border/50 pb-1.5 last:border-0 last:pb-0"
                                            >
            <span className="text-3xl font-bold tracking-tight">
              {formatMoney(balance, locale)}
            </span>
                                                {walletData.balances.length > 1 && (
                                                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                {balance.currency}
              </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-3xl font-bold tracking-tight">
                                        {formatMoney({ amount: 0, currency: "EUR" }, locale)}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {t("walletEntryCount")}
                                </CardTitle>
                                <div className="rounded-lg bg-muted p-2">
                                    <Hash className="size-5 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold tracking-tight">
                                    {walletData?.entryCount ?? 0}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Section Historique des Transactions */}
                    <Card className="shadow-sm">
                        <CardHeader className="gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold">
                                    {t("transactionHistory") ?? "Historique des commissions"}
                                </CardTitle>
                                <CardDescription>
                                    {t("transactionSubtitle") ?? "Liste détaillée des commissions perçues et ajustements."}
                                </CardDescription>
                            </div>

                            {/* Filtres & Recherche */}
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t("searchPlaceholder") ?? "Rechercher une référence..."}
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full pl-8 sm:w-64"
                                    />
                                </div>

                                <Select
                                    value={statusFilter}
                                    onValueChange={(val) => {
                                        setStatusFilter(val);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-36">
                                        <Filter className="mr-2 size-4 text-muted-foreground" />
                                        <SelectValue placeholder="Statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les statuts</SelectItem>
                                        <SelectItem value="completed">Complété</SelectItem>
                                        <SelectItem value="pending">En attente</SelectItem>
                                        <SelectItem value="failed">Échoué</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("type") ?? "Type"}</TableHead>
                                        <TableHead>{t("reference") ?? "Référence"}</TableHead>
                                        <TableHead>{t("date") ?? "Date"}</TableHead>
                                        <TableHead>{t("status") ?? "Statut"}</TableHead>
                                        <TableHead className="text-right">{t("amount") ?? "Montant"}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedEntries.length > 0 ? (
                                        paginatedEntries.map((entry) => {
                                            const isCredit = entry.type === "CREDIT" || entry.amount?.amount > 0;

                                            return (
                                                <TableRow key={entry.id} className="hover:bg-muted/50">
                                                    {/* Type / Sens de la transaction */}
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className={`flex size-8 items-center justify-center rounded-full ${
                                                                    isCredit
                                                                        ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20"
                                                                        : "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20"
                                                                }`}
                                                            >
                                                                {isCredit ? (
                                                                    <ArrowDownLeft className="size-4" />
                                                                ) : (
                                                                    <ArrowUpRight className="size-4" />
                                                                )}
                                                            </div>
                                                            <span className="font-medium">
                                {entry.description || (isCredit ? "Commission" : "Retrait")}
                              </span>
                                                        </div>
                                                    </TableCell>

                                                    {/* Référence */}
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {entry.reference || entry.id}
                                                    </TableCell>

                                                    {/* Date */}
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {entry.createdAt
                                                            ? new Date(entry.createdAt).toLocaleDateString(locale, {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })
                                                            : "-"}
                                                    </TableCell>

                                                    {/* Statut avec Badge */}
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                entry.status === "COMPLETED"
                                                                    ? "default"
                                                                    : entry.status === "PENDING"
                                                                        ? "outline"
                                                                        : "destructive"
                                                            }
                                                            className="capitalize"
                                                        >
                                                            {entry.status ? entry.status.toLowerCase() : "complété"}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Montant */}
                                                    <TableCell
                                                        className={`text-right font-semibold ${
                                                            isCredit
                                                                ? "text-emerald-600 dark:text-emerald-400"
                                                                : "text-slate-900 dark:text-slate-100"
                                                        }`}
                                                    >
                                                        {isCredit ? "+" : ""}
                                                        {formatMoney(entry.amount, locale)}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                                {t("noTransactionsFound") ?? "Aucune transaction trouvée."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>

                        {/* Pagination en bas de tableau */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t px-6 py-4">
                                <p className="text-xs text-muted-foreground">
                                    Page {currentPage} sur {totalPages}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
}