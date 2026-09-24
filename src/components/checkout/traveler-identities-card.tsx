// components/checkout/traveler-identities-card.tsx
"use client";

import { useTranslations } from "next-intl";
import { Minus, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PassengerType } from "@/lib/api/types";
import { identitiesComplete, type TravelerIdentity } from "@/lib/traveler-identities";

/**
 * Étape 1 des vols : qui voyage, avant de demander les options. Certaines compagnies (Travel
 * Terminus, « seatAncillaryRequiresPassengers ») n'accordent bagages/repas/sièges qu'à des passagers
 * nommés, et numérotent les options par passager dans cet ordre (T1, T2...). Quand le tarif est
 * calculé pour les passagers de la recherche (`fixedMix`), leur nombre et leur type sont figés.
 */
export function TravelerIdentitiesCard({
  identities,
  onChange,
  fixedMix,
  maxTravelers,
  confirmed,
  onConfirm,
  onEdit,
}: {
  identities: TravelerIdentity[];
  onChange: (identities: TravelerIdentity[]) => void;
  fixedMix: boolean;
  maxTravelers: number;
  confirmed: boolean;
  onConfirm: () => void;
  onEdit: () => void;
}) {
  const t = useTranslations("AncillaryOptions");
  const tCheckout = useTranslations("Checkout");

  const update = (index: number, patch: Partial<TravelerIdentity>) =>
      onChange(identities.map((identity, i) => (i === index ? { ...identity, ...patch } : identity)));
  const resize = (count: number) => {
    const clamped = Math.max(1, Math.min(maxTravelers, count));
    onChange(Array.from({ length: clamped }, (_, i) => identities[i] ?? { firstName: "", lastName: "", type: "ADULT" }));
  };

  return (
      <Card className="border-border/60 shadow-2xs rounded-2xl">
        <CardContent className="p-3.5 sm:p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-sm font-bold flex items-center gap-1.5">
                <Users className="size-4 text-primary" />
                {t("identitiesTitle")}
              </span>
              <span className="text-xs text-muted-foreground block">
                {fixedMix ? t("fixedMixNote", { count: identities.length }) : t("identitiesHint")}
              </span>
            </div>
            {!fixedMix && !confirmed && (
                <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-zinc-900/80 p-1 rounded-xl">
                  <Button type="button" variant="ghost" size="icon" className="size-8 rounded-lg"
                          onClick={() => resize(identities.length - 1)} disabled={identities.length <= 1}
                          aria-label={t("identitiesTitle")}>
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-6 text-center text-sm font-bold">{identities.length}</span>
                  <Button type="button" variant="ghost" size="icon" className="size-8 rounded-lg"
                          onClick={() => resize(identities.length + 1)} disabled={identities.length >= maxTravelers}
                          aria-label={t("identitiesTitle")}>
                    <Plus className="size-4" />
                  </Button>
                </div>
            )}
          </div>

          {identities.map((identity, index) => (
              <div key={index} className="grid gap-2 grid-cols-1 sm:grid-cols-[1fr_1fr_140px] items-end">
                <Input
                    value={identity.firstName}
                    onChange={(e) => update(index, { firstName: e.target.value })}
                    placeholder={`${tCheckout("firstName")} - ${t("travelerN", { index: index + 1 })}`}
                    autoComplete="given-name"
                    disabled={confirmed}
                    className="h-10 rounded-xl text-sm"
                />
                <Input
                    value={identity.lastName}
                    onChange={(e) => update(index, { lastName: e.target.value })}
                    placeholder={tCheckout("lastName")}
                    autoComplete="family-name"
                    disabled={confirmed}
                    className="h-10 rounded-xl text-sm"
                />
                <Select value={identity.type} onValueChange={(v) => update(index, { type: v as PassengerType })}
                        disabled={confirmed || fixedMix}>
                  <SelectTrigger className="h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="ADULT">{tCheckout("adult")}</SelectItem>
                    <SelectItem value="CHILD">{tCheckout("child")}</SelectItem>
                    <SelectItem value="INFANT">{tCheckout("infant")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
          ))}

          <div className="flex justify-end">
            {confirmed ? (
                <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={onEdit}>
                  {t("editTravelers")}
                </Button>
            ) : (
                <Button type="button" size="sm" className="rounded-xl" onClick={onConfirm}
                        disabled={!identitiesComplete(identities)}>
                  {t("showOptions")}
                </Button>
            )}
          </div>
        </CardContent>
      </Card>
  );
}
