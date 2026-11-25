"use client";
import { useState } from "react";
import { State, toInput } from "../reducer";
import { Money } from "@/components/Money";

interface Props {
  state: State;
  onPaid: (bookingId: string) => void;
  onBack: () => void;
}

export default function PayStep({ state, onPaid, onBack }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const input = toInput(state);
      if ("error" in input) throw new Error(input.error);

      const createRes = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "idempotency-key": state.idempotencyKey,
        },
        body: JSON.stringify(input),
      });
      const createJson = await createRes.json();
      if (!createRes.ok)
        throw new Error(createJson.message ?? "Booking failed");
      const bookingId: string = createJson.booking.id;

      const payRes = await fetch(`/api/bookings/${bookingId}/pay`, {
        method: "POST",
      });
      if (!payRes.ok) throw new Error("Payment failed");

      onPaid(bookingId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl text-[#C99B24]">Payment</h2>
      <p className="text-white/70">
        This is a simulated payment for the assessment.
      </p>

      {state.quote && (
        <div className="rounded-lg border border-white/20 bg-white/5 p-4 text-lg">
          Amount due:{" "}
          <strong>
            <Money cents={state.quote.totalCents} />
          </strong>
        </div>
      )}

      {error && (
        <div className="rounded border border-[#EF1F1F]/30 bg-[#EF1F1F]/10 p-3 text-sm text-[#EF1F1F]">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={busy}
          className="rounded border border-white/20 px-4 py-2"
        >
          Back
        </button>
        <button
          onClick={pay}
          disabled={busy}
          className="rounded bg-[#C99B24] px-6 py-2 font-medium text-[#2C2C2C] hover:bg-[#D1AC3E] disabled:opacity-40"
        >
          {busy ? "Processing…" : "Pay now"}
        </button>
      </div>
    </div>
  );
}
