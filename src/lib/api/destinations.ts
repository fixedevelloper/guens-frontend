import { apiClient } from "./client";
import type { FeaturedDestination } from "./types";

/** Powers the homepage's "popular destinations" section. */
export async function getFeaturedDestinations() {
  const { data } = await apiClient.get<FeaturedDestination[]>("/api/destinations/featured");
  return data;
}
