"use client";
import { useReducer, useEffect } from "react";
import { reducer, initialState, toInput } from "./reducer";
import TicketStep from "./steps/TicketStep";
import PeopleStep from "./steps/PeopleStep";
import ExtrasStep from "./steps/ExtrasStep";
import ReviewStep from "./steps/ReviewStep";
import PayStep from "./steps/PayStep";
import DoneStep from "./steps/DoneStep";

export default function BookingFlow() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch a fresh quote whenever we enter review/pay, or when inputs change
  useEffect(() => {
    if (state.step !== "review" && state.step !== "pay") return;
    const input = toInput(state);
    if ("error" in input) return;

    let cancelled = false;
    fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.quote) {
          dispatch({ type: "setQuote", quote: data.quote });
        } else if (data.errors && data.errors.length > 0) {
          // Join Zod validation errors or domain errors into a single string
          const errorMessages = data.errors
            .map((e: any) => {
              if (e.path && e.path.length > 0) {
                return `${e.path.join(".")}: ${e.message}`;
              }
              return e.message;
            })
            .join(" • ");

          dispatch({ type: "setError", error: errorMessages });
        }
      })
      .catch(() => {
        /* surfaced in UI via missing quote */
      });
    return () => {
      cancelled = true;
    };
  }, [state.step, state.promoCode, state.slots, state.extras]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="font-serif text-3xl text-[#C99B24]">Sharad Utsav 2026</h1>
      {state.step === "tickets" && (
        <TicketStep
          state={state}
          setCount={(type, count) =>
            dispatch({ type: "setTicketCount", ticketType: type, count })
          }
          onNext={() => dispatch({ type: "go", step: "people" })}
        />
      )}
      {state.step === "people" && (
        <PeopleStep
          state={state}
          setBooker={(person) => dispatch({ type: "setBooker", person })}
          setSlotPerson={(slotId, person) =>
            dispatch({ type: "setSlotPerson", slotId, person })
          }
          setSlotDates={(slotId, dates) =>
            dispatch({ type: "setSlotDates", slotId, dates })
          }
          onNext={() => dispatch({ type: "go", step: "extras" })}
          onBack={() => dispatch({ type: "go", step: "tickets" })}
        />
      )}
      {state.step === "extras" && (
        <ExtrasStep
          state={state}
          setExtras={(patch) => dispatch({ type: "setExtras", extras: patch })}
          onNext={() => dispatch({ type: "go", step: "review" })}
          onBack={() => dispatch({ type: "go", step: "people" })}
        />
      )}
      {state.step === "review" && (
        <ReviewStep
          state={state}
          setPromo={(code) => dispatch({ type: "setPromo", code })}
          onNext={() => dispatch({ type: "go", step: "pay" })}
          onBack={() => dispatch({ type: "go", step: "extras" })}
        />
      )}

      {state.step === "pay" && (
        <PayStep
          state={state}
          onPaid={(id) => dispatch({ type: "booked", bookingId: id })}
          onBack={() => dispatch({ type: "go", step: "review" })}
        />
      )}
      {state.step === "done" && <DoneStep state={state} />}
    </div>
  );
}
