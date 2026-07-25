// app/[locale]/(public)/layout.tsx
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PublicLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    return (
        <>
            <SiteHeader />
            <main className="flex-1 flex flex-col w-full animate-fade-in pb-16 md:pb-0">
                {children}
            </main>
            <SiteFooter />
        </>
    );
}