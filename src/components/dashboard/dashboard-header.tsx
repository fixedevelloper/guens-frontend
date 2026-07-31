"use client";

import { Link } from "@/i18n/navigation";
import { Bell, HelpCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function DashboardHeader() {
    return (
        <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">

                {/* Identité / Brand */}
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="relative h-18 w-30 sm:h-12 sm:w-12 md:h-18 md:w-50 overflow-hidden rounded-xl shadow-xs transition-transform group-hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>
                </div>

                {/* Actions Rapides */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mr-2 sm:px-3 sm:py-1 sm:text-[11px]">
                        <ShieldCheck className="size-3.5" />
                        <span className="hidden sm:inline">Session sécurisée</span>
                        <span className="inline sm:hidden">Sécurisé</span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Notifications"
                        className="rounded-xl size-9 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-zinc-900"
                    >
                        <Bell className="size-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Aide & Support"
                        className="rounded-xl size-9 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-zinc-900"
                    >
                        <HelpCircle className="size-4" />
                    </Button>
                </div>

            </div>
        </header>
    );
}