// components/hotel-detail/hotel-room-list.tsx
"use client";

import { useLocale, useTranslations } from "next-intl";
import { BedDouble, ChevronRight, Check, Users, ShieldAlert } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { RoomOffer } from "@/lib/api/types";

interface HotelRoomListProps {
  roomOffers?: RoomOffer[];
  nights?: number;
}

export function HotelRoomList({ roomOffers = [], nights = 1 }: HotelRoomListProps) {
  const t = useTranslations("HotelDetail");

  if (!roomOffers || roomOffers.length === 0) {
    return (
      <Card className="rounded-2xl border border-dashed border-border/80 bg-muted/30 p-8 text-center">
        <p className="text-sm font-semibold text-muted-foreground">
          {t("noRoomsAvailable") ?? "Aucune offre de chambre disponible pour ces dates."}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
        <BedDouble className="size-5 text-primary/80" />
        {t("roomsTitle") ?? "Offres et chambres disponibles"}
      </h2>

      <div className="grid gap-4.5">
        {roomOffers.map((room) => (
          <RoomCard key={room.productId || room.roomCode} room={room} nights={nights} />
        ))}
      </div>
    </div>
  );
}

function RoomCard({ room, nights }: { room: RoomOffer; nights: number }) {
  const t = useTranslations("HotelDetail");
  const locale = useLocale();
  const router = useRouter();

  function handleChoose() {
    router.push(`/checkout/hotel?productId=${encodeURIComponent(room.productId)}`);
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xs transition-all hover:border-border">
      {/* EN-TÊTE DE LA CHAMBRE */}
      <div className="bg-slate-50/50 dark:bg-zinc-900/40 px-5 py-3.5 border-b border-border/40 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-extrabold tracking-tight text-foreground capitalize">
          {room.roomType?.toLowerCase() || "Chambre Standard"}
        </h3>
        
        {room.maxOccupancyPerRoom > 0 && (
          <Badge variant="outline" className="rounded-lg gap-1 text-xs font-medium text-muted-foreground">
            <Users className="size-3.5" />
            <span>Max {room.maxOccupancyPerRoom} pers.</span>
          </Badge>
        )}
      </div>

      <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* INFOS & ÉQUIPEMENTS DE LA CHAMBRE */}
        <div className="space-y-3 flex-1">
          {room.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {room.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {room.boardType && (
              <Badge variant="secondary" className="rounded-md text-[11px] font-bold">
                {room.boardType}
              </Badge>
            )}
            
            {room.cancellationPolicy && (
              <Badge variant="outline" className="rounded-md text-[11px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20 gap-1">
                <ShieldAlert className="size-3" />
                {room.cancellationPolicy}
              </Badge>
            )}
          </div>

          {room.facilities && room.facilities.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
              {room.facilities.slice(0, 4).map((facility:any, idx:number) => (
                <span key={idx} className="inline-flex items-center gap-1 text-xs text-muted-foreground/80 font-medium">
                  <Check className="size-3 text-emerald-500 shrink-0" />
                  {facility}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* PRIX ET BOUTON D'ACTION */}
        <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-border/40 shrink-0">
          <div className="text-left md:text-right space-y-0.5">
            <div className="text-xl font-black text-foreground tracking-tight">
              {formatMoney({ amount: room.netPrice, currency: room.currency }, locale)}
            </div>
            <div className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">
              {nights} night{nights > 1 ? "s" : ""} · Total séjour
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleChoose}
            className="rounded-xl font-bold text-xs gap-1 py-4.5 px-5 group active:scale-97"
          >
            {t("selectOffer") ?? "Sélectionner"}
            <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}