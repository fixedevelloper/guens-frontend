"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Cookie } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCookieConsent } from "@/context/cookie-consent-context";

export function CookieConsentBanner() {
  const t = useTranslations("CookieConsent");
  const { consent, isBannerOpen, acceptAll, rejectNonEssential, savePreferences } = useCookieConsent();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    if (isBannerOpen) {
      setIsCustomizing(false);
      setAnalyticsEnabled(consent?.preferences.analytics ?? false);
    }
  }, [isBannerOpen, consent]);

  if (!isBannerOpen) return null;

  return (
      <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-background/95 p-4 shadow-2xl backdrop-blur-md sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Cookie className="size-5" />
            </span>

            <div className="min-w-0 flex-1 space-y-1">
              <h2 className="text-sm font-bold">{t("title")}</h2>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {t("description")}{" "}
                <Link href="/legal/privacy" className="font-medium text-primary hover:underline">
                  {t("privacyLinkLabel")}
                </Link>
              </p>
            </div>
          </div>

          {isCustomizing && (
              <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/40 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{t("necessaryLabel")}</p>
                    <p className="text-xs text-muted-foreground">{t("necessaryDescription")}</p>
                  </div>
                  <Switch checked disabled aria-label={t("necessaryLabel")} />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{t("analyticsLabel")}</p>
                    <p className="text-xs text-muted-foreground">{t("analyticsDescription")}</p>
                  </div>
                  <Switch
                      checked={analyticsEnabled}
                      onCheckedChange={setAnalyticsEnabled}
                      aria-label={t("analyticsLabel")}
                  />
                </div>
              </div>
          )}

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            {isCustomizing ? (
                <Button size="sm" onClick={() => savePreferences({ analytics: analyticsEnabled })} className="rounded-xl font-semibold">
                  {t("save")}
                </Button>
            ) : (
                <>
                  <Button size="sm" variant="ghost" onClick={() => setIsCustomizing(true)} className="rounded-xl font-medium">
                    {t("customize")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={rejectNonEssential} className="rounded-xl font-semibold">
                    {t("rejectNonEssential")}
                  </Button>
                  <Button size="sm" onClick={acceptAll} className="rounded-xl font-semibold">
                    {t("acceptAll")}
                  </Button>
                </>
            )}
          </div>
        </div>
      </div>
  );
}
