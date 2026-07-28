"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { searchCitySuggestions } from "@/lib/api/geo";

interface PickupLocationsInputProps {
    value: string[];
    onChange: (locations: string[]) => void;
}

/** Multi-city picker for Vehicle.pickupLocations (a plain list of city names, no paired country
 *  unlike hotel_cities elsewhere) - backed by the same GET /api/geo/cities search as hotel/property
 *  so pickup cities match the reference data instead of free-text drift. */
export function PickupLocationsInput({ value, onChange }: PickupLocationsInputProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebouncedValue(query, 300).trim();

    const { data: suggestions, isFetching } = useQuery({
        queryKey: ["city-autocomplete", debouncedQuery],
        queryFn: () => searchCitySuggestions(debouncedQuery),
        enabled: debouncedQuery.length >= 2,
    });

    function addLocation(city: string) {
        if (!value.includes(city)) {
            onChange([...value, city]);
        }
        setOpen(false);
        setQuery("");
    }

    function removeLocation(city: string) {
        onChange(value.filter((location) => location !== city));
    }

    return (
        <div className="space-y-2">
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((city) => (
                        <Badge key={city} variant="secondary" className="gap-1.5 rounded-lg py-1.5 pl-3 pr-2">
                            {city}
                            <button
                                type="button"
                                onClick={() => removeLocation(city)}
                                className="rounded-full hover:bg-muted-foreground/20"
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs">
                        <Plus className="size-3.5" />
                        Ajouter une ville de prise en charge
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[300px] p-0">
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
                                                onSelect={() => addLocation(option.title)}
                                            >
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
        </div>
    );
}
