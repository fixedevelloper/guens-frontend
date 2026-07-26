import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileSheetProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export function MobileSheet({ title, onClose, children }: MobileSheetProps) {
    // Empêche le défilement de l'arrière-plan et gère la touche Échap
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:justify-end lg:hidden">
            {/* Overlay / Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Conteneur principal */}
            <div className="relative z-10 flex h-[88dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-background shadow-2xl animate-in slide-in-from-bottom duration-300 sm:h-full sm:max-h-[92dvh] sm:w-[480px] sm:rounded-l-3xl sm:rounded-tr-none sm:slide-in-from-right">

                {/* Tirette mobile */}
                <div className="flex w-full justify-center pt-2.5 pb-1 sm:hidden">
                    <div className="h-1.5 w-12 rounded-full bg-muted-foreground/20" />
                </div>

                {/* En-tête fixe */}
                <div className="flex h-14 shrink-0 items-center justify-between border-b bg-muted/30 px-5">
          <span className="text-sm font-bold uppercase tracking-wider text-foreground">
            {title}
          </span>
                    <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={onClose}>
                        <X className="size-4" />
                    </Button>
                </div>

                {/* --- ZONE SCROLLABLE INTEGREE --- */}
                <div className="flex-1 overflow-y-auto p-5 pb-12 overscroll-contain">
                    {children}
                </div>
            </div>
        </div>
    );
}