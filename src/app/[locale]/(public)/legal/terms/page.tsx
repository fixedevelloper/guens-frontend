import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";

/** Same rationale as legal/privacy/page.tsx: static translated content, converted to a Server
 *  Component instead of hydrating next-intl's client runtime for zero interactivity. */
export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Legal");
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

      <h1 className="mt-6 text-2xl font-black tracking-tight sm:text-3xl">{t("termsTitle")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("termsUpdated", { date: updatedAt })}</p>

      <p className="mt-8 text-sm leading-relaxed text-muted-foreground sm:text-base">{t("termsIntro")}</p>

      <div className="mt-8 space-y-8">
        {sections.map((n) => (
          <section key={n}>
            <h2 className="text-lg font-bold tracking-tight">{t(`termsSection${n}Title`)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t(`termsSection${n}Body`)}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
