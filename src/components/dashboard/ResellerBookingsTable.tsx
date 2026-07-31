import React from 'react';
import { Plane, Building2, Ticket, Eye, Calendar, User } from 'lucide-react';

export type OfferType = 'FLIGHT' | 'HOTEL';

export type BookingStatus =
  | 'PENDING_HOLD'
  | 'PENDING_PAYMENT'
  | 'DEPOSIT_PAID'
  | 'PAID'
  | 'CONFIRMING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'CANCELLED';

export interface ResellerBookingResponse {
  id: string;
  resellerId: string;
  contactEmail: string;
  offerType: OfferType;
  summary: string;
  pnrCode?: string;
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  travelerCount: number;
  createdAt: string; // Format ISO
}

interface ResellerBookingsTableProps {
  bookings: ResellerBookingResponse[];
  isLoading?: boolean;
  onViewDetails?: (bookingId: string) => void;
}

// Configuration visuelle des badges selon le statut
const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  CONFIRMED: {
    label: 'Confirmé',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  },
  PAID: {
    label: 'Payé',
    className: 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-500/10 dark:text-blue-400',
  },
  DEPOSIT_PAID: {
    label: 'Acompte versé',
    className: 'bg-indigo-50 text-indigo-700 ring-indigo-700/10 dark:bg-indigo-500/10 dark:text-indigo-400',
  },
  CONFIRMING: {
    label: 'Confirmation en cours',
    className: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400',
  },
  PENDING_HOLD: {
    label: 'Finalisation en cours',
    className: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400',
  },
  PENDING_PAYMENT: {
    label: 'En attente',
    className: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400',
  },
  FAILED: {
    label: 'Échec',
    className: 'bg-rose-50 text-rose-700 ring-rose-600/10 dark:bg-rose-500/10 dark:text-rose-400',
  },
  CANCELLED: {
    label: 'Annulé',
    className: 'bg-slate-100 text-slate-600 ring-slate-500/10 dark:bg-slate-800 dark:text-slate-400',
  },
};

export const ResellerBookingsTable: React.FC<ResellerBookingsTableProps> = ({
  bookings,
  isLoading = false,
  onViewDetails,
}) => {
  // Formatage monétaire
  const formatMoney = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'XAF',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Formatage de la date
  const formatDate = (isoString: string) => {
    if (!isoString) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoString));
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
        <Ticket className="mb-3 h-10 w-10 text-slate-400" />
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Aucune réservation trouvée
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Les ventes attribuées à ce revendeur s'afficheront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th scope="col" className="px-6 py-3.5">Produit</th>
              <th scope="col" className="px-6 py-3.5">PNR / Réf</th>
              <th scope="col" className="px-6 py-3.5">Client</th>
              <th scope="col" className="px-6 py-3.5">Montant</th>
              <th scope="col" className="px-6 py-3.5">Statut</th>
              <th scope="col" className="px-6 py-3.5">Date</th>
              <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {bookings.map((booking) => {
              const statusInfo = STATUS_CONFIG[booking.status] || {
                label: booking.status,
                className: 'bg-slate-100 text-slate-700',
              };

              return (
                <tr
                  key={booking.id}
                  className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                >
                  {/* Produit / Summary */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                        {booking.offerType === 'FLIGHT' ? (
                          <Plane className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {booking.summary || 'Réservation'}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <User className="h-3 w-3" />
                          <span>
                            {booking.travelerCount} passager
                            {booking.travelerCount > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* PNR / Code de confirmation */}
                  <td className="px-6 py-4 font-mono text-xs">
                    {booking.pnrCode ? (
                      <span className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                        {booking.pnrCode}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Non émis</span>
                    )}
                  </td>

                  {/* Client / Email */}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <span className="block truncate max-w-[180px]" title={booking.contactEmail}>
                      {booking.contactEmail}
                    </span>
                  </td>

                  {/* Montant total */}
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                    {formatMoney(booking.totalAmount, booking.currency)}
                  </td>

                  {/* Statut */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusInfo.className}`}
                    >
                      {statusInfo.label}
                    </span>
                  </td>

                  {/* Date de réservation */}
                  <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {formatDate(booking.createdAt)}
                    </div>
                  </td>

                  {/* Bouton d'action */}
                  <td className="px-6 py-4 text-right">
                    {onViewDetails && (
                      <button
                        onClick={() => onViewDetails(booking.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Détails
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Skeleton de chargement
const TableSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    <div className="h-12 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50" />
    <div className="divide-y divide-slate-200 dark:divide-slate-800">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
          <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-6 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-20 rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  </div>
);