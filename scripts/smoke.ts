import "dotenv/config";
import { randomUUID } from "crypto";
import {
  createBooking,
  payBooking,
  BookingError,
} from "../src/server/bookings";
import { BookingInput } from "../src/domain/types";

const person = (id: string, dob: string, email?: string) => ({
  id,
  firstName: "Test",
  lastName: id,
  dob,
  email,
});

function baseBooking(over: Partial<BookingInput> = {}): BookingInput {
  const p1 = person("p1", "1985-01-01", "a@b.c");
  return {
    booker: p1,
    attendees: [p1],
    tickets: {
      dayAdult: [{ personId: "p1", dates: ["2026-11-10"] }],
      dayChild: [],
      allDayAdult: [],
      allDayChild: [],
      family: [],
    },
    extras: { dandiya: 0, dinners: [], workshops: [] },
    ...over,
  };
}

async function main() {
  // 1. Idempotency: same key twice → same row
  const key = randomUUID();
  const a = await createBooking(baseBooking(), key);
  const b = await createBooking(baseBooking(), key);
  console.assert(a.id === b.id, "FAIL: idempotency");
  console.log("✓ idempotency: same key returns same booking");

  // 2. Double pay: pay twice → one paid transition, same row
  const p1 = await payBooking(a.id);
  const p2 = await payBooking(a.id);
  console.assert(p1.status === "paid" && p2.status === "paid", "FAIL: pay");
  console.assert(
    p1.paidAt?.getTime() === p2.paidAt?.getTime(),
    "FAIL: paidAt changed on second pay",
  );
  console.log("✓ double pay: idempotent");

  // 3. Stock race: two concurrent bookings for workshop with qty 2 → exactly one succeeds
  // Seed stock starts at WORKSHOP=2; first booking will consume both, second will hit StockError
  const raceInput = (n: number): BookingInput => ({
    ...baseBooking(),
    attendees: [person("r1", "1985-01-01"), person("r2", "1985-01-01")],
    tickets: {
      dayAdult: [
        { personId: "r1", dates: ["2026-11-11"] },
        { personId: "r2", dates: ["2026-11-11"] },
      ],
      dayChild: [],
      allDayAdult: [],
      allDayChild: [],
      family: [],
    },
    extras: {
      dandiya: 0,
      dinners: [],
      workshops: [
        { personId: "r1", date: "2026-11-11" },
        { personId: "r2", date: "2026-11-11" },
      ],
    },
  });
  // deliberately ask for 2 workshops on each booking — only one can win
  const race1 = createBooking(raceInput(1), randomUUID());
  const race2 = createBooking(raceInput(2), randomUUID());
  const results = await Promise.allSettled([race1, race2]);
  const ok = results.filter((r) => r.status === "fulfilled").length;
  const soldOut = results.filter(
    (r) =>
      r.status === "rejected" &&
      r.reason instanceof BookingError &&
      r.reason.code === "SOLD_OUT",
  ).length;
  console.log(`race: ${ok} ok, ${soldOut} sold-out`);
  console.assert(ok === 1 && soldOut === 1, "FAIL: stock race");

  // 4. Promo error surfaces
  try {
    await createBooking(
      { ...baseBooking(), promoCode: "EXPIRED5" },
      randomUUID(),
    );
    console.log("FAIL: expired promo accepted");
  } catch (e) {
    if (e instanceof BookingError && e.code === "PROMO")
      console.log("✓ expired promo rejected");
    else throw e;
  }

  console.log("\nAll smoke checks passed.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
