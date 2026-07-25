"use client";

import { useTranslations } from "next-intl";
import { ListChecks, CalendarClock, Wallet } from "lucide-react";

const STAT_CARDS = [
    { key: "activeListings", icon: ListChecks },
    { key: "pendingBookings", icon: CalendarClock },
    { key: "monthlyRevenue", icon: Wallet },
] as const;

export default function PartnerDashboardPage() {
    const t = useTranslations("Partner.dashboard");

    return (
        <div>
            <h2 className="mb-6 text-xl font-semibold">{t("title")}</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {STAT_CARDS.map(({ key, icon: Icon }) => (
                    <div key={key} className="rounded-xl border border-border/60 p-5">
                        <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                            <Icon className="size-4" />
                            <span className="text-sm font-medium">{t(`cards.${key}`)}</span>
                        </div>
                        {/* TODO: brancher sur les vraies stats (GET /api/partners/{id}/stats à créer côté backend) */}
                        <p className="text-2xl font-bold">—</p>
                    </div>
                ))}
            </div>
        </div>
    );
}