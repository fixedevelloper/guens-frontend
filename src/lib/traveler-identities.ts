import type { FlightOfferDetail, PassengerType } from "@/lib/api/types";

/** Who travels, as far as step 1 (options) needs to know: name as on the passport and type. */
export interface TravelerIdentity {
  firstName: string;
  lastName: string;
  type: PassengerType;
}

/**
 * The passenger types the fare was priced for, in the order the provider numbers them (adults,
 * then children, then infants - paxRef T1, T2...), when the provider prices the whole searched mix
 * (Travel Terminus - its fareBreakdown carries the counts). Null otherwise: the count is then free.
 */
export function pricedPassengerTypes(detail: FlightOfferDetail | null | undefined): PassengerType[] | null {
  const breakdown = detail?.fareBreakdown;
  if (!breakdown || breakdown.adults + breakdown.children + breakdown.infants === 0) {
    return null;
  }
  return [
    ...Array<PassengerType>(breakdown.adults).fill("ADULT"),
    ...Array<PassengerType>(breakdown.children).fill("CHILD"),
    ...Array<PassengerType>(breakdown.infants).fill("INFANT"),
  ];
}

/** `count` identities keeping what was already typed; new ones take `types[i]` (or ADULT). */
export function resizeIdentities(
  current: TravelerIdentity[],
  count: number,
  types?: PassengerType[] | null
): TravelerIdentity[] {
  return Array.from({ length: count }, (_, i) => current[i] ?? {
    firstName: "",
    lastName: "",
    type: types?.[i] ?? "ADULT",
  });
}

/** Every traveler has a first and last name - what the options quote is sent with. */
export function identitiesComplete(identities: TravelerIdentity[]): boolean {
  return identities.every((identity) => identity.firstName.trim() && identity.lastName.trim());
}
