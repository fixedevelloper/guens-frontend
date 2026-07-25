"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Plane,
  Building2,
  Globe,
  User,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Handshake,
} from "lucide-react";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const isFlightsActive = pathname.startsWith("/flights");
  const isHotelsActive = pathname.startsWith("/hotels");
  const isBecomeHostActive = pathname.startsWith("/become-host");

  return (
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

          {/* Logo & Brand */}
          <Link
              href="/"
              className="group flex items-center gap-2.5 py-1.5 transition-opacity hover:opacity-90"
          >
            <div className="relative h-16 w-40 sm:w-48 overflow-hidden rounded-md transition-transform duration-200 group-hover:scale-[0.98]">
              <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain object-left"
                  priority
              />
            </div>
          </Link>

          {/* Navigation centrale (Desktop uniquement) */}
          <nav className="hidden items-center gap-2 sm:flex">
            <Button
                asChild
                variant={isFlightsActive ? "secondary" : "ghost"}
                size="default"
                className={`gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isFlightsActive
                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Link href="/flights" className="flex items-center gap-2">
                <Plane className="size-5" />
                {t("flights")}
              </Link>
            </Button>

            <Button
                asChild
                variant={isHotelsActive ? "secondary" : "ghost"}
                size="default"
                className={`gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isHotelsActive
                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Link href="/hotels" className="flex items-center gap-2">
                <Building2 className="size-5" />
                {t("hotels")}
              </Link>
            </Button>
          </nav>

          {/* Actions de droite */}
          <div className="flex items-center gap-2.5">

            {/* CTA Devenir hôte (Desktop uniquement) */}
            <Button
                asChild
                variant={isBecomeHostActive ? "secondary" : "outline"}
                size="default"
                className={`hidden md:inline-flex gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isBecomeHostActive
                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                        : "border-border/60 hover:bg-muted"
                }`}
            >
              <Link href="/become-host" className="flex items-center gap-2">
                <Handshake className="size-5" />
                {t("becomeHost")}
              </Link>
            </Button>

            {/* Sélecteur de Langue */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-xl hover:bg-muted"
                    aria-label={t("language")}
                >
                  <Globe className="size-5 text-muted-foreground transition-colors hover:text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl border-border/40 p-1.5 shadow-md">
                {routing.locales.map((locale) => (
                    <DropdownMenuItem
                        key={locale}
                        onSelect={() => router.replace(pathname, { locale })}
                        className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium"
                    >
                      {locale === "fr" ? "Français" : "English"}
                    </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profil ou Connexion (Desktop uniquement) */}
            <div className="hidden sm:flex items-center gap-2">
              {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                          variant="outline"
                          size="default"
                          className="h-10 gap-2.5 rounded-xl border-border/60 px-4 hover:bg-muted"
                      >
                        <User className="size-5 text-muted-foreground" />
                        <span className="text-sm font-semibold max-w-[120px] truncate">
                      {user.fullName.split(" ")[0]}
                    </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60 rounded-xl border-border/40 p-1.5 shadow-lg">
                      <DropdownMenuItem disabled className="px-3 py-2 text-xs font-medium text-muted-foreground">
                        {t("greeting", { name: user.fullName })}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1" />
                      {isAdmin ? (
                          <DropdownMenuItem
                              onSelect={() => router.push("/admin")}
                              className="cursor-pointer gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium"
                          >
                            <ShieldCheck className="size-5 text-primary" />
                            {t("admin")}
                          </DropdownMenuItem>
                      ) : (
                          <DropdownMenuItem
                              onSelect={() => router.push("/dashboard")}
                              className="cursor-pointer gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium"
                          >
                            <LayoutDashboard className="size-5 text-muted-foreground" />
                            {t("dashboard")}
                          </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="my-1" />
                      <DropdownMenuItem
                          onSelect={logout}
                          className="cursor-pointer gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive focus:text-destructive"
                      >
                        <LogOut className="size-5" />
                        {t("logout")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              ) : (
                  <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="default" className="h-10 rounded-xl px-4 text-sm font-medium text-muted-foreground hover:text-foreground">
                      <Link href="/login">{t("login")}</Link>
                    </Button>
                    <Button asChild size="default" className="h-10 rounded-xl px-4 text-sm font-semibold shadow-sm shadow-primary/10">
                      <Link href="/register">{t("register")}</Link>
                    </Button>
                  </div>
              )}
            </div>

          </div>
        </div>
      </header>
  );
}