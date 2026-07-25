"use client";

import { useLocale, useTranslations } from "next-intl";
import { Banknote, Hash } from "lucide-react";

import { useCommissionWalletQuery } from "@/hooks/use-admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";

export default function AdminCommissionPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const walletQuery = useCommissionWalletQuery();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("commissionWallet")}</h1>
        <p className="text-sm text-muted-foreground">{t("commissionSubtitle")}</p>
      </div>

      {walletQuery.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : walletQuery.isError ? (
        <Alert variant="destructive">
          <AlertDescription>{t("loadError")}</AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Banknote className="size-5 text-muted-foreground" />
                {t("walletBalance")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {walletQuery.data && walletQuery.data.balances.length > 0 ? (
                walletQuery.data.balances.map((balance) => (
                  <p key={balance.currency} className="text-2xl font-semibold">
                    {formatMoney(balance, locale)}
                  </p>
                ))
              ) : (
                <p className="text-2xl font-semibold">{formatMoney({ amount: 0, currency: "EUR" }, locale)}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Hash className="size-5 text-muted-foreground" />
                {t("walletEntryCount")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{walletQuery.data?.entryCount ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
