"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Wallet } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";

/** Space for the AGENT role (or ADMIN, see SecurityConfig's /api/agent/** rule) to confirm/reject
 *  manual payments - see ManualPaymentGateway/AgentPaymentController for the full picture. */
export default function AgentLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations("Agent");
    const router = useRouter();
    const { isAuthenticated, isAgent, isHydrated } = useAuth();

    useEffect(() => {
        if (isHydrated && !(isAuthenticated && isAgent)) {
            router.replace("/login");
        }
    }, [isHydrated, isAuthenticated, isAgent, router]);

    if (!isHydrated || !isAuthenticated || !isAgent) {
        return <AgentLayoutSkeleton />;
    }

    const navItems: DashboardNavItem[] = [
        { href: "/agent", label: t("navLabel"), icon: Wallet },
    ];

    return (
        <DashboardShell eyebrow={t("eyebrow")} navItems={navItems}>
            {children}
        </DashboardShell>
    );
}

function AgentLayoutSkeleton() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-8 animate-pulse space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-8 w-48 rounded-xl" />
            </div>
            <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
    );
}
