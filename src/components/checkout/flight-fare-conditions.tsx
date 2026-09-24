// components/checkout/flight-fare-conditions.tsx
"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";
import { useLocale, useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import { useFlightFareRules } from "@/hooks/use-search";
import { formatMoney } from "@/lib/format";
import type { FlightFareBreakdown, FlightFarePenalty, FlightFareRules } from "@/lib/api/types";

/**
 * Détail du prix : tarif et taxes par passager tels que facturés par la compagnie, puis nos frais
 * de service (la différence avec le total affiché) - exigence de certification Travel Terminus :
 * « base fare, taxes, and total clearly displayed per passenger... no undisclosed charges ».
 */
export function FlightFareBreakdownLines({ breakdown, displayedAmount, displayedCurrency }: {
  breakdown: FlightFareBreakdown;
  /** Prix du vol affiché (frais de service inclus, options exclues). */
  displayedAmount: number;
  displayedCurrency: string;
}) {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const money = (amount: number) => formatMoney({ amount, currency: breakdown.currency }, locale);
  const rows = [
    { key: "adult", label: t("fareBreakdownAdult"), count: breakdown.adults, base: breakdown.adultBaseFare, tax: breakdown.adultTax },
    { key: "child", label: t("fareBreakdownChild"), count: breakdown.children, base: breakdown.childBaseFare, tax: breakdown.childTax },
    { key: "infant", label: t("fareBreakdownInfant"), count: breakdown.infants, base: breakdown.infantBaseFare, tax: breakdown.infantTax },
  ].filter((row) => row.count > 0 && row.base !== null);
  const serviceFee = breakdown.total !== null && displayedCurrency === breakdown.currency
      ? displayedAmount - breakdown.total
      : null;

  if (rows.length === 0) {
    return null;
  }
  return (
      <div className="space-y-1.5 text-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t("fareBreakdownTitle")}</span>
        {rows.map((row) => (
            <div key={row.key} className="flex items-start justify-between gap-3 text-muted-foreground">
              <span>
                {row.label} × {row.count}
                <span className="block text-[10px]">
                  {t("fareBreakdownPerPassenger", { base: money(row.base ?? 0), tax: money(row.tax ?? 0) })}
                </span>
              </span>
              <span className="font-semibold text-foreground">{money(((row.base ?? 0) + (row.tax ?? 0)) * row.count)}</span>
            </div>
        ))}
        {serviceFee !== null && serviceFee > 0.005 && (
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{t("fareBreakdownServiceFee")}</span>
              <span className="font-semibold text-foreground">{money(serviceFee)}</span>
            </div>
        )}
      </div>
  );
}

function penaltyLine(penalty: FlightFarePenalty, money: (amount: number, currency: string) => string, perAdult: string) {
  const parts: string[] = [];
  if (penalty.adultCharges !== null && penalty.currency) {
    parts.push(`${money(penalty.adultCharges, penalty.currency)} ${perAdult}`);
  }
  if (penalty.remarks) {
    parts.push(penalty.remarks);
  }
  return parts.join(" - ");
}

/**
 * Conditions d'annulation et de modification, chargées à la demande et affichées avant la
 * confirmation (certification TC-08/09). Le HTML fourni par la compagnie est assaini.
 */
export function FlightFareConditions({ offerId }: { offerId: string }) {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const { data, isLoading, isError } = useFlightFareRules(offerId);
  const money = (amount: number, currency: string) => formatMoney({ amount, currency }, locale);

  return (
      <details className="group rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-xs">
        <summary className="flex cursor-pointer items-center gap-1.5 font-bold text-foreground/85">
          <FileText className="size-3.5 shrink-0" />
          {t("fareConditionsTitle")}
        </summary>
        <div className="mt-2 space-y-3 text-muted-foreground">
          {isLoading && <p>{t("fareConditionsLoading")}</p>}
          {!isLoading && (isError || !data) && <p>{t("fareConditionsUnavailable")}</p>}
          {data && <FareRulesLegs rules={data} money={money} perAdult={t("fareConditionsPerAdult")}
                                  cancellationLabel={t("fareConditionsCancellation")}
                                  rescheduleLabel={t("fareConditionsReschedule")} />}
        </div>
      </details>
  );
}

function FareRulesLegs({ rules, money, perAdult, cancellationLabel, rescheduleLabel }: {
  rules: FlightFareRules;
  money: (amount: number, currency: string) => string;
  perAdult: string;
  cancellationLabel: string;
  rescheduleLabel: string;
}) {
  const sanitized = useMemo(
      () => rules.legs.map((leg) => [leg.cancellationHtml, leg.rescheduleHtml, leg.remarksHtml]
          .filter((html): html is string => Boolean(html))
          .map((html) => DOMPurify.sanitize(html))
          .join("")),
      [rules]
  );
  return (
      <>
        {rules.legs.map((leg, index) => (
            <div key={`${leg.departure}-${leg.arrival}-${index}`} className="space-y-1">
              {(leg.departure || leg.arrival) && (
                  <p className="font-semibold text-foreground/80">{leg.departure} → {leg.arrival}</p>
              )}
              {leg.cancellation.map((penalty, i) => (
                  <p key={`c-${i}`}><strong>{cancellationLabel} :</strong> {penaltyLine(penalty, money, perAdult)}</p>
              ))}
              {leg.reschedule.map((penalty, i) => (
                  <p key={`r-${i}`}><strong>{rescheduleLabel} :</strong> {penaltyLine(penalty, money, perAdult)}</p>
              ))}
              {sanitized[index] && (
                  <div className="prose prose-xs max-w-none text-[11px]" dangerouslySetInnerHTML={{ __html: sanitized[index] }} />
              )}
            </div>
        ))}
      </>
  );
}
