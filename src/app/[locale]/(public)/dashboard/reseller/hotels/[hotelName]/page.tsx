import React, { Suspense } from "react";
import { HotelDetailPageContent } from "@/components/hotel-detail/hotel-detail-page-content";
import { HotelDetailSkeleton } from "@/components/hotel-detail/hotel-detail-skeleton";

type PageProps = {
  params: Promise<{ locale: string; hotelId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Calcul du nombre de nuits basé sur les dates checkIn / checkOut
 */
function calculateNights(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;
}

export default async function HotelDetailPage(props: PageProps) {
  // ⚠️ Conformité Next.js 15/16 : Await impératif des promises de paramètres
  const params = await props.params;
  const searchParams = await props.searchParams;

  // Extraction des paramètres de recherche pour enrichir l'en-tête de l'hôtel
  const offerId = typeof searchParams.offerId === "string" ? searchParams.offerId : null;
  const hotelName = typeof searchParams.name === "string" ? searchParams.name : "Hôtel";
  const address = typeof searchParams.address === "string" ? searchParams.address : undefined;
  const rating = typeof searchParams.rating === "string" ? parseFloat(searchParams.rating) : 4;
  
  const checkIn = typeof searchParams.checkIn === "string" ? searchParams.checkIn : undefined;
  const checkOut = typeof searchParams.checkOut === "string" ? searchParams.checkOut : undefined;
  const nights = calculateNights(checkIn, checkOut);

  return (
    <Suspense fallback={<HotelDetailSkeleton />}>
      <HotelDetailPageContent
        hotelId={params.hotelId}
        offerId={offerId}
        hotelName={hotelName}
        address={address}
        rating={rating}
        nights={nights}
        isReseller={true}
      />
    </Suspense>
  );
}