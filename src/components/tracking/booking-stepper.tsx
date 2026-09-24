import { AlertTriangle, Check, CreditCard, FileText, ShieldCheck, Ticket, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/api/types";

interface BookingStepperProps {
  status: BookingStatus;
  /** CONFIRMED flight still waiting for its e-ticket numbers - the "tickets" step stays current. */
  awaitingTickets?: boolean;
}

const STEPS = [
  { id: 1, icon: FileText, labelKey: "stepperCreated" },
  { id: 2, icon: CreditCard, labelKey: "stepperPayment" },
  { id: 3, icon: ShieldCheck, labelKey: "stepperConfirmation" },
  { id: 4, icon: Ticket, labelKey: "stepperTickets" },
] as const;

// Which step is "current" for each non-terminal status - CONFIRMED means the tickets step is under
// way; it's only done (every step completed) once the tickets have actually arrived.
const STEP_FOR_STATUS: Partial<Record<BookingStatus, number>> = {
  PENDING_HOLD: 1,
  PENDING_PAYMENT: 2,
  DEPOSIT_PAID: 2,
  PAID: 3,
  CONFIRMING: 3,
  CONFIRMED: 4,
};

// CANCEL_REQUESTED isn't final (it becomes CANCELLED once the provider confirms), but the booking
// flow is interrupted all the same - shown like the terminal statuses.
const TERMINAL_STATUSES: BookingStatus[] = ["FAILED", "CANCELLED", "PRICE_CHANGED", "CANCEL_REQUESTED"];

export function BookingStepper({ status, awaitingTickets = false }: BookingStepperProps) {
  const t = useTranslations("Tracking");
  const isTerminal = TERMINAL_STATUSES.includes(status);
  // Terminal statuses have no reliable "which step were we on" data (no per-step history is
  // persisted), so the stepper deliberately renders an interrupted state instead of guessing a
  // step number - see BookingStepper's plan notes.
  const currentStep = isTerminal ? 0
      : status === "CONFIRMED" && !awaitingTickets ? STEPS.length + 1
      : STEP_FOR_STATUS[status] ?? 1;

  return (
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = !isTerminal && currentStep > step.id;
            const isCurrent = !isTerminal && currentStep === step.id;

            return (
                <div key={step.id} className="flex flex-col items-center text-center">
                  <div
                      className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl font-semibold text-sm transition-all duration-200",
                          isCompleted && "bg-emerald-500 text-white shadow-md shadow-emerald-500/20",
                          isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-md animate-pulse",
                          isTerminal && "bg-muted text-muted-foreground/50",
                          !isCompleted && !isCurrent && !isTerminal && "bg-muted text-muted-foreground",
                      )}
                  >
                    {isCompleted ? <Check className="size-5" /> : <Icon className="size-5" />}
                  </div>
                  <span
                      className={cn(
                          "mt-2 text-[11px] font-semibold hidden sm:block",
                          isTerminal ? "text-muted-foreground/50" : "text-foreground",
                      )}
                  >
                {t(step.labelKey)}
              </span>
                </div>
            );
          })}
        </div>

        {isTerminal && (
            <div
                className={cn(
                    "flex items-center gap-2.5 rounded-xl border p-3 text-xs font-semibold",
                    status === "PRICE_CHANGED" || status === "CANCEL_REQUESTED"
                        ? "border-orange-500/20 bg-orange-500/[0.04] text-orange-600 dark:text-orange-400"
                        : "border-destructive/20 bg-destructive/[0.04] text-destructive",
                )}
            >
              {status === "PRICE_CHANGED" || status === "CANCEL_REQUESTED" ? (
                  <AlertTriangle className="size-4 shrink-0" />
              ) : (
                  <XCircle className="size-4 shrink-0" />
              )}
              <span>{t(`stepperInterrupted.${status}`)}</span>
            </div>
        )}
      </div>
  );
}
