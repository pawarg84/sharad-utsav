import { db } from "./db";
import { BookingInput } from "@/domain/types";
import { validate, calculateQuote } from "@/domain/pricing";
import { demandFor, reserveStock, StockError } from "./stock";

export class BookingError extends Error {
  constructor(
    public code: string,
    msg: string,
  ) {
    super(msg);
  }
}

export async function createBooking(
  input: BookingInput,
  idempotencyKey: string,
) {
  const existing = await db.booking.findUnique({ where: { idempotencyKey } });
  if (existing) return existing;

  const errs = validate(input);
  if (errs.length)
    throw new BookingError("VALIDATION", errs.map((e) => e.message).join("; "));

  const quote = calculateQuote(input);
  if (quote.promoError) throw new BookingError("PROMO", quote.promoError);

  try {
    return await db.$transaction(async (tx) => {
      await reserveStock(tx, demandFor(input));
      return tx.booking.create({
        data: {
          idempotencyKey,
          status: "pending",
          bookerJson: input.booker as any,
          attendeesJson: input.attendees as any,
          linesJson: quote.lineItems as any,
          subtotalCents: quote.subtotalCents,
          discountCents: quote.discountCents,
          totalCents: quote.totalCents,
          promoCode: quote.promoCode,
        },
      });
    });
  } catch (e) {
    if (e instanceof StockError) throw new BookingError("SOLD_OUT", e.message);
    throw e;
  }
}

export async function payBooking(id: string) {
  const b = await db.booking.findUnique({ where: { id } });
  if (!b) throw new BookingError("NOT_FOUND", "Booking not found");
  if (b.status === "paid") return b;
  return db.booking.update({
    where: { id },
    data: { status: "paid", paidAt: new Date() },
  });
}
