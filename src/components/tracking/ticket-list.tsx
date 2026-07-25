// components/checkout/ticket-list.tsx
"use client";

import { useLocale, useTranslations } from "next-intl";
import { Printer, Ticket, CheckCircle2, Calendar, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTicketsQuery } from "@/hooks/use-tickets";
import { formatDateTime } from "@/lib/format";

export function TicketList({ bookingId, enabled }: { bookingId: string; enabled: boolean }) {
  const t = useTranslations("Tickets");
  const locale = useLocale();
  const { data, isLoading } = useTicketsQuery(bookingId, enabled);

  if (!enabled) return null;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-2xl border border-border/55 p-5 bg-slate-50/20 dark:bg-zinc-900/10">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2.5 flex-1">
              <Skeleton className="h-5 w-1/3 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
              <Skeleton className="h-3.5 w-1/4 rounded-lg" />
            </div>
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-border/80 bg-slate-50/10 dark:bg-zinc-900/5">
        <Ticket className="size-8 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">{t("empty") ?? "Aucun billet disponible pour le moment."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((ticket) => (
        <div 
          key={ticket.id}
          className="group relative overflow-hidden rounded-2xl border border-border/60 bg-slate-50/30 dark:bg-zinc-900/10 hover:border-border/90 transition-all duration-200"
        >
          {/* Ligne esthétique supérieure de statut */}
          <div className="h-1 w-full bg-emerald-500/80" />

          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            
            {/* Détails du billet */}
            <div className="space-y-2">
              
              {/* En-tête : Numéro de billet */}
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Ticket className="size-4" />
                </div>
                <span className="text-sm font-bold text-foreground tracking-wide">
                  {t("ticketNumber", { number: ticket.ticketNumber }) ?? `Billet N° ${ticket.ticketNumber}`}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-2.5 stroke-[3]" />
                  Confirmé
                </span>
              </div>

              {/* Contenu principal */}
              <div className="space-y-1 pl-0.5">
                {ticket.providerConfirmationNumber && (
                  <p className="text-xs sm:text-sm font-semibold text-muted-foreground/95 flex items-center gap-1.5">
                    <FileText className="size-3.5 text-muted-foreground/60" />
                    <span className="text-muted-foreground/70 font-normal">Réf. confirmation :</span>
                    <span className="font-mono text-foreground">{ticket.providerConfirmationNumber}</span>
                  </p>
                )}
                
                <p className="text-xs text-muted-foreground/80 flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-muted-foreground/50" />
                  <span>{t("issuedAt", { date: formatDateTime(ticket.issuedAt, locale) }) ?? `Émis le ${formatDateTime(ticket.issuedAt, locale)}`}</span>
                </p>
              </div>
            </div>

            {/* Actions du billet */}
            <div className="flex items-center sm:self-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.print()}
                className="w-full sm:w-auto gap-1.5 rounded-xl border-border/80 hover:border-primary/30 hover:bg-primary/5 hover:text-primary font-bold text-xs py-5 px-4 shadow-2xs transition-all active:scale-97"
              >
                <Printer className="size-3.5 shrink-0" />
                {t("print") ?? "Imprimer le billet"}
              </Button>
            </div>
          </div>

          {/* Décoration style billet d'avion (encoches latérales typiques en pointillés) */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 -ml-2 size-4 rounded-full bg-background border-r border-border/60 hidden sm:block" />
          <div className="absolute top-1/2 -translate-y-1/2 right-0 -mr-2 size-4 rounded-full bg-background border-l border-border/60 hidden sm:block" />
        </div>
      ))}
    </div>
  );
}