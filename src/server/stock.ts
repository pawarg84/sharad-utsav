import { Prisma } from "@/generated/prisma/client";
import { BookingInput, Sku } from "@/domain/types";

export function demandFor(input: BookingInput): Map<Sku, number> {
  const m = new Map<Sku, number>();
  const add = (k: Sku, n: number) => {
    if (n > 0) m.set(k, (m.get(k) ?? 0) + n);
  };
  for (const s of input.tickets.dayAdult) add("DAY_ADULT", s.dates.length);
  for (const s of input.tickets.dayChild) add("DAY_CHILD", s.dates.length);
  for (const s of input.tickets.allDayAdult) add("ALLDAY_ADULT", 1);
  for (const s of input.tickets.allDayChild) add("ALLDAY_CHILD", 1);
  for (const s of input.tickets.family) add("FAMILY", 1);
  add("DANDIYA", input.extras.dandiya);
  add("DINNER", input.extras.dinners.length);
  add("WORKSHOP", input.extras.workshops.length);
  return m;
}

export class StockError extends Error {}

export async function reserveStock(
  tx: Prisma.TransactionClient,
  demand: Map<Sku, number>,
) {
  for (const [sku, qty] of demand) {
    const res = await tx.stock.updateMany({
      where: { sku, remaining: { gte: qty } },
      data: { remaining: { decrement: qty } },
    });
    if (res.count === 0) throw new StockError(`${sku} sold out`);
  }
}
