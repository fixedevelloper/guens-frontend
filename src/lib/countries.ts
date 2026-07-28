// src/lib/countries.ts
"use client";

import { useQuery } from "@tanstack/react-query";

export type Country = {
    countryName: string;
    currency: string;
    symbol: string;
};

export type CountriesMap = Record<string, Country>; // clé = ISO2

export function useCountriesQuery() {
    return useQuery<CountriesMap>({
        queryKey: ["countries"],
        queryFn: async () => {
            const res = await fetch("/data/countries.json");
            if (!res.ok) throw new Error("Impossible de charger la liste des pays");
            return res.json();
        },
        staleTime: Infinity, // fichier statique, jamais besoin de refetch
        gcTime: Infinity,
    });
}

export function countryEntries(countries: CountriesMap): Array<{ iso2: string } & Country> {
    return Object.entries(countries)
        .map(([iso2, country]) => ({ iso2, ...country }))
        .sort((a, b) => a.countryName.localeCompare(b.countryName));
}