import { BookingInput, Person, Quote } from "@/domain/types";

export interface Slot {
  id: string;
  ticketType:
    | "DAY_ADULT"
    | "DAY_CHILD"
    | "ALLDAY_ADULT"
    | "ALLDAY_CHILD"
    | "FAMILY";
  dates: string[];
  person?: Person;
  familyId?: string; // <-- NEW: Links the 4 people in a family together
}

export interface State {
  step: "tickets" | "people" | "extras" | "review" | "pay" | "done";
  booker?: Person;
  slots: Slot[];
  extras: BookingInput["extras"];
  promoCode?: string;
  quote?: Quote;
  quoteError?: string;
  bookingId?: string;
  idempotencyKey: string;
  submitting: boolean;
  error?: string;
}

export type Action =
  | { type: "setBooker"; person: Person }
  | { type: "setTicketCount"; ticketType: Slot["ticketType"]; count: number }
  | { type: "setSlotDates"; slotId: string; dates: string[] }
  | { type: "setSlotPerson"; slotId: string; person: Person }
  | { type: "setExtras"; extras: Partial<BookingInput["extras"]> }
  | { type: "setPromo"; code?: string }
  | { type: "setQuote"; quote: Quote }
  | { type: "setError"; error?: string }
  | { type: "go"; step: State["step"] }
  | { type: "submitting"; v: boolean }
  | { type: "booked"; bookingId: string }
  | { type: "resetCheckout" };

export const initialState: State = {
  step: "tickets",
  slots: [],
  extras: { dandiya: 0, dinners: [], workshops: [] },
  idempotencyKey: crypto.randomUUID(),
  submitting: false,
};

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "setTicketCount": {
      const current = s.slots.filter((x) => x.ticketType === a.ticketType);
      const diff = a.count - current.length;
      let slots = [...s.slots];

      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          if (a.ticketType === "FAMILY") {
            // A Family Pass creates 4 slots (2 adults, 2 children)
            const familyId = crypto.randomUUID();
            slots.push(
              {
                id: crypto.randomUUID(),
                ticketType: "DAY_ADULT",
                dates: [],
                familyId,
              },
              {
                id: crypto.randomUUID(),
                ticketType: "DAY_ADULT",
                dates: [],
                familyId,
              },
              {
                id: crypto.randomUUID(),
                ticketType: "DAY_CHILD",
                dates: [],
                familyId,
              },
              {
                id: crypto.randomUUID(),
                ticketType: "DAY_CHILD",
                dates: [],
                familyId,
              },
            );
          } else {
            slots.push({
              id: crypto.randomUUID(),
              ticketType: a.ticketType,
              dates: [],
            });
          }
        }
      } else if (diff < 0) {
        // When removing a family pass, remove all slots with that familyId
        const drop = new Set(current.slice(a.count).map((x) => x.id));
        slots = slots.filter(
          (x) =>
            !drop.has(x.id) &&
            (!x.familyId ||
              !current.slice(a.count).some((c) => c.familyId === x.familyId)),
        );
      }
      return { ...s, slots };
    }
    case "setSlotDates":
      return {
        ...s,
        slots: s.slots.map((x) =>
          x.id === a.slotId ? { ...x, dates: a.dates } : x,
        ),
      };
    case "setSlotPerson":
      return {
        ...s,
        slots: s.slots.map((x) =>
          x.id === a.slotId ? { ...x, person: a.person } : x,
        ),
      };
    case "setBooker":
      return { ...s, booker: a.person };
    case "setExtras":
      return { ...s, extras: { ...s.extras, ...a.extras } };
    case "setPromo":
      return { ...s, promoCode: a.code };
    case "setQuote":
      return { ...s, quote: a.quote, quoteError: undefined, error: undefined };
    case "setError":
      return { ...s, error: a.error, quoteError: a.error };
    case "go":
      return { ...s, step: a.step };
    case "submitting":
      return { ...s, submitting: a.v };
    case "booked":
      return { ...s, bookingId: a.bookingId, step: "done" };
    case "resetCheckout":
      return { ...initialState, idempotencyKey: crypto.randomUUID() };
    default:
      return s;
  }
}

export function toInput(s: State): BookingInput | { error: string } {
  if (!s.booker) return { error: "Booker details missing" };
  const attendees = s.slots
    .map((sl) => sl.person)
    .filter((p): p is Person => !!p);
  if (attendees.length !== s.slots.length)
    return { error: "Every attendee needs details" };

  const t = {
    dayAdult: [] as any[],
    dayChild: [] as any[],
    allDayAdult: [] as any[],
    allDayChild: [] as any[],
    family: [] as any[],
  };

  // Group family slots by familyId
  const familyGroups = new Map<string, Slot[]>();

  for (const sl of s.slots) {
    if (!sl.person) continue;

    if (sl.familyId) {
      if (!familyGroups.has(sl.familyId)) familyGroups.set(sl.familyId, []);
      familyGroups.get(sl.familyId)!.push(sl);
    } else {
      if (sl.ticketType === "DAY_ADULT")
        t.dayAdult.push({ personId: sl.person.id, dates: sl.dates });
      if (sl.ticketType === "DAY_CHILD")
        t.dayChild.push({ personId: sl.person.id, dates: sl.dates });
      if (sl.ticketType === "ALLDAY_ADULT")
        t.allDayAdult.push({ personId: sl.person.id });
      if (sl.ticketType === "ALLDAY_CHILD")
        t.allDayChild.push({ personId: sl.person.id });
    }
  }

  // Process family groups
  for (const [_, group] of familyGroups) {
    const adults = group.filter((g) => g.ticketType === "DAY_ADULT");
    const children = group.filter((g) => g.ticketType === "DAY_CHILD");

    // Family pass requires 2 adults, 2 children, all on the same date.
    // We'll use the date selected for the first adult.
    const date = adults[0]?.dates[0] || "";

    if (adults.length === 2 && children.length === 2) {
      t.family.push({
        adultIds: [adults[0].person!.id, adults[1].person!.id],
        childIds: [children[0].person!.id, children[1].person!.id],
        date: date,
      });
    }
  }

  return {
    booker: s.booker,
    attendees,
    tickets: t,
    extras: s.extras,
    promoCode: s.promoCode,
  };
}
