import type { Money } from "@/lib/api/types";

export function formatMoney(money: Money, locale: string) {
  const amount = typeof money.amount === "string" ? Number(money.amount) : money.amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateTime(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatTime(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(iso)
  );
}

export function formatDuration(startIso: string, endIso: string) {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  const totalMinutes = Math.max(0, Math.round(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h${minutes.toString().padStart(2, "0")}`;
}

export function providerLabel(providerType: string) {
  return providerType.charAt(0) + providerType.slice(1).toLowerCase();
}

const AIRLINE_NAMES: Record<string, string> = {
  AF: "Air France",
  DL: "Delta Air Lines",
  SB: "Skyline Blue Airways",
  TO: "Trans Oceanic Airways",
  TP: "TransPacific Airlines",
};

export function airlineLabel(airlineCode: string) {
  return AIRLINE_NAMES[airlineCode] ?? airlineCode;
}
