import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import { FlightOfferCard } from "./flight-results";
import type { HarmonizedFlightOffer } from "@/lib/api/types";
import frMessages from "../../../messages/fr.json";

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function renderCard(offer: HarmonizedFlightOffer) {
  return render(
      <NextIntlClientProvider locale="fr" messages={frMessages}>
        <FlightOfferCard offer={offer} locale="fr" isReseller={false} />
      </NextIntlClientProvider>
  );
}

const baseOffer: HarmonizedFlightOffer = {
  airline: "HF",
  airlineName: "Air Côte d'Ivoire",
  flightNumber: "HF713",
  origin: "BKO",
  destination: "DLA",
  departureTime: "2026-09-22T10:40:00",
  arrivalTime: "2026-09-22T20:25:00",
  cabinClass: "ECONOMY",
  seatsAvailable: 9,
  bestOfferId: "offer-1",
  quotes: [
    {
      offerId: "offer-1",
      providerType: "TRAVELTERMINUS",
      price: { amount: 379068.34, currency: "XAF" },
      detail: {
        holdAvailable: true,
        totalDuration: "9h 45m",
        totalLayoverDuration: "2h 50m",
        segments: [
          {
            airlineCode: "HF",
            airlineName: "Air Côte d'Ivoire",
            flightNumber: "713",
            cabinClass: "Economy",
            departure: { code: "BKO", name: null, city: "Bamako", terminal: null },
            arrival: { code: "ABJ", name: null, city: "Abidjan", terminal: null },
            departureTime: "2026-09-22T10:40:00",
            arrivalTime: "2026-09-22T12:20:00",
            duration: "1h 40m",
            layoverAfter: null,
            cabinBaggage: [],
            checkedBaggage: [],
          },
        ],
        // No return leg - a one-way offer.
        returnDepartureTime: null,
        returnArrivalTime: null,
        returnTotalDuration: null,
        returnTotalLayoverDuration: null,
        returnSegments: [],
      },
    },
  ],
};

describe("FlightOfferCard - return leg display", () => {
  it("does not show a return summary or a return itinerary for a one-way offer", () => {
    renderCard(baseOffer);
    expect(screen.queryByText(/Retour/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Détails"));
    expect(screen.queryByText("Vol aller")).not.toBeInTheDocument();
    expect(screen.queryByText("Vol retour")).not.toBeInTheDocument();
  });

  it("shows the return leg's summary and full itinerary for a round-trip offer", () => {
    const roundTripOffer: HarmonizedFlightOffer = {
      ...baseOffer,
      quotes: [
        {
          ...baseOffer.quotes[0],
          detail: {
            ...baseOffer.quotes[0].detail!,
            returnDepartureTime: "2026-10-02T09:00:00",
            returnArrivalTime: "2026-10-02T18:30:00",
            returnTotalDuration: "10h 30m",
            returnTotalLayoverDuration: "4h 45m",
            returnSegments: [
              {
                airlineCode: "HF",
                airlineName: "Air Côte d'Ivoire",
                flightNumber: "803",
                cabinClass: "Economy",
                departure: { code: "DLA", name: null, city: "Douala", terminal: null },
                arrival: { code: "ABJ", name: null, city: "Abidjan", terminal: null },
                departureTime: "2026-10-02T09:00:00",
                arrivalTime: "2026-10-02T12:05:00",
                duration: "3h 5m",
                layoverAfter: "4h 45m",
                cabinBaggage: [],
                checkedBaggage: [],
              },
              {
                airlineCode: "HF",
                airlineName: "Air Côte d'Ivoire",
                flightNumber: "710",
                cabinClass: "Economy",
                departure: { code: "ABJ", name: null, city: "Abidjan", terminal: null },
                arrival: { code: "BKO", name: null, city: "Bamako", terminal: null },
                departureTime: "2026-10-02T16:50:00",
                arrivalTime: "2026-10-02T18:30:00",
                duration: "1h 40m",
                layoverAfter: null,
                cabinBaggage: [],
                checkedBaggage: [],
              },
            ],
          },
        },
      ],
    };

    renderCard(roundTripOffer);

    // The compact summary is visible without expanding "Détails".
    expect(screen.getByText(/Retour/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Détails"));

    expect(screen.getByText("Vol aller")).toBeInTheDocument();
    expect(screen.getByText("Vol retour")).toBeInTheDocument();
    // Return leg's own segments (DLA->ABJ->BKO) show up, distinct from the outbound's (BKO->ABJ).
    expect(screen.getAllByText("ABJ").length).toBeGreaterThan(0);
    expect(screen.getByText(/803/)).toBeInTheDocument();
    expect(screen.getByText(/710/)).toBeInTheDocument();
  });
});
