import { BookingInput, LineItem, Quote } from "./types";
import { PRICES, LABELS, isFestivalDate, isWorkshopDate } from "./catalogue";
import { bandOnFestival, isBookerOldEnough } from "./age";
import { applyPromo } from "./promo";

export interface ValidationError {
  field: string;
  message: string;
}

export function validate(
  input: BookingInput,
  today = new Date().toISOString().slice(0, 10),
): ValidationError[] {
  const errs: ValidationError[] = [];
  if (!isBookerOldEnough(input.booker.dob, today))
    errs.push({ field: "booker.dob", message: "Booker must be 18+." });

  const byId = new Map(input.attendees.map((p) => [p.id, p]));

  // Map of personId -> Set of dates they have a ticket for
  const ticketedDates = new Map<string, Set<string>>();
  const addTicket = (personId: string, dates: string[]) => {
    if (!ticketedDates.has(personId)) ticketedDates.set(personId, new Set());
    dates.forEach((d) => ticketedDates.get(personId)!.add(d));
  };

  // Validate day adult
  for (const s of input.tickets.dayAdult) {
    const p = byId.get(s.personId);
    if (!p) {
      errs.push({ field: "tickets", message: "Unknown person." });
      continue;
    }
    if (bandOnFestival(p.dob) !== "adult")
      errs.push({
        field: "tickets.dayAdult",
        message: `${p.firstName} is not an adult.`,
      });
    if (s.dates.length === 0)
      errs.push({
        field: "tickets.dayAdult",
        message: "Pick at least one day.",
      });
    for (const d of s.dates)
      if (!isFestivalDate(d))
        errs.push({ field: "tickets.dayAdult", message: `Bad date ${d}.` });

    addTicket(s.personId, s.dates);
  }

  // Validate day child
  for (const s of input.tickets.dayChild) {
    const p = byId.get(s.personId);
    if (!p) {
      errs.push({ field: "tickets", message: "Unknown person." });
      continue;
    }
    if (bandOnFestival(p.dob) !== "child")
      errs.push({
        field: "tickets.dayChild",
        message: `${p.firstName} is not a child.`,
      });
    if (s.dates.length === 0)
      errs.push({
        field: "tickets.dayChild",
        message: "Pick at least one day.",
      });
    for (const d of s.dates)
      if (!isFestivalDate(d))
        errs.push({ field: "tickets.dayChild", message: `Bad date ${d}.` });

    addTicket(s.personId, s.dates);
  }

  // Validate all day adult
  for (const s of input.tickets.allDayAdult) {
    const p = byId.get(s.personId);
    if (!p) {
      errs.push({ field: "tickets", message: "Unknown person." });
      continue;
    }
    if (bandOnFestival(p.dob) !== "adult")
      errs.push({
        field: "tickets.allDayAdult",
        message: `${p.firstName} is not an adult.`,
      });

    addTicket(s.personId, [
      "2026-11-10",
      "2026-11-11",
      "2026-11-12",
      "2026-11-13",
      "2026-11-14",
    ]);
  }

  // Validate all day child
  for (const s of input.tickets.allDayChild) {
    const p = byId.get(s.personId);
    if (!p) {
      errs.push({ field: "tickets", message: "Unknown person." });
      continue;
    }
    if (bandOnFestival(p.dob) !== "child")
      errs.push({
        field: "tickets.allDayChild",
        message: `${p.firstName} is not a child.`,
      });

    addTicket(s.personId, [
      "2026-11-10",
      "2026-11-11",
      "2026-11-12",
      "2026-11-13",
      "2026-11-14",
    ]);
  }

  // Validate family
  for (const s of input.tickets.family) {
    for (const adultId of s.adultIds) {
      const p = byId.get(adultId);
      if (!p) continue;
      if (bandOnFestival(p.dob) !== "adult")
        errs.push({
          field: "tickets.family",
          message: `${p.firstName} is not an adult.`,
        });
      addTicket(adultId, [s.date]);
    }

    for (const childId of s.childIds) {
      const p = byId.get(childId);
      if (!p) continue;
      if (bandOnFestival(p.dob) !== "child")
        errs.push({
          field: "tickets.family",
          message: `${p.firstName} is not a child.`,
        });
      addTicket(childId, [s.date]);
    }
  }

  // Validate extras coupling (Dinner)
  for (const d of input.extras.dinners) {
    const datesForPerson = ticketedDates.get(d.personId);
    if (!datesForPerson || !datesForPerson.has(d.date)) {
      errs.push({
        field: "extras.dinners",
        message: `Dinner for ${byId.get(d.personId)?.firstName || "person"} needs a ticket on ${d.date}.`,
      });
    }
  }

  // Validate extras coupling (Workshop)
  for (const w of input.extras.workshops) {
    if (!isWorkshopDate(w.date)) {
      errs.push({
        field: "extras.workshops",
        message: "Workshop runs Nov 11 & 13 only.",
      });
    }
    const datesForPerson = ticketedDates.get(w.personId);
    if (!datesForPerson || !datesForPerson.has(w.date)) {
      errs.push({
        field: "extras.workshops",
        message: `Workshop for ${byId.get(w.personId)?.firstName || "person"} needs a ticket on ${w.date}.`,
      });
    }
  }

  if (input.extras.dandiya < 0)
    errs.push({
      field: "extras.dandiya",
      message: "Quantity cannot be negative.",
    });

  return errs;
}

export function calculateQuote(input: BookingInput): Quote {
  const lines: LineItem[] = [];
  const push = (
    sku: keyof typeof PRICES,
    qty: number,
    meta?: Record<string, unknown>,
  ) => {
    if (qty <= 0) return;
    const unit = PRICES[sku];
    lines.push({
      sku: sku as any,
      label: LABELS[sku],
      qty,
      unitCents: unit,
      totalCents: unit * qty,
      meta,
    });
  };

  for (const s of input.tickets.dayAdult)
    push("DAY_ADULT", s.dates.length, { personId: s.personId, dates: s.dates });
  for (const s of input.tickets.dayChild)
    push("DAY_CHILD", s.dates.length, { personId: s.personId, dates: s.dates });
  for (const s of input.tickets.allDayAdult)
    push("ALLDAY_ADULT", 1, { personId: s.personId });
  for (const s of input.tickets.allDayChild)
    push("ALLDAY_CHILD", 1, { personId: s.personId });
  for (const s of input.tickets.family) push("FAMILY", 1, s);
  push("DANDIYA", input.extras.dandiya);
  push("DINNER", input.extras.dinners.length, {
    selections: input.extras.dinners,
  });
  push("WORKSHOP", input.extras.workshops.length, {
    selections: input.extras.workshops,
  });

  const subtotal = lines.reduce((a, l) => a + l.totalCents, 0);
  const childCents = lines
    .filter((l) => l.sku === "DAY_CHILD" || l.sku === "ALLDAY_CHILD")
    .reduce((a, l) => a + l.totalCents, 0);

  const promo = applyPromo(input.promoCode, subtotal, childCents);
  const discount = promo.ok ? promo.discountCents : 0;
  const total = Math.max(0, subtotal - discount);

  return {
    lineItems: lines,
    subtotalCents: subtotal,
    discountCents: discount,
    totalCents: total,
    promoCode: promo.ok ? input.promoCode : undefined,
    promoError: promo.ok ? undefined : promo.reason,
  };
}
