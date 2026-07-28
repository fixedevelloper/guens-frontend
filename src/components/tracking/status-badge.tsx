import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/lib/api/types";

// Mapping des variantes Shadcn + Classes Tailwind spécifiques pour une finition propre
const STATUS_CONFIG: Record<
    BookingStatus,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      className?: string;
    }
> = {
  PENDING_PAYMENT: {
    variant: "secondary",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  },
  DEPOSIT_PAID: {
    variant: "outline",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40 font-bold",
  },
  PAID: {
    variant: "outline",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40 font-bold",
  },
  CONFIRMING: {
    variant: "outline",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40 font-bold animate-pulse",
  },
  CONFIRMED: {
    variant: "outline",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40 font-bold",
  },
  FAILED: {
    variant: "destructive",
  },
  CANCELLED: {
    variant: "secondary",
    className: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40",
  },
};

export function StatusBadge({ status }: { status: BookingStatus | string }) {
  const t = useTranslations("Tracking");

  // Configuration par défaut si le statut envoyé est inconnu ou indisponible
  const config = STATUS_CONFIG[status as BookingStatus] ?? {
    variant: "outline" as const,
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  // Clé de traduction dynamique
  const label = t.has(`status.${status}`) ? t(`status.${status}`) : status;

  return (
      <Badge variant={config.variant} className={`text-[10px] font-bold uppercase tracking-wider ${config.className ?? ""}`}>
        {label}
      </Badge>
  );
}