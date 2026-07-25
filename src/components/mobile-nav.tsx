"use client";

import { Plane, Building2, User, LogIn, Handshake, Home } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";

export function MobileNav() {
    const t = useTranslations("Nav");
    const pathname = usePathname();
    const { user, isAuthenticated, isAdmin } = useAuth();

    const isFlightsActive = pathname.startsWith("/flights");
    const isHotelsActive = pathname.startsWith("/hotels");
    const isHomeActive = pathname === "/";
    const isDashboardActive = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
    const isBecomeHostActive = pathname.startsWith("/become-host");

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex w-full items-center justify-around border-t border-border/40 bg-background/95 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-lg sm:hidden shadow-lg">

            {/* Accueil */}
            <Link
                href="/"
                className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                    isHomeActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
            >
                <div className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                    isHomeActive ? "bg-primary/10" : ""
                }`}>
                    <Home className="size-5" />
                </div>
                <span>Accueil</span>
            </Link>

            {/* Vols */}
            <Link
                href="/flights"
                className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                    isFlightsActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
            >
                <div className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                    isFlightsActive ? "bg-primary/10" : ""
                }`}>
                    <Plane className="size-5" />
                </div>
                <span>{t("flights")}</span>
            </Link>

            {/* Hôtels */}
            <Link
                href="/hotels"
                className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                    isHotelsActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
            >
                <div className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                    isHotelsActive ? "bg-primary/10" : ""
                }`}>
                    <Building2 className="size-5" />
                </div>
                <span>{t("hotels")}</span>
            </Link>

            {/* Devenir hôte */}
            <Link
                href="/become-host"
                className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                    isBecomeHostActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
            >
                <div className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                    isBecomeHostActive ? "bg-primary/10" : ""
                }`}>
                    <Handshake className="size-5" />
                </div>
                <span>{t("becomeHost")}</span>
            </Link>

            {/* Profil / Connexion */}
            {isAuthenticated && user ? (
                <Link
                    href={isAdmin ? "/admin" : "/dashboard"}
                    className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                        isDashboardActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <div className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                        isDashboardActive ? "bg-primary/10" : ""
                    }`}>
                        <User className="size-5" />
                    </div>
                    <span className="max-w-[55px] truncate">{user.fullName.split(" ")[0]}</span>
                </Link>
            ) : (
                <Link
                    href="/login"
                    className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                        pathname.startsWith("/login") || pathname.startsWith("/register") ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <div className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                        pathname.startsWith("/login") ? "bg-primary/10" : ""
                    }`}>
                        <LogIn className="size-5" />
                    </div>
                    <span>{t("login")}</span>
                </Link>
            )}

        </nav>
    );
}