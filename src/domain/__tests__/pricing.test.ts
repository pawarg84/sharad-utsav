import { describe, it, expect } from "vitest";
import { calculateQuote } from "../pricing";
import { BookingInput } from "../types";

const base = (over: Partial<BookingInput> = {}): BookingInput => ({
  booker: {
    id: "b",
    firstName: "A",
    lastName: "B",
    dob: "1980-01-01",
    email: "a@b.c",
  },
  attendees: [],
  tickets: {
    dayAdult: [],
    dayChild: [],
    allDayAdult: [],
    allDayChild: [],
    family: [],
  },
  extras: { dandiya: 0, dinners: [], workshops: [] },
  ...over,
});

describe("pricing", () => {
  it("adult day pass per day", () => {
    const q = calculateQuote(
      base({
        tickets: {
          ...base().tickets,
          dayAdult: [
            {
              personId: "p1",
              dates: ["2026-11-10", "2026-11-11", "2026-11-12"],
            },
          ],
        },
      }),
    );
    expect(q.totalCents).toBe(4500);
  });
  it("SEVA10", () => {
    const q = calculateQuote(
      base({
        promoCode: "SEVA10",
        tickets: { ...base().tickets, allDayAdult: [{ personId: "p1" }] },
      }),
    );
    expect(q.totalCents).toBe(5400);
  });
  it("FLAT20 floors at 0", () => {
    const q = calculateQuote(
      base({
        promoCode: "FLAT20",
        extras: { ...base().extras, dandiya: 2 },
      }),
    );
    expect(q.totalCents).toBe(0);
  });
  it("KIDSFREE needs children", () => {
    const q = calculateQuote(base({ promoCode: "KIDSFREE" }));
    expect(q.promoError).toMatch(/child/i);
  });
});
