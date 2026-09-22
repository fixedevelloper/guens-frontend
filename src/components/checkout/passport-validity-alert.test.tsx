import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PassportValidityAlert } from "./passport-validity-alert";

describe("PassportValidityAlert", () => {
  it("renders nothing when no passport expiry date is provided", () => {
    const { container } = render(<PassportValidityAlert flightDate="2026-09-22" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a success alert when the passport clears the required margin", () => {
    render(<PassportValidityAlert passportExpiryDate="2027-06-01" flightDate="2026-09-22" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Passeport valide");
    expect(alert).toHaveTextContent("6 mois");
  });

  it("renders a destructive alert when the passport is already expired at flight date", () => {
    render(<PassportValidityAlert passportExpiryDate="2026-01-01" flightDate="2026-09-22" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Passeport expiré");
  });

  it("renders a warning alert when validity is insufficient, including the required date and months remaining", () => {
    render(<PassportValidityAlert passportExpiryDate="2027-01-01" flightDate="2026-09-22" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Validité insuffisante");
    expect(alert).toHaveTextContent("2027-03-22");
    expect(alert).toHaveTextContent("3 mois");
  });

  it("respects a custom minValidityMonths", () => {
    render(
      <PassportValidityAlert
        passportExpiryDate="2026-12-22"
        flightDate="2026-09-22"
        minValidityMonths={3}
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Passeport valide");
  });
});
