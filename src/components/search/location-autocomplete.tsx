"use client";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FieldShell } from "@/components/search/field-shell";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { LocationOption } from "@/lib/api/geo";

export type { LocationOption };

interface LocationAutocompleteProps {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  hintLabel: string;
  noResultsLabel: string;
  initialLabel?: string;
  minChars?: number;
  fetchOptions: (query: string) => Promise<LocationOption[]>;
  onSelect: (option: LocationOption) => void;
  className?: string;
}

export function LocationAutocomplete({
  icon,
  label,
  placeholder,
  searchPlaceholder,
  hintLabel,
  noResultsLabel,
  initialLabel = "",
  minChars = 2,
  fetchOptions,
  onSelect,
  className,
}: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [displayLabel, setDisplayLabel] = useState(initialLabel);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebouncedValue(query, 300).trim();

  const { data: options, isFetching } = useQuery({
    queryKey: ["location-autocomplete", label, debouncedQuery],
    queryFn: () => fetchOptions(debouncedQuery),
    enabled: open && debouncedQuery.length >= minChars,
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function handleSelect(option: LocationOption) {
    setDisplayLabel(option.title);
    onSelect(option);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button type="button" className={cn("w-full text-left transition-colors hover:bg-accent/40", className)}>
          <FieldShell icon={icon} label={label}>
            <span
              className={cn(
                "truncate text-sm font-semibold",
                !displayLabel && "font-normal text-muted-foreground"
              )}
            >
              {displayLabel || placeholder}
            </span>
          </FieldShell>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-0">
        <div className="border-b p-2">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-md px-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-1">
          {debouncedQuery.length < minChars ? (
            <p className="p-3 text-sm text-muted-foreground">{hintLabel}</p>
          ) : isFetching ? (
            <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
          ) : !options || options.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">{noResultsLabel}</p>
          ) : (
            options.map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => handleSelect(option)}
                className="flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="grid">
                  <span className="font-medium">{option.title}</span>
                  <span className="text-xs text-muted-foreground">{option.subtitle}</span>
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
