import { stringHash } from "@/lib/hash";

// The backend never returns photos/descriptions/amenities (ProviderMockSupport only
// generates name/city/room type/rating/price), so the detail page derives presentable,
// deterministic placeholder content from the hotel's own name - same hotel always looks
// the same across visits, without pretending to show real photography or verified facilities.

export const AMENITY_KEYS = [
  "wifi",
  "pool",
  "parking",
  "breakfast",
  "ac",
  "gym",
  "restaurant",
  "spa",
  "shuttle",
  "pets",
] as const;

export type AmenityKey = (typeof AMENITY_KEYS)[number];

export function pickAmenities(seed: string): AmenityKey[] {
  const hash = Math.abs(stringHash(seed));
  const count = 6 + (hash % 3);
  const offset = hash % AMENITY_KEYS.length;
  const rotated = [...AMENITY_KEYS.slice(offset), ...AMENITY_KEYS.slice(0, offset)];
  return rotated.slice(0, count);
}

export function galleryHues(seed: string): number[] {
  const hash = Math.abs(stringHash(seed));
  const base = hash % 360;
  return [0, 1, 2, 3, 4].map((i) => (base + i * 37) % 360);
}
