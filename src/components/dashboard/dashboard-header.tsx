"use client";

import { Link } from "@/i18n/navigation";
import { Bell, HelpCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
    return (
        <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

                {/* Identité / Brand */}
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-xs transition-transform group-hover:scale-105">
                            G
                        </div>
                        <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight leading-none">
                GuenTours
              </span>
                            <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mt-0.5">
                Portal
              </span>
                        </div>
                    </Link>
                </div>

                {/* Actions Rapides */}
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mr-2">
                        <ShieldCheck className="size-3.5" />
                        <span>Session sécurisée</span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl size-9 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-zinc-900"
                    >
                        <Bell className="size-4" />
                        <span className="sr-only">Notifications</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl size-9 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-zinc-900"
                    >
                        <HelpCircle className="size-4" />
                        <span className="sr-only">Aide & Support</span>
                    </Button>
                </div>

            </div>
        </header>
    );
}