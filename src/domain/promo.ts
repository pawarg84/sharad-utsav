type PromoOutcome =
  | { ok: true; discountCents: number; label: string }
  | { ok: false; reason: string };

export function applyPromo(
  code: string | undefined,
  subtotalCents: number,
  childTicketCents: number,
): PromoOutcome {
  if (!code) return { ok: true, discountCents: 0, label: "" };
  switch (code.toUpperCase()) {
    case "SEVA10":
      return {
        ok: true,
        discountCents: Math.round(subtotalCents * 0.1),
        label: "10% off",
      };
    case "FLAT20":
      return {
        ok: true,
        discountCents: Math.min(2000, subtotalCents),
        label: "$20 off",
      };
    case "KIDSFREE":
      if (childTicketCents === 0)
        return {
          ok: false,
          reason: "KIDSFREE needs at least one child ticket.",
        };
      return { ok: true, discountCents: childTicketCents, label: "Kids free" };
    case "EXPIRED5":
      return { ok: false, reason: "This code expired on 31 Oct 2026." };
    case "MAXEDOUT":
      return { ok: false, reason: "This code has reached its usage limit." };
    default:
      return { ok: false, reason: "That code is not recognised." };
  }
}
