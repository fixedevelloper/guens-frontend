"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Plane,
  Building2,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

// --- Types ---
export type CommissionStatus = "PENDING" | "AVAILABLE" | "PAID" | "CANCELLED";

export interface ResellerCommissionRate {
  flightCommissionType: "PERCENTAGE" | "FIXED";
  flightCommissionValue: number;
  hotelCommissionType: "PERCENTAGE" | "FIXED";
  hotelCommissionValue: number;
}

export interface CommissionItem {
  id: string;
  bookingReference: string;
  offerType: "FLIGHT" | "HOTEL";
  customerName: string;
  bookingAmount: number;
  commissionAmount: number;
  commissionRate: string; // Ex: "5%" ou "2000 XAF"
  currency: string;
  status: CommissionStatus;
  createdAt: string;
  maturedAt?: string; // Date à laquelle la commission passe de PENDING à AVAILABLE
}

export interface CommissionsDataResponse {
  rates: ResellerCommissionRate;
  summary: {
    totalEarned: number;
    totalPending: number;
    totalAvailable: number;
    currency: string;
  };
  items: CommissionItem[];
}

// --- API Fetcher ---
async function fetchCommissionsData(statusFilter: string): Promise<CommissionsDataResponse> {
  const params = new URLSearchParams();
  if (statusFilter && statusFilter !== "ALL") {
    params.set("status", statusFilter);
  }

  const res = await fetch(`/api/v1/reseller/commissions?${params.toString()}`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Impossible de récupérer les détails des commissions.");
  }

  return res.json();
}

export default function ResellerCommissionsPage() {
  const t = useTranslations("Dashboard");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // TanStack Query
  const {
    data,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useQuery<CommissionsDataResponse>({
    queryKey: ["reseller-commissions", statusFilter],
    queryFn: () => fetchCommissionsData(statusFilter),
    staleTime: 1000 * 60 * 3, // Cache de 3 minutes
  });

  // Filtrage côté client pour la recherche PNR/Nom Client
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    if (!searchTerm.trim()) return data.items;

    const term = searchTerm.toLowerCase();
    return data.items.filter(
      (item) =>
        item.bookingReference.toLowerCase().includes(term) ||
        item.customerName.toLowerCase().includes(term)
    );
  }, [data?.items, searchTerm]);

  const formatCurrency = (val: number = 0, curr: string = "XAF") => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Exporter en CSV
  const handleExportCSV = () => {
    if (!filteredItems.length) return;

    const headers = "Référence,Type,Client,Montant Vente,Commission,Taux,Statut,Date\n";
    const rows = filteredItems
      .map(
        (i) =>
          `"${i.bookingReference}","${i.offerType}","${i.customerName}",${i.bookingAmount},${i.commissionAmount},"${i.commissionRate}","${i.status}","${i.createdAt}"`
      )
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
              Visualisez vos taux négociés et le suivi de vos commissions générées
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

      {/* Barème de commission actuel */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-blue-50/60 p-5 shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/20 dark:to-blue-950/20">
        <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
          Votre Barème de Commission Configuré
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-white/80 p-3.5 backdrop-blur-sm dark:border-indigo-900/50 dark:bg-slate-900/80">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Plane className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Commission sur les Vols</span>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isLoading ? (
                  <Skeleton className="h-5 w-20" />
                ) : data?.rates ? (
                  `${data.rates.flightCommissionValue}${data.rates.flightCommissionType === "PERCENTAGE" ? "%" : " XAF"}`
                ) : (
                  "N/A"
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-white/80 p-3.5 backdrop-blur-sm dark:border-indigo-900/50 dark:bg-slate-900/80">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Commission sur les Hôtels</span>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isLoading ? (
                  <Skeleton className="h-5 w-20" />
                ) : data?.rates ? (
                  `${data.rates.hotelCommissionValue}${data.rates.hotelCommissionType === "PERCENTAGE" ? "%" : " XAF"}`
                ) : (
                  "N/A"
                )}
              </div>
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
            {isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(data?.summary.totalEarned, data?.summary.currency)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Disponible / Portefeuille</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(data?.summary.totalAvailable, data?.summary.currency)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">En Attente de Validation</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(data?.summary.totalPending, data?.summary.currency)}
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
            placeholder="Rechercher par référence billet ou nom client..."
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
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Montant Vente</th>
                  <th className="px-4 py-3 font-semibold">Taux Appliqué</th>
                  <th className="px-4 py-3 font-semibold">Gain Commission</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {item.bookingReference}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {item.offerType === "FLIGHT" ? "Vol" : "Hôtel"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                      {item.customerName}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                      {formatCurrency(item.bookingAmount, item.currency)}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                      {item.commissionRate}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-indigo-600 dark:text-indigo-400">
                      +{formatCurrency(item.commissionAmount, item.currency)}
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