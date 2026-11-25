import { describe, it, expect } from "vitest";
import { ageOn, bandOnFestival, isBookerOldEnough } from "../age";

describe("age", () => {
  it("computes age at boundary", () => {
    expect(ageOn("2014-11-10", "2026-11-10")).toBe(12);
    expect(ageOn("2014-11-11", "2026-11-10")).toBe(11);
  });
  it("bands on festival start", () => {
    expect(bandOnFestival("2014-11-10")).toBe("adult");
    expect(bandOnFestival("2014-11-11")).toBe("child");
    expect(bandOnFestival("2021-11-09")).toBe("child");
    expect(bandOnFestival("2021-11-11")).toBe("toddler"); // 4 on festival start
    expect(bandOnFestival("2021-11-10")).toBe("child"); // exactly 5 — child band
  });
  it("booker 18+", () => {
    expect(isBookerOldEnough("2008-11-10", "2026-11-10")).toBe(true);
    expect(isBookerOldEnough("2008-11-11", "2026-11-10")).toBe(false);
  });
});
