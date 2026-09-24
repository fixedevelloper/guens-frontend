import { describe, expect, it } from "vitest";
import { z } from "zod";

import { checkPassportDocument, checkPassportValidity, createPassportExpirySchema } from "./passport-validity";

describe("checkPassportValidity", () => {
  it("is valid when the passport clears the 6-month margin comfortably", () => {
    const result = checkPassportValidity("2027-06-01", "2026-09-22");
    expect(result.valid).toBe(true);
    expect(result.status).toBe("valid");
  });

  it("is valid exactly on the boundary - expiry precisely 6 months after the flight date", () => {
    const result = checkPassportValidity("2027-03-22", "2026-09-22", 6);
    expect(result.valid).toBe(true);
    expect(result.status).toBe("valid");
    expect(result.monthsRemaining).toBe(6);
  });

  it("is expiring-soon when one day short of the required margin", () => {
    const result = checkPassportValidity("2027-03-21", "2026-09-22", 6);
    expect(result.valid).toBe(false);
    expect(result.status).toBe("expiring-soon");
    expect(result.monthsRemaining).toBe(5);
  });

  it("is expiring-soon (not expired) when the passport expires on the flight date itself", () => {
    // Still technically valid *on* the day of travel - the problem is the missing 6-month
    // margin, not an already-expired document.
    const result = checkPassportValidity("2026-09-22", "2026-09-22");
    expect(result.status).toBe("expiring-soon");
    expect(result.monthsRemaining).toBe(0);
  });

  it("is expired when the passport expiry date is before the flight date", () => {
    const result = checkPassportValidity("2026-01-01", "2026-09-22");
    expect(result.valid).toBe(false);
    expect(result.status).toBe("expired");
    expect(result.monthsRemaining).toBeLessThan(0);
  });

  it("honors a custom minValidityMonths (e.g. a country requiring only 3 months)", () => {
    const result = checkPassportValidity("2027-01-01", "2026-09-22", 3);
    expect(result.valid).toBe(true);
  });

  it("computes requiredExpiryDate as flightDate + minValidityMonths", () => {
    const result = checkPassportValidity("2027-06-01", "2026-09-22", 6);
    expect(result.requiredExpiryDate.toISOString().slice(0, 10)).toBe("2027-03-22");
  });

  it("accepts Date objects as well as YYYY-MM-DD strings", () => {
    const result = checkPassportValidity(
      new Date(Date.UTC(2027, 5, 1)),
      new Date(Date.UTC(2026, 8, 22))
    );
    expect(result.valid).toBe(true);
  });

  it("documents JS's own month-overflow rollover for a day that doesn't exist 6 months later", () => {
    // Aug 31 + 6 months has no Feb 31st - JS Date normalizes by rolling into March instead of
    // clamping to Feb's last day. Not "correct" so much as JS's own well-known behavior; this
    // test exists so a future reader isn't surprised by it rather than to assert it's ideal.
    const result = checkPassportValidity("2027-03-01", "2026-08-31", 6);
    expect(result.requiredExpiryDate.toISOString().slice(0, 10)).toBe("2027-03-03");
  });
});

describe("createPassportExpirySchema", () => {
  it("accepts a date that clears the required margin", () => {
    const schema = createPassportExpirySchema("2026-09-22");
    expect(schema.safeParse("2027-06-01").success).toBe(true);
  });

  it("rejects a date that doesn't clear the required margin, with a specific message", () => {
    const schema = createPassportExpirySchema("2026-09-22");
    const result = schema.safeParse("2027-01-01");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("6 mois");
    }
  });

  it("rejects an already-expired date with the expired-specific message", () => {
    const schema = createPassportExpirySchema("2026-09-22");
    const result = schema.safeParse("2026-01-01");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("expiré");
    }
  });

  it("rejects a malformed date string before even reaching the validity check", () => {
    const schema = createPassportExpirySchema("2026-09-22");
    expect(schema.safeParse("22/09/2027").success).toBe(false);
    expect(schema.safeParse("").success).toBe(false);
  });

  it("respects a custom minValidityMonths", () => {
    const schema = createPassportExpirySchema("2026-09-22", 3);
    expect(schema.safeParse("2026-12-22").success).toBe(true);
    expect(schema.safeParse("2026-11-01").success).toBe(false);
  });
});

describe("checkPassportDocument", () => {
  const schema = z
    .object({
      passportNumber: z.string().optional(),
      passportIssueCountry: z.string().optional(),
      passportIssueDate: z.string().optional(),
      passportExpiryDate: z.string().optional(),
      dateOfBirth: z.string().optional(),
    })
    .superRefine(checkPassportDocument);
  const complete = {
    passportNumber: "AB1234567",
    passportIssueCountry: "CM",
    passportIssueDate: "2020-03-01",
    passportExpiryDate: "2030-03-01",
    dateOfBirth: "1990-06-15",
  };
  const issuesOn = (values: Record<string, string | undefined>) => {
    const result = schema.safeParse(values);
    return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
  };

  it("accepts a complete passport, and a traveler without one", () => {
    expect(issuesOn(complete)).toEqual([]);
    expect(issuesOn({ dateOfBirth: "1990-06-15" })).toEqual([]);
  });

  it("requires the whole document once a number is entered", () => {
    expect(issuesOn({ passportNumber: "AB1234567", dateOfBirth: "1990-06-15" })).toEqual([
      "passportIssueCountry",
      "passportExpiryDate",
      "passportIssueDate",
    ]);
  });

  it("rejects a number with punctuation or too long", () => {
    expect(issuesOn({ ...complete, passportNumber: "AB-123 456" })).toEqual(["passportNumber"]);
    expect(issuesOn({ ...complete, passportNumber: "A".repeat(21) })).toEqual(["passportNumber"]);
  });

  it("rejects an issue date before birth or in the future", () => {
    expect(issuesOn({ ...complete, passportIssueDate: "1989-01-01" })).toEqual(["passportIssueDate"]);
    expect(issuesOn({ ...complete, passportIssueDate: "2999-01-01" })).toEqual(["passportIssueDate"]);
  });
});
