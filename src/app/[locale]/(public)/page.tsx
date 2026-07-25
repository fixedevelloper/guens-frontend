"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plane,
  Building2,
  ShieldCheck,
  RadioTower,
  Layers,
  ArrowRight,
  Search,
  CreditCard,
  Users,
  Headphones,
  BadgeCheck,
} from "lucide-react";

import { useRouter, Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlightSearchForm } from "@/components/search/flight-search-form";
import { HotelSearchForm } from "@/components/search/hotel-search-form";
import { flightSearchParamsToQuery, hotelSearchParamsToQuery, multiCitySearchParamsToQuery } from "@/lib/search-params";
import type { FlightSearchParams, HotelSearchParams, MultiCityFlightSearchParams } from "@/lib/api/types";
import {AppPromo} from "../../../components/AppPromo";

const HERO_CONFIGS = {
  flights: {
    bgImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80",
  },
  hotels: {
    bgImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80",
  }
};

const DESTINATIONS = [
  { key: "destinationParis", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80" },
  { key: "destinationNewYork", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80" },
  { key: "destinationDubai", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80" },
  { key: "destinationBali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80" },
  { key: "destinationTokyo", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80" },
  { key: "destinationMarrakech", image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=800&q=80" },
] as const;

export default function HomePage() {
  const t = useTranslations("Home");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"flights" | "hotels">("flights");

  function handleFlightSearch(params: FlightSearchParams) {
    router.push(`/flights?${flightSearchParamsToQuery(params)}`);
  }

  function handleMultiCitySearch(params: MultiCityFlightSearchParams) {
    router.push(`/flights/multi-city?${multiCitySearchParamsToQuery(params)}`);
  }

  function handleHotelSearch(params: HotelSearchParams) {
    router.push(`/hotels?${hotelSearchParamsToQuery(params)}`);
  }

  return (
    <div className="relative min-h-screen">
      
      {/* SECTION HERO UNIFIÉE */}
      <section className="relative w-full overflow-hidden bg-zinc-800 text-white pt-20 pb-32 sm:pt-28 sm:pb-40 flex items-center justify-center">
        {Object.entries(HERO_CONFIGS).map(([key, config]) => (
          <div
            key={key}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              activeTab === key ? "opacity-45 scale-100" : "opacity-0 scale-105"
            } transform duration-[1500ms]`}
            style={{
              backgroundImage: `url('${config.bgImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/40 to-neutral-950/80" />
        
        <div className="relative z-10 mx-auto w-full max-w-4xl px-4 text-center">
          
          {/* Badge Dynamique */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-semibold tracking-wide text-white uppercase transition-all duration-300">
            {activeTab === "flights" ? <Plane className="size-3 sm:size-3.5" /> : <Building2 className="size-3 sm:size-3.5" />}
            {activeTab === "flights" ? t("badgeFlights") : t("badgeHotels")}
          </span>

          {/* Titre Dynamique H1 unique pour le SEO */}
          <div className="mt-4 sm:mt-6 grid grid-cols-1">
            <h1 className="col-start-1 row-start-1 text-3xl font-black tracking-tight text-balance sm:text-5xl md:text-6xl text-white drop-shadow-md">
              <span key={activeTab} className="inline-block animate-fade-in-up">
                {activeTab === "flights" ? t("heroTitleFlights") : t("heroTitleHotels")}
              </span>
            </h1>
          </div>

          {/* Sous-titre Dynamique */}
          <div className="mt-3 sm:mt-4 grid grid-cols-1">
            <p className="col-start-1 row-start-1 mx-auto max-w-2xl text-sm text-zinc-200 text-balance sm:text-base md:text-lg leading-relaxed drop-shadow">
              <span key={activeTab} className="inline-block animate-fade-in-up delay-75">
                {activeTab === "flights" ? t("heroSubtitleFlights") : t("heroSubtitleHotels")}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* FORMULAIRE DE RECHERCHE */}
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Card className="-mt-16 sm:-mt-24 border-border/40 bg-background/80 backdrop-blur-2xl shadow-2xl shadow-primary/5 transition-all duration-300 hover:border-border/60">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <Tabs 
              value={activeTab} 
              onValueChange={(val) => setActiveTab(val as "flights" | "hotels")} 
              className="w-full"
            >
              <TabsList className="mb-4 sm:mb-6 flex h-auto items-center justify-start rounded-xl bg-muted/60 p-1 text-muted-foreground w-full sm:w-max overflow-x-auto">
                <TabsTrigger 
                  value="flights" 
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 sm:px-5 text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md"
                >
                  <Plane className="size-3.5 sm:size-4" />
                  {t("tabFlights")}
                </TabsTrigger>
                <TabsTrigger 
                  value="hotels" 
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 sm:px-5 text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md"
                >
                  <Building2 className="size-3.5 sm:size-4" />
                  {t("tabHotels")}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="flights" className="focus-visible:outline-none mt-0">
                <FlightSearchForm onSearch={handleFlightSearch} onMultiCitySearch={handleMultiCitySearch} />
              </TabsContent>
              <TabsContent value="hotels" className="focus-visible:outline-none mt-0">
                <HotelSearchForm onSearch={handleHotelSearch} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Statistiques / Preuve sociale */}
        <div className="grid grid-cols-2 gap-4 pt-10 sm:pt-14 sm:grid-cols-4 sm:gap-6">
          <Stat icon={<Users className="size-4" />} value="100k+" label={t("statTravelers")} />
          <Stat icon={<Layers className="size-4" />} value="Direct" label={t("statDirectAccess")} />
          <Stat icon={<Headphones className="size-4" />} value="24h/7" label={t("statSupport")} />
          <Stat icon={<BadgeCheck className="size-4" />} value="100%" label={t("statSecure")} />
        </div>

        {/* Section Features */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 py-12 sm:py-20 lg:py-24 md:grid-cols-3">
          <Feature
            icon={<Layers className="size-5" />}
            title={t("feature1Title")}
            body={t("feature1Body")}
          />
          <Feature
            icon={<ShieldCheck className="size-5" />}
            title={t("feature2Title")}
            body={t("feature2Body")}
          />
          <Feature
            icon={<RadioTower className="size-5" />}
            title={t("feature3Title")}
            body={t("feature3Body")}
          />
        </div>
      </div>

      {/* COMMENT ÇA MARCHE */}
      <section className="border-t border-border/40 bg-muted/30 py-16 sm:py-24" aria-label={t("howItWorksTitle")}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              {t("howItWorksEyebrow")}
            </span>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{t("howItWorksTitle")}</h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">{t("howItWorksSubtitle")}</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-14 md:grid-cols-3 md:gap-8">
            <Step number={1} icon={<Search className="size-5" />} title={t("step1Title")} body={t("step1Body")} />
            <Step number={2} icon={<CreditCard className="size-5" />} title={t("step2Title")} body={t("step2Body")} />
            <Step number={3} icon={<Plane className="size-5" />} title={t("step3Title")} body={t("step3Body")} />
          </div>
        </div>
      </section>

      {/* DESTINATIONS POPULAIRES */}
      <section className="py-16 sm:py-24" aria-label={t("destinationsTitle")}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                {t("destinationsEyebrow")}
              </span>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{t("destinationsTitle")}</h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">{t("destinationsSubtitle")}</p>
            </div>
            <Link
              href="/flights"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              {t("exploreAllFlights")}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-5 md:grid-cols-3">
            {DESTINATIONS.map(({ key, image }) => (
              <Link
                key={key}
                href="/flights"
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border/40 shadow-sm transition-all duration-300 hover:shadow-lg sm:aspect-[3/4]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url('${image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <p className="text-sm font-bold text-white drop-shadow sm:text-base">{t(key)}</p>
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-white/80 opacity-0 transition-opacity group-hover:opacity-100 sm:text-xs">
                    {t("exploreFlightsAction")}
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <AppPromo />
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-5 transition-all duration-300 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/[0.02] md:hover:-translate-y-1">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </span>
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-1 group-hover:text-primary transition-colors duration-300">
          {title}
          <ArrowRight className="size-3.5 opacity-0 -translate-x-2 transition-all duration-300 md:group-hover:opacity-100 md:group-hover:translate-x-0" />
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground/80 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/40 bg-card/40 p-4 text-center backdrop-blur-sm sm:items-start sm:text-left">
      <span className="flex items-center gap-1.5 text-primary">
        {icon}
        <span className="text-lg font-black tracking-tight text-foreground sm:text-2xl">{value}</span>
      </span>
      <span className="text-[11px] font-medium text-muted-foreground sm:text-xs">{label}</span>
    </div>
  );
}

function Step({ number, icon, title, body }: { number: number; icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="relative flex flex-col gap-3 rounded-2xl border border-border/40 bg-background p-6 shadow-sm">
      <span className="absolute -top-3 -left-3 flex size-8 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground shadow-md">
        {number}
      </span>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="space-y-1">
        <h2 className="text-base font-bold tracking-tight">{title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground/80">{body}</p>
      </div>
    </div>
  );
}