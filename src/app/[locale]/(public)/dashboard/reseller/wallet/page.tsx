"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  AlertCircle,
  Building,
  Smartphone,
  DollarSign,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

// --- Types ---
export type TransactionType = "COMMISSION_PAYOUT" | "WITHDRAWAL" | "REFUND" | "ADJUSTMENT";
export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED" | "CANCELLED";

export interface WalletTransaction {
  id: string;
  reference: string;
  type: TransactionType;
  amount: number;
  fee: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  createdAt: string;
}

export interface WalletSummary {
  balance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  currency: string;
  transactions: WalletTransaction[];
}

interface PayoutPayload {
  amount: number;
  payoutMethod: "MOBILE_MONEY" | "BANK_TRANSFER";
  accountNumber: string;
  accountName: string;
  provider?: string; // ex: "ORANGE_MONEY", "MTN_MOMO"
}

// --- API Fetchers ---
async function fetchWalletSummary(): Promise<WalletSummary> {
  const res = await fetch("/api/v1/reseller/wallet", {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error("Impossible de charger le solde du portefeuille.");
  }
  return res.json();
}

async function requestPayout(data: PayoutPayload): Promise<void> {
  const res = await fetch("/api/v1/reseller/wallet/withdraw", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Échec de la demande de retrait.");
  }
}

export default function ResellerWalletPage() {
  const t = useTranslations("Dashboard");
  const queryClient = useQueryClient();

  // États du formulaire de retrait
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [payoutMethod, setPayoutMethod] = useState<"MOBILE_MONEY" | "BANK_TRANSFER">("MOBILE_MONEY");
  const [provider, setProvider] = useState<string>("OM");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // TanStack Query: Récupération des données du solde
  const {
    data: wallet,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useQuery<WalletSummary>({
    queryKey: ["reseller-wallet"],
    queryFn: fetchWalletSummary,
    staleTime: 1000 * 60 * 2,
  });

  // TanStack Mutation: Demande de retrait
  const payoutMutation = useMutation({
    mutationFn: requestPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reseller-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["reseller-overview"] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: Error) => {
      setFormError(err.message);
    },
  });

  const resetForm = () => {
    setAmount("");
    setAccountNumber("");
    setAccountName("");
    setFormError(null);
  };

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFormError("Veuillez saisir un montant valide.");
      return;
    }

    if (wallet && numericAmount > wallet.balance) {
      setFormError("Le montant demandé dépasse votre solde disponible.");
      return;
    }

    if (!accountNumber.trim() || !accountName.trim()) {
      setFormError("Veuillez remplir toutes les informations du compte de destination.");
      return;
    }

    payoutMutation.mutate({
      amount: numericAmount,
      payoutMethod,
      provider: payoutMethod === "MOBILE_MONEY" ? provider : undefined,
      accountNumber,
      accountName,
    });
  };

  const formatCurrency = (val: number = 0, curr: string = "XAF") => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {t("wallet") ?? "Portefeuille & Solde"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gérez votre solde, vos commissions créditées et vos demandes de retrait
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
            onClick={() => setIsModalOpen(true)}
            disabled={!wallet || wallet.balance <= 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            <Send className="h-3.5 w-3.5" />
            Demander un retrait
          </button>
        </div>
      </div>

      {/* Cartes de Solde */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Solde Disponible */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Solde Disponible
          </span>
          <div className="mt-2 text-3xl font-extrabold text-emerald-950 dark:text-emerald-100">
            {isLoading ? <Skeleton className="h-9 w-36" /> : formatCurrency(wallet?.balance, wallet?.currency)}
          </div>
          <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
            Montant transférable immédiatement
          </p>
        </div>

        {/* Commissions en cours */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            En cours de validation
          </span>
          <div className="mt-2 text-3xl font-extrabold text-amber-950 dark:text-amber-100">
            {isLoading ? <Skeleton className="h-9 w-36" /> : formatCurrency(wallet?.pendingBalance, wallet?.currency)}
          </div>
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            Sera libéré après le décollement/séjour
          </p>
        </div>

        {/* Total Retiré */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Retiré
          </span>
          <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {isLoading ? <Skeleton className="h-9 w-36" /> : formatCurrency(wallet?.totalWithdrawn, wallet?.currency)}
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Cumul des paiements perçus
          </p>
        </div>
      </div>

      {/* Message d'erreur global */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{(error as Error).message}</p>
        </div>
      )}

      {/* Historique des Transactions */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Historique des transactions
        </h2>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !wallet?.transactions || wallet.transactions.length === 0 ? (
            <div className="py-12 text-center">
              <Wallet className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                Aucune transaction enregistrée
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Référence / Description</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Statut</th>
                    <th className="px-4 py-3 font-semibold text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {wallet.transactions.map((tx) => {
                    const isCredit = tx.type === "COMMISSION_PAYOUT" || tx.type === "REFUND";
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                                isCredit
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                  : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                              }`}
                            >
                              {isCredit ? (
                                <ArrowDownLeft className="h-4 w-4" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4" />
                              )}
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {tx.type === "COMMISSION_PAYOUT" && "Commission"}
                              {tx.type === "WITHDRAWAL" && "Retrait"}
                              {tx.type === "REFUND" && "Remboursement"}
                              {tx.type === "ADJUSTMENT" && "Ajustement"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {tx.description}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">{tx.reference}</div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3.5">
                          {tx.status === "COMPLETED" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" /> Effectué
                            </span>
                          )}
                          {tx.status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                              <Clock className="h-3 w-3" /> En cours
                            </span>
                          )}
                          {tx.status === "FAILED" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                              <XCircle className="h-3 w-3" /> Échec
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-3.5 text-right font-bold ${
                          isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-slate-100"
                        }`}>
                          {isCredit ? "+" : "-"}{formatCurrency(tx.amount, tx.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Demande de Retrait */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Demander un virement / retrait
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Solde disponible : <strong className="text-emerald-600">{formatCurrency(wallet?.balance, wallet?.currency)}</strong>
            </p>

            {formError && (
              <div className="mt-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
                {formError}
              </div>
            )}

            <form onSubmit={handlePayoutSubmit} className="mt-4 space-y-4">
              {/* Montant */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Montant à retirer ({wallet?.currency || "XAF"})
                </label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ex: 50000"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Mode de paiement */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mode de réception
                </label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod("MOBILE_MONEY")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium ${
                      payoutMethod === "MOBILE_MONEY"
                        ? "border-blue-600 bg-blue-50/50 text-blue-600 dark:bg-blue-950/30"
                        : "border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400"
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    Mobile Money
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutMethod("BANK_TRANSFER")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium ${
                      payoutMethod === "BANK_TRANSFER"
                        ? "border-blue-600 bg-blue-50/50 text-blue-600 dark:bg-blue-950/30"
                        : "border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400"
                    }`}
                  >
                    <Building className="h-4 w-4" />
                    Virement Bancaire
                  </button>
                </div>
              </div>

              {payoutMethod === "MOBILE_MONEY" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Opérateur
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="OM">Orange Money</option>
                    <option value="MOMO">MTN Mobile Money</option>
                    <option value="WAVE">Wave</option>
                  </select>
                </div>
              )}

              {/* Numéro ou RIB */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {payoutMethod === "MOBILE_MONEY" ? "Numéro de téléphone" : "Numéro de compte / IBAN"}
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={payoutMethod === "MOBILE_MONEY" ? "Ex: 699000000" : "IBAN / RIB"}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Nom du titulaire */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nom complet du titulaire
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Nom tel qu'enregistré auprès de l'opérateur"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={payoutMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  {payoutMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  Confirmer le retrait
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}