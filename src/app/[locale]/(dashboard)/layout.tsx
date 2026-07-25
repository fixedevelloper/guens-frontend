import { setRequestLocale } from "next-intl/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import React from "react";

export default async function DashboardLayout({
                                                  children,
                                                  params,
                                              }: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Active la locale pour le rendu statique / i18n
    setRequestLocale(locale);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-zinc-950 text-foreground">
            {/* Header global du Dashboard */}
            <DashboardHeader />

            {/* Zone de contenu principal */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer global du Dashboard */}
            <DashboardFooter />
        </div>
    );
}