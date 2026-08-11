"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  BadgePercent,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Percent,
  Download,
  AlertCircle,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useMyResellerCommissionsQuery, useResellerProfileQuery } from "@/hooks/use-rellers-queries";
import type { ResellerCommissionEntry } from "@/lib/api/types";

// Le back-end ne renvoie ni référence de réservation lisible, ni nom client, ni montant de
// vente sur une commission (voir ResellerCommissionResponse) - uniquement id/bookingId/amount/
// currency/status/createdAt. On affiche donc ce qui existe réellement plutôt que des colonnes
// vides ; le taux affiché est le taux global du compte (Reseller.commissionRate), pas un
// barème par produit qui n'existe pas côté serveur.
const PAGE_SIZE = 100;

export default function ResellerCommissionsPage() {
  const t = useTranslations("Dashboard");
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const {
    data: profile,
    isLoading: isProfileLoading,
  } = useResellerProfileQuery(user?.resellerId);

  const {
    data: page,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useMyResellerCommissionsQuery(user?.resellerId, 0, PAGE_SIZE);

  const items = page?.content ?? [];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (searchTerm.trim() && !item.bookingId.toLowerCase().includes(searchTerm.trim().toLowerCase())) return false;
      return true;
    });
  }, [items, statusFilter, searchTerm]);

  const summary = useMemo(() => {
    const currency = items[0]?.currency || "XAF";
    const sum = (predicate: (i: ResellerCommissionEntry) => boolean) =>
      items.filter(predicate).reduce((acc, i) => acc + i.amount, 0);
    return {
      totalEarned: sum((i) => i.status === "AVAILABLE" || i.status === "PAID"),
      totalAvailable: sum((i) => i.status === "AVAILABLE"),
      totalPending: sum((i) => i.status === "PENDING"),
      currency,
    };
  }, [items]);

  const formatCurrency = (val: number = 0, curr: string = "XAF") => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleExportCSV = () => {
    if (!filteredItems.length) return;

    const headers = "Réservation,Commission,Statut,Date\n";
    const rows = filteredItems
      .map((i) => `"${i.bookingId}",${i.amount},"${i.status}","${i.createdAt}"`)
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `commissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <BadgePercent className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {t("commissions") ?? "Mes Commissions"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Suivez vos commissions générées, par réservation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Actualiser
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!filteredItems.length}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Taux de commission du compte */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-blue-50/60 p-5 shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/20 dark:to-blue-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <Percent className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Votre taux de commission négocié</span>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isProfileLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : profile ? (
                `${(profile.commissionRate * 100).toFixed(1)}%`
              ) : (
                "N/A"
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cartes KPI Synthèse */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Cumulé</span>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(summary.totalEarned, summary.currency)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Disponible / Portefeuille</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(summary.totalAvailable, summary.currency)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">En Attente de Validation</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(summary.totalPending, summary.currency)}
          </div>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par id de réservation..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Statut :</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">Toutes les commissions</option>
            <option value="AVAILABLE">Disponible / Créditée</option>
            <option value="PENDING">En attente (Départ à venir)</option>
            <option value="PAID">Déjà retirée</option>
            <option value="CANCELLED">Annulée</option>
          </select>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{(error as Error).message}</p>
        </div>
      )}

      {/* Tableau des Commissions */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center">
            <Percent className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              Aucune commission trouvée
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Réservation</th>
                  <th className="px-4 py-3 font-semibold">Gain Commission</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {item.bookingId}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-indigo-600 dark:text-indigo-400">
                      +{formatCurrency(item.amount, item.currency)}
                    </td>
                    <td className="px-4 py-3.5">
                      {(item.status === "AVAILABLE" || item.status === "PAID") && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          {item.status === "PAID" ? "Payée" : "Disponible"}
                        </span>
                      )}
                      {item.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                          <Clock className="h-3 w-3" /> En attente
                        </span>
                      )}
                      {item.status === "CANCELLED" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                          <XCircle className="h-3 w-3" /> Annulée
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-500 dark:text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
