"use client";

import { useState, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { ArrowLeftRight, CalendarDays, Plane, Plus, Search, Trash2, Users } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { FieldShell } from "@/components/search/field-shell";
import { CounterField } from "@/components/search/counter-field";
import { LocationAutocomplete } from "@/components/search/location-autocomplete";
import { searchAirportSuggestions } from "@/lib/api/geo";
import { cn } from "@/lib/utils";
import type { FlightLeg, FlightSearchParams, JourneyType, MultiCityFlightSearchParams } from "@/lib/api/types";

const today = () => new Date().toISOString().slice(0, 10);

const MIN_LEGS = 2;
const MAX_LEGS = 6;

function blankLeg(departureDate = today()): FlightLeg {
  return { origin: "", destination: "", departureDate };
}

const schema = z
  .object({
    origin: z.string().trim().min(3, "").max(3, "").transform((v) => v.toUpperCase()),
    destination: z.string().trim().min(3, "").max(3, "").transform((v) => v.toUpperCase()),
    departureDate: z.string().min(1, ""),
    returnDate: z.string().optional(),
    journeyType: z.enum(["ONE_WAY", "ROUND_TRIP"]),
    adults: z.coerce.number().min(1).max(9),
    children: z.coerce.number().min(0).max(9),
    infants: z.coerce.number().min(0).max(9),
    cabinClass: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]),
    currency: z.string().length(3),
  })
  .refine((data) => data.journeyType !== "ROUND_TRIP" || !!data.returnDate, {
    message: "",
    path: ["returnDate"],
  });

export type FlightSearchFormValues = z.input<typeof schema>;
export type FlightSearchFormOutput = z.output<typeof schema>;

interface FlightSearchFormProps {
  defaultValues?: Partial<FlightSearchParams>;
  defaultLegs?: FlightLeg[];
  onSearch: (params: FlightSearchParams) => void;
  onMultiCitySearch: (params: MultiCityFlightSearchParams) => void;
  isSearching?: boolean;
}

