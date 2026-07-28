"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";

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
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { searchCitySuggestions, type LocationOption } from "@/lib/api/geo";

interface CityAutocompleteInputProps {
    cityValue: string;
    countryValue: string;
    /** Fired when the partner picks a suggestion - sets both fields at once so they stay in sync
     *  with a real hotel_cities row (same city name + country used across hotel/property/search). */
    onSelectCity: (city: string, country: string) => void;
    disabled?: boolean;
    className?: string;
}

/** City/country combobox backed by the hotel_cities autocomplete (GET /api/geo/cities), so listings
 *  created by partners use the same city spelling as the reference data instead of free-text drift.
 *  Mirrors the CountrySelect combobox, except the option list is searched server-side (debounced)
 *  rather than preloaded, since hotel_cities isn't a small fixed set. */
export function CityAutocompleteInput({
    cityValue,
    countryValue,
    onSelectCity,
    disabled,
    className,
}: CityAutocompleteInputProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebouncedValue(query, 300).trim();

    const { data: suggestions, isFetching } = useQuery({
        queryKey: ["city-autocomplete", debouncedQuery],
        queryFn: () => searchCitySuggestions(debouncedQuery),
        enabled: debouncedQuery.length >= 2,
    });

    function handleSelect(option: LocationOption) {
        onSelectCity(option.title, option.subtitle);
        setOpen(false);
    }

    function handleOpenChange(next: boolean) {
        setOpen(next);
        if (!next) setQuery("");
    }

    const hasSelection = Boolean(cityValue);

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn("w-full justify-between rounded-xl font-semibold", className)}
                >
                    <span className="flex items-center gap-2 truncate">
                        <MapPin className="size-4 shrink-0 text-muted-foreground" />
                        {hasSelection ? `${cityValue} (${countryValue})` : "Sélectionner une ville *"}
                    </span>
                    <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        value={query}
                        onValueChange={setQuery}
                        placeholder="Rechercher une ville..."
                    />
                    <CommandList>
                        {debouncedQuery.length < 2 ? (
                            <p className="p-3 text-sm text-muted-foreground">
                                Tapez au moins 2 caractères.
                            </p>
                        ) : isFetching ? (
                            <p className="p-3 text-sm text-muted-foreground">Recherche...</p>
                        ) : (
                            <>
                                <CommandEmpty>Aucune ville trouvée.</CommandEmpty>
                                <CommandGroup>
                                    {(suggestions ?? []).map((option) => (
                                        <CommandItem
                                            key={`${option.title}-${option.subtitle}`}
                                            value={`${option.title}-${option.subtitle}`}
                                            onSelect={() => handleSelect(option)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 size-4",
                                                    cityValue === option.title && countryValue === option.subtitle
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {option.title}
                                            <span className="ml-auto text-xs text-muted-foreground font-semibold">
                                                {option.subtitle}
                                            </span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
