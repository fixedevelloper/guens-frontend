import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileNav } from "@/components/mobile-nav";

export default function PublicLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    return (
        <>
            <SiteHeader />
            <main className="flex-1 flex flex-col w-full animate-fade-in pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
                {children}
            </main>
            <SiteFooter />
            <MobileNav />
        </>
    );
}