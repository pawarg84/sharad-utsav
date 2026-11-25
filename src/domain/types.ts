export const FESTIVAL = {
  name: "Sharad Utsav 2026",
  location: "Radha Krishna Temple, Allen, Texas",
  dates: ["2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14"],
  workshopDates: ["2026-11-11", "2026-11-13"],
  currency: "USD" as const,
};

export type TicketType =
  | "DAY_ADULT"
  | "DAY_CHILD"
  | "ALLDAY_ADULT"
  | "ALLDAY_CHILD"
  | "FAMILY";
export type ExtraSku = "DANDIYA" | "DINNER" | "WORKSHOP";
export type Sku = TicketType | ExtraSku;

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  dob: string; // ISO YYYY-MM-DD
  email?: string;
  phone?: string;
}

export interface BookingInput {
  booker: Person;
  attendees: Person[];
  tickets: {
    dayAdult: { personId: string; dates: string[] }[];
    dayChild: { personId: string; dates: string[] }[];
    allDayAdult: { personId: string }[];
    allDayChild: { personId: string }[];
    family: {
      adultIds: [string, string];
      childIds: [string, string];
      date: string;
    }[];
  };
  extras: {
    dandiya: number;
    dinners: { personId: string; date: string }[];
    workshops: { personId: string; date: string }[];
  };
  promoCode?: string;
}

export interface LineItem {
  sku: Sku;
  label: string;
  qty: number;
  unitCents: number;
  totalCents: number;
  meta?: Record<string, unknown>;
}

export interface Quote {
  lineItems: LineItem[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  promoCode?: string;
  promoError?: string;
}
