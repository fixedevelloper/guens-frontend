"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Wallet,
  BadgePercent,
  TrendingUp,
  Users,
  Plane,
  Building2,
  ArrowUpRight,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";

import { Link, useRouter } from "@/i18n/navigation";
import { ResellerBookingResponse, ResellerBookingsTable } from "@/components/dashboard/ResellerBookingsTable";


// Interface des données de synthèse Dashboard Revendeur
interface ResellerDashboardOverview {
  walletBalance: number;
  totalCommissions: number;
  pendingCommissions: number;
  totalSalesVolume: number;
  totalBookingsCount: number;
  totalCustomersCount: number;
  currency: string;
  resellerCode: string;
  recentBookings: ResellerBookingResponse[];
}

// Fonction de récupération des données
async function fetchResellerOverview(): Promise<ResellerDashboardOverview> {
  const response = await fetch("/api/v1/reseller/overview", {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération du tableau de bord");
  }

  return response.json();
}

export default function ResellerDashboardPage() {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);

  // Requete TanStack Query
  const {
    data: overview,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<ResellerDashboardOverview>({
    queryKey: ["reseller-overview"],
    queryFn: fetchResellerOverview,
    staleTime: 1000 * 60 * 5, // Cache 5 min
  });

  // Copier le code ou lien d'affiliation
  const handleCopyCode = () => {
    if (overview?.resellerCode) {
      navigator.clipboard.writeText(overview.resellerCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (amount: number = 0, currency: string = "XAF") => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* 1. En-tête & Code d'affiliation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {t("resellerDashboard") ?? "Tableau de bord Revendeur"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vue d&apos;ensemble de vos performances commercialisations et revenus
              </p>
            </div>
          </div>
        </div>

        {/* Boutons d'action rapide / Code Apporteur */}
        <div className="flex items-center gap-3">
          {overview?.resellerCode && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs text-slate-500">Code:</span>
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                {overview.resellerCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Copier le code"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          )}

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Raccourcis de réservation directe (Pour réserver au nom d'un client) */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-md dark:border-blue-900/50">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold">Effectuer une nouvelle vente</h2>
            <p className="mt-1 text-xs text-blue-100">
              Recherchez un billet ou un hôtel et associez automatiquement votre commission à la commande.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/reseller/flights"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <Plane className="h-4 w-4" />
              Réserver un vol
            </Link>
            <Link
              href="/dashboard/reseller/hotels"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-blue-900 shadow-sm transition-all hover:bg-blue-50"
            >
              <Building2 className="h-4 w-4 text-blue-600" />
              Réserver un hôtel
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Grille des 4 Cartes KPIs Principales */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Solde Portefeuille */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Solde Disponible</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isLoading ? "---" : formatCurrency(overview?.walletBalance, overview?.currency)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="text-slate-500">Portefeuille Revendeur</span>
            <Link href="/dashboard/reseller/wallet" className="flex items-center gap-0.5 font-medium text-blue-600 hover:underline dark:text-blue-400">
              Gérer <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Commissions Totales */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Commissions Gagnées</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <BadgePercent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isLoading ? "---" : formatCurrency(overview?.totalCommissions, overview?.currency)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="text-amber-600 font-medium dark:text-amber-400">
              {formatCurrency(overview?.pendingCommissions, overview?.currency)} en attente
            </span>
            <Link href="/dashboard/reseller/commissions" className="flex items-center gap-0.5 font-medium text-blue-600 hover:underline dark:text-blue-400">
              Détails <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Volume de Ventes */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Volume de Ventes</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isLoading ? "---" : formatCurrency(overview?.totalSalesVolume, overview?.currency)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="text-slate-500">{overview?.totalBookingsCount ?? 0} commandes totales</span>
            <Link href="/dashboard/reseller/bookings" className="flex items-center gap-0.5 font-medium text-blue-600 hover:underline dark:text-blue-400">
              Voir tout <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Portefeuille Clients */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mes Clients</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isLoading ? "---" : overview?.totalCustomersCount ?? 0}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="text-slate-500">Clients rattachés</span>
          </div>
        </div>
      </div>

      {/* 4. Section Dernières Ventes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Dernières réservations effectuées
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aperçu des 5 plus récents achats liés à votre compte revendeur
            </p>
          </div>
          <Link
            href="/dashboard/reseller/bookings"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Voir l&apos;historique complet
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <ResellerBookingsTable
          bookings={overview?.recentBookings ?? []}
          isLoading={isLoading}
          onViewDetails={(id) => router.push(`/dashboard/bookings/${id}`)}
        />
      </div>
    </div>
  );
}