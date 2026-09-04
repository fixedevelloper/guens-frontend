"use client";

import React, { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Users, Search, RefreshCw, XCircle } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { useMyResellerBookingsQuery } from "@/hooks/use-rellers-queries";
import type { ResellerBookingResponse } from "@/components/dashboard/ResellerBookingsTable";
import { formatDate } from "@/lib/format";

// Same reasoning as the bookings page: no server-side aggregation endpoint exists for this, so a
// large page of the reseller's own bookings is fetched and grouped client-side by contactEmail.
const PAGE_SIZE = 100;

interface CustomerSummary {
  email: string;
  bookingsCount: number;
  totalSpent: number;
  currency: string;
  lastBookingAt: string;
  lastStatus: ResellerBookingResponse["status"];
}

function summarizeCustomers(bookings: ResellerBookingResponse[]): CustomerSummary[] {
  const byEmail = new Map<string, CustomerSummary>();

  for (const booking of bookings) {
    const existing = byEmail.get(booking.contactEmail);
    if (!existing) {
      byEmail.set(booking.contactEmail, {
        email: booking.contactEmail,
        bookingsCount: 1,
        totalSpent: booking.totalAmount || 0,
        currency: booking.currency,
        lastBookingAt: booking.createdAt,
        lastStatus: booking.status,
      });
      continue;
    }

    existing.bookingsCount += 1;
    existing.totalSpent += booking.totalAmount || 0;
    if (new Date(booking.createdAt) > new Date(existing.lastBookingAt)) {
      existing.lastBookingAt = booking.createdAt;
      existing.lastStatus = booking.status;
    }
  }

  return Array.from(byEmail.values()).sort(
      (a, b) => new Date(b.lastBookingAt).getTime() - new Date(a.lastBookingAt).getTime()
  );
}

export default function ResellerCustomersPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: page, isLoading, isFetching, error, refetch } = useMyResellerBookingsQuery(
      user?.resellerId,
      0,
      PAGE_SIZE
  );

  const customers = useMemo(() => summarizeCustomers(page?.content ?? []), [page]);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((c) => c.email.toLowerCase().includes(term));
  }, [customers, search]);

  return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {t("customers") ?? "Mes Clients"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Les clients pour lesquels vous avez effectué au moins une réservation
              </p>
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

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par email client..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:bg-slate-900"
            />
          </div>
        </div>

        {error && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400">
              <XCircle className="h-5 w-5 shrink-0" />
              <p>{(error as Error).message || "Une erreur est survenue lors du chargement des clients."}</p>
            </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {isLoading ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">Chargement…</div>
          ) : filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                {search ? "Aucun client ne correspond à cette recherche." : "Aucun client pour le moment."}
              </div>
          ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Réservations</th>
                  <th className="px-4 py-3">Montant total</th>
                  <th className="px-4 py-3">Dernière réservation</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.map((customer) => (
                    <tr key={customer.email} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{customer.email}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{customer.bookingsCount}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: customer.currency,
                          maximumFractionDigits: 0,
                        }).format(customer.totalSpent)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {formatDate(customer.lastBookingAt, locale)}
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
          )}
        </div>
      </div>
  );
}
