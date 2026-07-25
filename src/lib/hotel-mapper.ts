import { HotelDetail } from "./api/types";


export function sanitizeHotelDetail(data: HotelDetail): HotelDetail {
  return {
    ...data,
    // 1. Déduplication des images
    hotelImages: Array.from(
      new Map((data.hotelImages || []).map((img) => [img.url, img])).values()
    ),
    // 2. Nettoyage des équipements vides
    facilities: (data.facilities || []).filter(
      (f) => Boolean(f) && f.trim().length > 0
    ),
  };
}