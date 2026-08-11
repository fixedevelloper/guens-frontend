// components/tracking/ticket-list.tsx
"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Printer, Ticket, CheckCircle2, Calendar, FileText, ChevronDown, Download, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSendTicketByEmailMutation, useTicketsQuery } from "@/hooks/use-tickets";
import { formatDateTime } from "@/lib/format";
import { getRememberedContactEmail } from "@/lib/booking-contact";
import type { ETicket } from "@/lib/api/types";

function escapeHtml(value: string): string {
  return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
}

/**
 * window.print() alone would print the whole current page (nav, every other ticket in the list,
 * ...) with no way to scope it to just this one - opens a minimal, self-contained window with
 * only this ticket's rendered document instead, so printing one ticket never drags the rest of
 * the page (or the other travelers' tickets) along with it. Only used as a fallback when the
 * backend hasn't produced a branded pdfUrl yet (generation still running, or failed) - once
 * pdfUrl exists, view/print open that PDF directly instead.
 */
function printPlainTextTicket(ticket: ETicket) {
  const printWindow = window.open("", "_blank", "width=480,height=640");
  if (!printWindow) return;
  printWindow.document.write(`<!doctype html>
<html>
<head>
<title>Billet ${escapeHtml(ticket.ticketNumber)}</title>
<meta charset="utf-8" />
<style>
  body { font-family: ui-monospace, "SFMono-Regular", Consolas, monospace; white-space: pre-wrap;
         font-size: 13px; line-height: 1.5; padding: 24px; color: #111; }
</style>
</head>
<body>${escapeHtml(ticket.document)}</body>
</html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onafterprint = () => printWindow.close();
  printWindow.print();
}

function ShareByEmailForm({ ticket, onClose }: { ticket: ETicket; onClose: () => void }) {
  const [email, setEmail] = useState(getRememberedContactEmail() ?? "");
  const mutation = useSendTicketByEmailMutation();

  const handleSend = () => {
    mutation.mutate(
        { ticketId: ticket.id, recipientEmail: email || undefined },
        {
          onSuccess: () => {
            toast.success("Billet envoyé par email.");
            onClose();
          },
          onError: () => toast.error("Échec de l'envoi du billet par email."),
        }
    );
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="destinataire@exemple.com"
        className="h-9 text-xs"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSend}
          disabled={mutation.isPending}
          className="gap-1.5 rounded-xl font-bold text-xs h-9 px-4"
        >
          <Send className="size-3.5 shrink-0" />
          {mutation.isPending ? "Envoi..." : "Envoyer"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl text-xs h-9 px-3">
          Annuler
        </Button>
      </div>
    </div>
  );
}

export function TicketList({ bookingId, enabled }: { bookingId: string; enabled: boolean }) {
  const t = useTranslations("Tickets");
  const locale = useLocale();
  const { data, isLoading } = useTicketsQuery(bookingId, enabled);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [sharingTicketId, setSharingTicketId] = useState<string | null>(null);

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
      {data.map((ticket) => {
        const hasPdf = Boolean(ticket.pdfUrl);
        return (
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
            <div className="flex flex-wrap items-center gap-2 sm:self-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  hasPdf
                    ? window.open(ticket.pdfUrl as string, "_blank")
                    : setExpandedTicketId(expandedTicketId === ticket.id ? null : ticket.id)
                }
                className="gap-1.5 rounded-xl font-bold text-xs py-5 px-4 transition-all active:scale-97"
              >
                {!hasPdf && (
                  <ChevronDown
                      className={`size-3.5 shrink-0 transition-transform ${expandedTicketId === ticket.id ? "rotate-180" : ""}`}
                  />
                )}
                {!hasPdf && expandedTicketId === ticket.id ? (t("hide") ?? "Masquer") : (t("view") ?? "Voir le billet")}
              </Button>
              {hasPdf && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="gap-1.5 rounded-xl font-bold text-xs py-5 px-4 transition-all active:scale-97"
                >
                  <a href={ticket.pdfUrl as string} download>
                    <Download className="size-3.5 shrink-0" />
                    Télécharger
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => (hasPdf ? window.open(ticket.pdfUrl as string, "_blank") : printPlainTextTicket(ticket))}
                className="gap-1.5 rounded-xl border-border/80 hover:border-primary/30 hover:bg-primary/5 hover:text-primary font-bold text-xs py-5 px-4 shadow-2xs transition-all active:scale-97"
              >
                <Printer className="size-3.5 shrink-0" />
                {t("print") ?? "Imprimer le billet"}
              </Button>
              {hasPdf && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSharingTicketId(sharingTicketId === ticket.id ? null : ticket.id)}
                  className="gap-1.5 rounded-xl border-border/80 hover:border-primary/30 hover:bg-primary/5 hover:text-primary font-bold text-xs py-5 px-4 shadow-2xs transition-all active:scale-97"
                >
                  <Send className="size-3.5 shrink-0" />
                  Partager par email
                </Button>
              )}
            </div>
          </div>

          {expandedTicketId === ticket.id && !hasPdf && (
            <div className="mx-5 mb-5 sm:mx-6 sm:mb-6 rounded-xl border border-border/60 bg-background/60 p-4 overflow-x-auto">
              <pre className="text-xs font-mono whitespace-pre-wrap text-foreground/90">{ticket.document}</pre>
            </div>
          )}

          {sharingTicketId === ticket.id && (
            <div className="mx-5 mb-5 sm:mx-6 sm:mb-6 rounded-xl border border-border/60 bg-background/60 p-4">
              <ShareByEmailForm ticket={ticket} onClose={() => setSharingTicketId(null)} />
            </div>
          )}

          {/* Décoration style billet d'avion (encoches latérales typiques en pointillés) */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 -ml-2 size-4 rounded-full bg-background border-r border-border/60 hidden sm:block" />
          <div className="absolute top-1/2 -translate-y-1/2 right-0 -mr-2 size-4 rounded-full bg-background border-l border-border/60 hidden sm:block" />
        </div>
        );
      })}
    </div>
  );
}
