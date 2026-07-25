import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { stringHash } from "@/lib/hash";

export function HotelLocationCard({ hotelName, cityCode }: { hotelName: string; cityCode: string }) {
  const t = useTranslations("HotelDetail");
  const hash = Math.abs(stringHash(hotelName));
  const top = 20 + (hash % 60);
  const left = 15 + ((hash >> 4) % 70);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">{t("locationTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div
          className={cn(
            "relative h-56 overflow-hidden rounded-lg border",
            "bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)]",
            "bg-[size:28px_28px] bg-accent/40"
          )}
        >
          <span
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ top: `${top}%`, left: `${left}%` }}
          >
            <span className="flex items-center gap-1 rounded-full border border-primary bg-primary px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-primary-foreground shadow-sm">
              <MapPin className="size-3.5" />
              {hotelName}
            </span>
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{cityCode}</p>
      </CardContent>
    </Card>
  );
}
