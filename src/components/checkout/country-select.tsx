// src/components/checkout/country-select.tsx
"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { countryEntries, useCountriesQuery, type CountriesMap } from "@/lib/countries";

type CountrySelectProps = {
    value: string | undefined; // ISO2
    onChange: (iso2: string, currency: string) => void;
    disabled?: boolean;
};

export function CountrySelect({ value, onChange, disabled }: CountrySelectProps) {
    const [open, setOpen] = useState(false);
    const countriesQuery = useCountriesQuery();

    const entries = useMemo(
        () => countryEntries(countriesQuery.data ?? ({} as CountriesMap)),
        [countriesQuery.data]
    );

    const selected = value ? entries.find((c) => c.iso2 === value) : undefined;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled || countriesQuery.isLoading}
                    className="w-full justify-between rounded-xl font-semibold"
                >
          <span className="flex items-center gap-2 truncate">
            <Globe className="size-4 shrink-0 text-muted-foreground" />
              {selected ? `${selected.countryName} (${selected.currency})` : "Sélectionner un pays"}
          </span>
                    <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Rechercher un pays..." />
                    <CommandList>
                        <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
                        <CommandGroup>
                            {entries.map((country) => (
                                <CommandItem
                                    key={country.iso2}
                                    value={country.countryName}
                                    onSelect={() => {
                                        onChange(country.iso2, country.currency);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 size-4",
                                            value === country.iso2 ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {country.countryName}
                                    <span className="ml-auto text-xs text-muted-foreground font-semibold">
                    {country.currency}
                  </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}