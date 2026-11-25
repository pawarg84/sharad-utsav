"use client";
import { State } from "../reducer";
import { Money } from "@/components/Money";

interface Props {
  state: State;
  setPromo: (code?: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ReviewStep({ state, setPromo, onNext, onBack }: Props) {
  const q = state.quote;

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl text-[#C99B24]">Review</h2>

      {!q && !state.error && (
        <p className="text-white/60" role="status">
          Loading quote…
        </p>
      )}

      {state.error && (
        <div className="rounded border border-[#EF1F1F]/30 bg-[#EF1F1F]/10 p-3 text-sm text-[#EF1F1F]">
          {state.error}
        </div>
      )}

      {q && q.lineItems.length === 0 && (
        <p className="text-white/60">
          Nothing selected yet — go back and add tickets.
        </p>
      )}

      {q && q.lineItems.length > 0 && (
        <>
          <section className="space-y-2 rounded-lg border border-white/20 bg-white/5 p-4">
            {q.lineItems.map((l, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  {l.label} × {l.qty}
                </span>
                <Money cents={l.totalCents} />
              </div>
            ))}
          </section>

          <section className="space-y-2 rounded-lg border border-white/20 bg-white/5 p-4">
            <label htmlFor="promo" className="text-sm text-white/70">
              Promo code
            </label>
            <input
              id="promo"
              className="w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white"
              value={state.promoCode ?? ""}
              onChange={(e) => setPromo(e.target.value.trim() || undefined)}
              placeholder="Optional"
              autoComplete="off"
            />
            {q.promoError && (
              <p className="text-sm text-[#EF1F1F]" role="alert">
                {q.promoError}
              </p>
            )}
          </section>

          <section className="space-y-1 rounded-lg border border-white/20 bg-white/5 p-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <Money cents={q.subtotalCents} />
            </div>
            <div className="flex justify-between text-sm">
              <span>Discount</span>
              <Money cents={-q.discountCents} />
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 text-lg font-medium">
              <span>Total</span>
              <Money cents={q.totalCents} />
            </div>
          </section>
        </>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="rounded border border-white/20 px-4 py-2"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!q || q.lineItems.length === 0}
          className="rounded bg-[#C99B24] px-6 py-2 font-medium text-[#2C2C2C] hover:bg-[#D1AC3E] disabled:opacity-40"
        >
          Next: Pay
        </button>
      </div>
    </div>
  );
}
