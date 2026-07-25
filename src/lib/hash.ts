/** Deterministic string hash used to derive stable pseudo-random UI details (pin
 *  positions, placeholder gallery hues, amenity picks) from a seed like a hotel name,
 *  so the same hotel always looks the same across renders/navigations. */
export function stringHash(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