export function FlightSearchForm({
  defaultValues,
  defaultLegs,
  onSearch,
  onMultiCitySearch,
  isSearching,
}: FlightSearchFormProps) {
  const t = useTranslations("FlightSearch");

  const [journeyType, setJourneyType] = useState<JourneyType>(
    (defaultValues?.journeyType as JourneyType) ?? (defaultLegs ? "MULTI_CITY" : "ONE_WAY")
  );
  const [legs, setLegs] = useState<FlightLeg[]>(defaultLegs ?? [blankLeg(), blankLeg()]);

  const form = useForm<FlightSearchFormValues, unknown, FlightSearchFormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      origin: defaultValues?.origin ?? "",
      destination: defaultValues?.destination ?? "",
      departureDate: defaultValues?.departureDate ?? today(),
      returnDate: defaultValues?.returnDate ?? "",
      journeyType: defaultValues?.journeyType === "ROUND_TRIP" ? "ROUND_TRIP" : "ONE_WAY",
      adults: defaultValues?.adults ?? 1,
      children: defaultValues?.children ?? 0,
      infants: defaultValues?.infants ?? 0,
      cabinClass: (defaultValues?.cabinClass as FlightSearchFormValues["cabinClass"]) ?? "ECONOMY",
      currency: defaultValues?.currency ?? "EUR",
    },
  });

  const adults = form.watch("adults") ?? 1;
  const children = form.watch("children") ?? 0;
  const infants = form.watch("infants") ?? 0;
  const cabinClass = form.watch("cabinClass");
  const currency = form.watch("currency");
  const totalTravelers = Number(adults) + Number(children) + Number(infants);
  const cabinLabels: Record<string, string> = {
    ECONOMY: t("economy"),
    PREMIUM_ECONOMY: t("premiumEconomy"),
    BUSINESS: t("business"),
    FIRST: t("first"),
  };

  const isMultiCity = journeyType === "MULTI_CITY";
  const legsValid =
    legs.length >= MIN_LEGS &&
    legs.every((leg) => leg.origin.length === 3 && leg.destination.length === 3 && !!leg.departureDate);

  function handleSubmit(values: FlightSearchFormOutput) {
    onSearch({
      ...values,
      journeyType: values.journeyType,
      returnDate: values.journeyType === "ROUND_TRIP" ? values.returnDate : undefined,
    });
  }

  function handleMultiCitySubmit() {
    if (!legsValid) return;
    onMultiCitySearch({
      legs,
      adults: Number(adults),
      children: Number(children),
      infants: Number(infants),
      cabinClass,
      currency,
    });
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    if (isMultiCity) {
      event.preventDefault();
      handleMultiCitySubmit();
      return;
    }
    form.handleSubmit(handleSubmit)(event);
  }

  function swapLocations() {
    const origin = form.getValues("origin");
    const destination = form.getValues("destination");
    form.setValue("origin", destination, { shouldValidate: true });
    form.setValue("destination", origin, { shouldValidate: true });
  }

  function updateLeg(index: number, patch: Partial<FlightLeg>) {
    setLegs((prev) => prev.map((leg, i) => (i === index ? { ...leg, ...patch } : leg)));
  }

  function addLeg() {
    setLegs((prev) => {
      if (prev.length >= MAX_LEGS) return prev;
      const last = prev[prev.length - 1];
      return [...prev, blankLeg(last?.departureDate)];
    });
  }

  function removeLeg(index: number) {
    setLegs((prev) => (prev.length <= MIN_LEGS ? prev : prev.filter((_, i) => i !== index)));
  }

  return (
    <form onSubmit={handleFormSubmit} className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-border bg-muted/40 p-1">
          {(["ONE_WAY", "ROUND_TRIP", "MULTI_CITY"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setJourneyType(value);
                if (value !== "MULTI_CITY") {
                  form.setValue("journeyType", value);
                }
              }}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                journeyType === value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {value === "ONE_WAY" ? t("oneWay") : value === "ROUND_TRIP" ? t("roundTrip") : t("multiCity")}
            </button>
          ))}
        </div>

        <Select value={currency} onValueChange={(v) => form.setValue("currency", v)}>
          <SelectTrigger size="sm" className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="XAF">FCFA</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="USD">USD</SelectItem>

          </SelectContent>
        </Select>
      </div>

      {isMultiCity ? (
        <div className="grid gap-3">
          {legs.map((leg, index) => (
            <div
              key={index}
              className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:grid-cols-[1fr_1fr_auto_auto]"
            >
              <div className="sm:border-r sm:border-border">
                <LocationAutocomplete
                  icon={<Plane className="size-3.5 rotate-45" />}
                  label={t("legOrigin", { index: index + 1 })}
                  placeholder={t("originPlaceholder")}
                  searchPlaceholder={t("locationSearchPlaceholder")}
                  hintLabel={t("locationHint")}
                  noResultsLabel={t("locationNoResults")}
                  initialLabel={leg.origin}
                  fetchOptions={searchAirportSuggestions}
                  onSelect={(option) => updateLeg(index, { origin: option.code })}
                />
              </div>
              <div className="border-t border-border sm:border-t-0 sm:border-r">
                <LocationAutocomplete
                  icon={<Plane className="size-3.5 -rotate-45" />}
                  label={t("destination")}
                  placeholder={t("destinationPlaceholder")}
                  searchPlaceholder={t("locationSearchPlaceholder")}
                  hintLabel={t("locationHint")}
                  noResultsLabel={t("locationNoResults")}
                  initialLabel={leg.destination}
                  fetchOptions={searchAirportSuggestions}
                  onSelect={(option) => updateLeg(index, { destination: option.code })}
                />
              </div>
              <div className="border-t border-border sm:border-t-0 sm:border-r">
                <FieldShell icon={<CalendarDays className="size-3.5" />} label={t("departureDate")}>
                  <input
                    type="date"
                    min={index > 0 ? legs[index - 1]?.departureDate || today() : today()}
                    value={leg.departureDate}
                    onChange={(e) => updateLeg(index, { departureDate: e.target.value })}
                    className="w-full bg-transparent text-sm font-semibold outline-none [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </FieldShell>
              </div>
              <div className="flex items-center justify-center border-t border-border p-2 sm:border-t-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={legs.length <= MIN_LEGS}
                  onClick={() => removeLeg(index)}
                  aria-label={t("removeLeg")}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="outline" size="sm" onClick={addLeg} disabled={legs.length >= MAX_LEGS}>
              <Plus className="size-4" />
              {t("addLeg")}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="rounded-xl border border-border bg-card px-4 py-2 text-left shadow-sm transition-colors hover:bg-accent/40">
                  <FieldShell icon={<Users className="size-3.5" />} label={t("travelers")} className="p-0">
                    <span className="truncate text-sm font-semibold">
                      {t("travelersSummary", { count: totalTravelers })} · {cabinLabels[cabinClass]}
                    </span>
                  </FieldShell>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72">
                <TravelersPopoverContent
                  adults={Number(adults)}
                  childrenCount={Number(children)}
                  infants={Number(infants)}
                  cabinClass={cabinClass}
                  onAdultsChange={(v) => form.setValue("adults", v)}
                  onChildrenChange={(v) => form.setValue("children", v)}
                  onInfantsChange={(v) => form.setValue("infants", v)}
                  onCabinClassChange={(v) => form.setValue("cabinClass", v)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      ) : (
        <div className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto_auto]">
          <div className="relative sm:border-r sm:border-border">
            <LocationAutocomplete
              icon={<Plane className="size-3.5 rotate-45" />}
              label={t("origin")}
              placeholder={t("originPlaceholder")}
              searchPlaceholder={t("locationSearchPlaceholder")}
              hintLabel={t("locationHint")}
              noResultsLabel={t("locationNoResults")}
              initialLabel={defaultValues?.origin ?? ""}
              fetchOptions={searchAirportSuggestions}
              onSelect={(option) => form.setValue("origin", option.code, { shouldValidate: true })}
            />
            <button
              type="button"
              onClick={swapLocations}
              aria-label={t("swapLocations")}
              className="absolute top-1/2 -right-4 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:text-primary sm:flex"
            >
              <ArrowLeftRight className="size-3.5" />
            </button>
          </div>

          <div className="border-t border-border sm:border-t-0 sm:border-r">
            <LocationAutocomplete
              icon={<Plane className="size-3.5 -rotate-45" />}
              label={t("destination")}
              placeholder={t("destinationPlaceholder")}
              searchPlaceholder={t("locationSearchPlaceholder")}
              hintLabel={t("locationHint")}
              noResultsLabel={t("locationNoResults")}
              initialLabel={defaultValues?.destination ?? ""}
              fetchOptions={searchAirportSuggestions}
              onSelect={(option) => form.setValue("destination", option.code, { shouldValidate: true })}
            />
          </div>

          <div className="border-t border-border sm:col-span-1 sm:border-t sm:border-r lg:border-t-0">
            <FieldShell icon={<CalendarDays className="size-3.5" />} label={t("departureDate")}>
              <input
                type="date"
                min={today()}
                className="w-full bg-transparent text-sm font-semibold outline-none [color-scheme:light] dark:[color-scheme:dark]"
                {...form.register("departureDate")}
              />
            </FieldShell>
          </div>

          <div
            className={cn(
              "border-t border-border sm:border-t sm:border-r lg:border-t-0",
              journeyType !== "ROUND_TRIP" && "opacity-50"
            )}
          >
            <FieldShell icon={<CalendarDays className="size-3.5" />} label={t("returnDate")}>
              <input
                type="date"
                min={form.watch("departureDate") || today()}
                disabled={journeyType !== "ROUND_TRIP"}
                className="w-full bg-transparent text-sm font-semibold outline-none disabled:cursor-not-allowed [color-scheme:light] dark:[color-scheme:dark]"
                {...form.register("returnDate")}
              />
            </FieldShell>
          </div>

          <div className="border-t border-border lg:border-t-0">
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="w-full text-left transition-colors hover:bg-accent/40">
                  <FieldShell icon={<Users className="size-3.5" />} label={t("travelers")}>
                    <span className="truncate text-sm font-semibold">
                      {t("travelersSummary", { count: totalTravelers })} · {cabinLabels[cabinClass]}
                    </span>
                  </FieldShell>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72">
                <TravelersPopoverContent
                  adults={Number(adults)}
                  childrenCount={Number(children)}
                  infants={Number(infants)}
                  cabinClass={cabinClass}
                  onAdultsChange={(v) => form.setValue("adults", v)}
                  onChildrenChange={(v) => form.setValue("children", v)}
                  onInfantsChange={(v) => form.setValue("infants", v)}
                  onCabinClassChange={(v) => form.setValue("cabinClass", v)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSearching || (isMultiCity && !legsValid)}
        className="w-full justify-self-end bg-gradient-to-r from-primary to-primary/80 sm:w-auto"
      >
        <Search />
        {isSearching ? t("searching") : t("submit")}
      </Button>
    </form>
  );
}

interface TravelersPopoverContentProps {
  adults: number;
  childrenCount: number;
  infants: number;
  cabinClass: FlightSearchFormValues["cabinClass"];
  onAdultsChange: (v: number) => void;
  onChildrenChange: (v: number) => void;
  onInfantsChange: (v: number) => void;
  onCabinClassChange: (v: FlightSearchFormValues["cabinClass"]) => void;
}

function TravelersPopoverContent({
  adults,
  childrenCount,
  infants,
  cabinClass,
  onAdultsChange,
  onChildrenChange,
  onInfantsChange,
  onCabinClassChange,
}: TravelersPopoverContentProps) {
  const t = useTranslations("FlightSearch");

  return (
    <>
      <div className="grid divide-y divide-border">
        <CounterField label={t("adults")} value={adults} min={1} max={9} onChange={onAdultsChange} />
        <CounterField label={t("children")} value={childrenCount} min={0} max={9} onChange={onChildrenChange} />
        <CounterField label={t("infants")} value={infants} min={0} max={9} onChange={onInfantsChange} />
      </div>
      <Separator className="my-3" />
      <div className="grid gap-1.5">
        <span className="text-sm font-medium">{t("cabinClass")}</span>
        <Select value={cabinClass} onValueChange={(v) => onCabinClassChange(v as FlightSearchFormValues["cabinClass"])}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ECONOMY">{t("economy")}</SelectItem>
            <SelectItem value="PREMIUM_ECONOMY">{t("premiumEconomy")}</SelectItem>
            <SelectItem value="BUSINESS">{t("business")}</SelectItem>
            <SelectItem value="FIRST">{t("first")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
