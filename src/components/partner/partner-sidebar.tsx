"use client";

import { useTranslations } from "next-intl";
import {
    LayoutDashboard,
    ListChecks,
    CalendarCheck,
    Settings,
    LogOut,
} from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { href: "/partner", key: "dashboard", icon: LayoutDashboard, exact: true },
    { href: "/partner/listings", key: "listings", icon: ListChecks },
    { href: "/partner/bookings", key: "bookings", icon: CalendarCheck },
    { href: "/partner/settings", key: "settings", icon: Settings },
] as const;

export function PartnerSidebar() {
    const t = useTranslations("Partner.sidebar");
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border/40 bg-background/70 px-3 py-6 lg:flex">
            <div className="mb-8 px-3">
                <span className="text-lg font-bold">{t("brandLabel")}</span>
            </div>

            <nav className="flex flex-1 flex-col gap-1">
                {NAV_ITEMS.map(({ href, key, icon: Icon, exact }) => {
                    const isActive = exact ? pathname === href : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="size-4" />
                            {t(key)}
                        </Link>
                    );
                })}
            </nav>

            <button
                onClick={logout}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
                <LogOut className="size-4" />
                {t("logout")}
            </button>
        </aside>
    );
}