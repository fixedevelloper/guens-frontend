"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { ResellerBookingResponse, ResellerBookingsTable } from "@/components/dashboard/ResellerBookingsTable";


// Type des filtres d'API
interface BookingFilters {
  search: string;
  status: string;
  offerType: string;
}

// Fonction de fetch API
async function fetchResellerBookings(filters: BookingFilters): Promise<ResellerBookingResponse[]> {
  const searchParams = new URLSearchParams();
  if (filters.search) searchParams.set("search", filters.search);
  if (filters.status && filters.status !== "ALL") searchParams.set("status", filters.status);
  if (filters.offerType && filters.offerType !== "ALL") searchParams.set("offerType", filters.offerType);

  const response = await fetch(`/api/v1/reseller/bookings?${searchParams.toString()}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Impossible de charger l'historique des ventes");
  }

  return response.json();
}

export default function ResellerBookingsPage() {
  const t = useTranslations("Dashboard");
  const router = useRouter();

  // États locaux des filtres
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [offerTypeFilter, setOfferTypeFilter] = useState<string>("ALL");

  // Requête TanStack Query
  const {
    data: bookings = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<ResellerBookingResponse[]>({
    queryKey: ["reseller-bookings", { search, status: statusFilter, offerType: offerTypeFilter }],
    queryFn: () => fetchResellerBookings({ search, status: statusFilter, offerType: offerTypeFilter }),
    staleTime: 1000 * 60 * 2, // Cache valide pendant 2 minutes
  });

  // Navigation vers le détail de la réservation
  const handleViewDetails = (bookingId: string) => {
    router.push(`/dashboard/bookings/${bookingId}`);
  };

  // Calcul des métriques/KPIs rapides
  const stats = useMemo(() => {
    const totalVolume = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "PAID").length;
    const pendingCount = bookings.filter((b) => b.status === "PENDING_PAYMENT" || b.status === "CONFIRMING").length;
    const currency = bookings[0]?.currency || "XAF";

    return { totalVolume, confirmedCount, pendingCount, currency };
  }, [bookings]);

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {t("resellerBookings") ?? "Mes Ventes"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Suivez l'ensemble des réservations effectuées en tant que revendeur
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Cartes statistiques rapides */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Volume Total Vendu</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: stats.currency,
              maximumFractionDigits: 0,
            }).format(stats.totalVolume)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Ventes Confirmées</span>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            {stats.confirmedCount} <span className="text-xs font-normal text-slate-500">réservations</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">En Attente de Traitement</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            {stats.pendingCount} <span className="text-xs font-normal text-slate-500">en cours</span>
          </div>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
        {/* Input de recherche par PNR / Email */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par PNR, email client..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:bg-slate-900"
          />
        </div>

        {/* Filtres déroulants */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Filtres :</span>
          </div>

          {/* Filtre par Type d'offre */}
          <select
            value={offerTypeFilter}
            onChange={(e) => setOfferTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">Tous les produits</option>
            <option value="FLIGHT">Vols</option>
            <option value="HOTEL">Hôtels</option>
          </select>

          {/* Filtre par Statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="CONFIRMED">Confirmé</option>
            <option value="PAID">Payé</option>
            <option value="DEPOSIT_PAID">Acompte versé</option>
            <option value="PENDING_PAYMENT">En attente</option>
            <option value="CONFIRMING">En confirmation</option>
            <option value="FAILED">Échec</option>
            <option value="CANCELLED">Annulé</option>
          </select>
        </div>
      </div>

      {/* Affichage d'erreur en cas d'échec API */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400">
          <XCircle className="h-5 w-5 shrink-0" />
          <p>
            {(error as Error).message || "Une erreur est survenue lors du chargement des réservations."}
          </p>
        </div>
      )}

      {/* Tableau des ventes */}
      <ResellerBookingsTable
        bookings={bookings}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}