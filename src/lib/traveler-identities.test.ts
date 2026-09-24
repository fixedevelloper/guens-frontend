import { describe, expect, it } from "vitest";

import { identitiesComplete, pricedPassengerTypes, resizeIdentities } from "./traveler-identities";
import type { FlightOfferDetail } from "@/lib/api/types";

const detailWith = (adults: number, children: number, infants: number) => ({
  fareBreakdown: {
    currency: "USD", adults, children, infants, total: 947.27,
    adultBaseFare: 218.12, adultTax: 101.61, childBaseFare: 190, childTax: 117.81, infantBaseFare: null, infantTax: null,
  },
}) as unknown as FlightOfferDetail;

describe("traveler identities", () => {
  it("orders the priced passengers like the airline numbers them: adults, children, infants", () => {
    expect(pricedPassengerTypes(detailWith(2, 1, 1))).toEqual(["ADULT", "ADULT", "CHILD", "INFANT"]);
  });

  it("leaves the count free when the fare isn't priced for a fixed passenger mix", () => {
    expect(pricedPassengerTypes(null)).toBeNull();
    expect(pricedPassengerTypes({ fareBreakdown: null } as unknown as FlightOfferDetail)).toBeNull();
  });

  it("keeps what was typed when resizing, new travelers taking the priced type", () => {
    const typed = [{ firstName: "Jean", lastName: "Mbarga", type: "ADULT" as const }];
    const resized = resizeIdentities(typed, 3, ["ADULT", "CHILD", "INFANT"]);

    expect(resized[0]).toEqual(typed[0]);
    expect(resized.map((identity) => identity.type)).toEqual(["ADULT", "CHILD", "INFANT"]);
    expect(identitiesComplete(resized)).toBe(false);
    expect(identitiesComplete(typed)).toBe(true);
  });
});
