import { FESTIVAL, Sku } from "./types";

export const PRICES: Record<Sku, number> = {
  DAY_ADULT: 1500,
  DAY_CHILD: 800,
  ALLDAY_ADULT: 6000,
  ALLDAY_CHILD: 3000,
  FAMILY: 4000,
  DANDIYA: 500,
  DINNER: 1200,
  WORKSHOP: 2000,
};

export const LABELS: Record<Sku, string> = {
  DAY_ADULT: "Day Pass – Adult",
  DAY_CHILD: "Day Pass – Child",
  ALLDAY_ADULT: "All-Day Pass – Adult",
  ALLDAY_CHILD: "All-Day Pass – Child",
  FAMILY: "Family Pass",
  DANDIYA: "Dandiya Sticks (pair)",
  DINNER: "Dinner Plate",
  WORKSHOP: "Garba Workshop",
};

export function isFestivalDate(d: string) {
  return FESTIVAL.dates.includes(d);
}
export function isWorkshopDate(d: string) {
  return FESTIVAL.workshopDates.includes(d);
}
