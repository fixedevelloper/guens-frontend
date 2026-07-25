import type { HotelSearchParams } from "@/lib/api/types";
import { hotelSearchParamsToQuery } from "@/lib/search-params";

export function hotelDetailUrl(hotelName: string, params: HotelSearchParams) {
  return `/hotels/${encodeURIComponent(hotelName)}?${hotelSearchParamsToQuery(params)}`;
}
