import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    display: "swap",
});
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap",
});

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
                                           params,
                                       }: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Metadata" });
    return {
        title: t("title"),
        description: t("description"),
        // Unlike sitemap.xml/robots.ts (which read the incoming request's Host header instead,
        // see src/lib/site-url.ts), this stays a NEXT_PUBLIC_ build-time constant on purpose:
        // deriving it from the request would force every page under this layout into dynamic
        // (per-request) rendering, losing static generation site-wide, for a value that (today)
        // resolves nothing - no page sets a relative openGraph/twitter image or URL yet. Because
        // NEXT_PUBLIC_ vars are inlined at `next build` time, NOT read at server start: set the
        // real production domain in NEXT_PUBLIC_APP_URL wherever `next build` actually runs for
        // this app, THEN build/deploy - changing it after the fact (e.g. only in the running
        // container's env) has no effect until the next rebuild. Note: .github/workflows/deploy.yml
        // currently only builds/deploys the Spring Boot backend Docker image - the frontend build
        // step lives outside this repo's CI, so make sure NEXT_PUBLIC_APP_URL is set correctly
        // wherever that happens.
        metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    };
}

export default async function LocaleLayout({
                                               children,
                                               params,
                                           }: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
        notFound();
    }

    setRequestLocale(locale);
    const messages = await getMessages();

    return (
        <html
            lang={locale}
            className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
            suppressHydrationWarning
        >
        <body className="min-h-full flex flex-col bg-background font-sans text-foreground transition-colors duration-300">
        <NextIntlClientProvider messages={messages}>
            <Providers>
                {/* Conteneur fluide sans animation ni transform qui casserait le fixed */}
                <div className="flex-1 flex flex-col w-full">
                    {children}
                </div>
                <Toaster
                    richColors
                    position="top-right"
                    closeButton
                    theme="system"
                />
            </Providers>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}