"use client";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Search, Sparkles } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FieldShell } from "@/components/search/field-shell";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { LocationOption } from "@/lib/api/geo";

export type { LocationOption };

interface PickLocationAutocompleteProps {
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

export function PickLocationAutocomplete({
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
                                         }: PickLocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [displayLabel, setDisplayLabel] = useState(initialLabel);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebouncedValue(query, 300).trim();

  const { data: options, isFetching } = useQuery({
    queryKey: ["pick-location-autocomplete", label, debouncedQuery],
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
          <button
              type="button"
              className={cn(
                  "group w-full rounded-2xl border border-border/60 bg-background px-1 py-1 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20",
                  className
              )}
          >
            <FieldShell icon={icon} label={label}>
            <span
                className={cn(
                    "truncate text-sm font-semibold tracking-tight transition-colors",
                    !displayLabel
                        ? "font-normal text-muted-foreground"
                        : "text-foreground"
                )}
            >
              {displayLabel || placeholder}
            </span>
            </FieldShell>
          </button>
        </PopoverTrigger>

        <PopoverContent
            align="start"
            className="w-[360px] overflow-hidden rounded-3xl border border-border/60 p-0 shadow-2xl"
        >
          <div className="border-b border-border/60 bg-gradient-to-r from-primary/5 via-background to-background p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-12 w-full rounded-2xl border border-border/70 bg-background pl-10 pr-4 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              <span>{hintLabel}</span>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {debouncedQuery.length < minChars ? (
                <p className="px-3 py-4 text-sm text-muted-foreground">{hintLabel}</p>
            ) : isFetching ? (
                <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Recherche en cours...</span>
                </div>
            ) : !options || options.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted-foreground">{noResultsLabel}</p>
            ) : (
                <div className="space-y-1">
                  {options.map((option) => (
                      <button
                          key={option.code}
                          type="button"
                          onClick={() => handleSelect(option)}
                          className="group flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-all hover:bg-primary/5 hover:shadow-sm"
                      >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <MapPin className="size-4" />
                  </span>

                        <span className="grid min-w-0">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {option.title}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {option.subtitle}
                    </span>
                  </span>
                      </button>
                  ))}
                </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
  );
}