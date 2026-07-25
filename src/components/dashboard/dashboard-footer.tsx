import { Link } from "@/i18n/navigation";

export function DashboardFooter() {
    return (
        <footer className="w-full border-t border-border/30 bg-card/50 py-5 mt-auto">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 text-xs text-muted-foreground font-medium">

                {/* Statut Système */}
                <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
                    <span className="font-semibold text-foreground/80">Services opérationnels</span>
                </div>

                {/* Copyright */}
                <p className="text-center sm:text-left text-muted-foreground/80">
                    &copy; {new Date().getFullYear()} GuenTours. Tous droits réservés.
                </p>

                {/* Liens de support */}
                <div className="flex items-center gap-4 text-xs font-semibold">
                    <Link href="/support" className="hover:text-foreground transition-colors">
                        Support
                    </Link>
                    <Link href="/terms" className="hover:text-foreground transition-colors">
                        CGU
                    </Link>
                    <Link href="/privacy" className="hover:text-foreground transition-colors">
                        Confidentialité
                    </Link>
                </div>

            </div>
        </footer>
    );
}