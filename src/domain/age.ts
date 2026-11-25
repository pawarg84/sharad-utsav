import { FESTIVAL } from "./types";

export function ageOn(dob: string, onDate: string): number {
  const [by, bm, bd] = dob.split("-").map(Number);
  const [oy, om, od] = onDate.split("-").map(Number);
  let age = oy - by;
  if (om < bm || (om === bm && od < bd)) age -= 1;
  return age;
}

export type AgeBand = "toddler" | "child" | "adult";

export function bandForAge(age: number): AgeBand {
  if (age < 5) return "toddler";
  if (age < 12) return "child";
  return "adult";
}

export function bandOnFestival(dob: string): AgeBand {
  return bandForAge(ageOn(dob, FESTIVAL.dates[0]));
}

export function isBookerOldEnough(dob: string, bookingDate: string): boolean {
  return ageOn(dob, bookingDate) >= 18;
}
