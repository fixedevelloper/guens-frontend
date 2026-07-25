// components/hotel-detail/hotel-detail-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function HotelDetailSkeleton() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10 animate-fade-in">
            {/* Bouton de retour */}
            <div className="mb-5 -ml-2.5">
                <Skeleton className="h-8 w-36 rounded-xl" />
            </div>

            {/* Titre et métadonnées */}
            <div className="mb-6 space-y-3">
                <Skeleton className="h-8 sm:h-10 w-3/4 max-w-lg rounded-xl" />
                <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-44 rounded-lg" />
                    <Skeleton className="h-5 w-20 rounded-lg" />
                </div>
            </div>

            {/* Squelette de la Galerie Photo */}
            <div className="overflow-hidden rounded-2xl border border-border/20 bg-card p-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-72 sm:h-96">
                    <Skeleton className="md:col-span-2 h-full w-full rounded-xl" />
                    <div className="hidden md:grid grid-rows-2 gap-2 h-full">
                        <Skeleton className="h-full w-full rounded-xl" />
                        <Skeleton className="h-full w-full rounded-xl" />
                    </div>
                </div>
            </div>

            {/* Contenu principal : Description + Équipements + Sidebar Carte */}
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] items-start">
                {/* Colonne gauche */}
                <div className="grid gap-8">
                    {/* Section À propos */}
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-48 rounded-lg" />
                        <div className="space-y-2 pt-1">
                            <Skeleton className="h-4 w-full rounded-md" />
                            <Skeleton className="h-4 w-11/12 rounded-md" />
                            <Skeleton className="h-4 w-4/5 rounded-md" />
                        </div>
                    </div>

                    <Separator className="bg-border/60" />

                    {/* Section Équipements */}
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-52 rounded-lg" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/40 bg-muted/20">
                                    <Skeleton className="size-5 rounded-md shrink-0" />
                                    <Skeleton className="h-4 w-24 rounded-md" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Droite : Carte Localisation */}
                <aside className="lg:sticky lg:top-24">
                    <div className="rounded-2xl border border-border/50 bg-card p-4 space-y-4 shadow-2xs">
                        <Skeleton className="h-5 w-32 rounded-lg" />
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-3/4 rounded-md" />
                            <Skeleton className="h-3.5 w-1/2 rounded-md" />
                        </div>
                    </div>
                </aside>
            </div>

            <Separator className="my-10 bg-border/60" />

            {/* Section des Offres / Chambres disponibles */}
            <div className="space-y-6">
                <Skeleton className="h-7 w-56 rounded-xl" />
                <div className="grid gap-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-border/50 bg-card p-5 shadow-2xs space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-48 rounded-lg" />
                                    <Skeleton className="h-4 w-32 rounded-md" />
                                </div>
                                <div className="space-y-2 sm:text-right">
                                    <Skeleton className="h-7 w-28 rounded-lg sm:ml-auto" />
                                    <Skeleton className="h-3.5 w-20 rounded-md sm:ml-auto" />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Skeleton className="h-10 w-36 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}