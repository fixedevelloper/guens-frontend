"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";

export default function PrivacyPage() {
  const t = useTranslations("Legal");
  const locale = useLocale();
  const updatedAt = new Date("2026-07-15").toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sections = [1, 2, 3, 4] as const;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" />
        {t("backHome")}
      </Link>

      <h1 className="mt-6 text-2xl font-black tracking-tight sm:text-3xl">{t("privacyTitle")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("privacyUpdated", { date: updatedAt })}</p>

      <p className="mt-8 text-sm leading-relaxed text-muted-foreground sm:text-base">{t("privacyIntro")}</p>

      <div className="mt-8 space-y-8">
        {sections.map((n) => (
          <section key={n}>
            <h2 className="text-lg font-bold tracking-tight">{t(`privacySection${n}Title`)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t(`privacySection${n}Body`)}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
