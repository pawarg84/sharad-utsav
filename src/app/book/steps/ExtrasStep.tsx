"use client";
import { State } from "../reducer";
import { FESTIVAL } from "@/domain/types";

interface Props {
  state: State;
  setExtras: (patch: Partial<State["extras"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

function toggle<T>(arr: T[], item: T, eq: (a: T, b: T) => boolean): T[] {
  return arr.some((x) => eq(x, item))
    ? arr.filter((x) => !eq(x, item))
    : [...arr, item];
}

export default function ExtrasStep({
  state,
  setExtras,
  onNext,
  onBack,
}: Props) {
  const attendees = state.slots
    .map((s) => s.person)
    .filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl text-[#C99B24]">Extras</h2>

      <section className="space-y-2 rounded-lg border border-white/20 bg-white/5 p-4">
        <h3 className="font-medium">Dandiya Sticks (pair) — $5 each</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setExtras({ dandiya: Math.max(0, state.extras.dandiya - 1) })
            }
            className="h-8 w-8 rounded border border-[#BC9226] text-[#C99B24]"
          >
            −
          </button>
          <span className="w-6 text-center">{state.extras.dandiya}</span>
          <button
            onClick={() => setExtras({ dandiya: state.extras.dandiya + 1 })}
            className="h-8 w-8 rounded border border-[#BC9226] text-[#C99B24]"
          >
            +
          </button>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-white/20 bg-white/5 p-4">
        <h3 className="font-medium">Dinner Plate — $12 per person, per day</h3>
        {attendees.map((p) => (
          <div key={p.id} className="space-y-1">
            <div className="text-sm text-white/70">
              {p.firstName} {p.lastName}
            </div>
            <div className="flex flex-wrap gap-2">
              {FESTIVAL.dates.map((d) => {
                const on = state.extras.dinners.some(
                  (x) => x.personId === p.id && x.date === d,
                );
                return (
                  <button
                    key={d}
                    onClick={() =>
                      setExtras({
                        dinners: toggle(
                          state.extras.dinners,
                          { personId: p.id, date: d },
                          (a, b) =>
                            a.personId === b.personId && a.date === b.date,
                        ),
                      })
                    }
                    className={`rounded border px-3 py-1 text-sm ${
                      on
                        ? "border-[#C99B24] bg-[#C99B24] text-[#2C2C2C]"
                        : "border-white/20 text-white/70"
                    }`}
                  >
                    {d.slice(5)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3 rounded-lg border border-white/20 bg-white/5 p-4">
        <h3 className="font-medium">Garba Workshop — $20 · Nov 11 & 13 only</h3>
        {attendees.map((p) => (
          <div key={p.id} className="space-y-1">
            <div className="text-sm text-white/70">{p.firstName}</div>
            <div className="flex gap-2">
              {FESTIVAL.workshopDates.map((d) => {
                const on = state.extras.workshops.some(
                  (x) => x.personId === p.id && x.date === d,
                );
                return (
                  <button
                    key={d}
                    onClick={() =>
                      setExtras({
                        workshops: toggle(
                          state.extras.workshops,
                          { personId: p.id, date: d },
                          (a, b) =>
                            a.personId === b.personId && a.date === b.date,
                        ),
                      })
                    }
                    className={`rounded border px-3 py-1 text-sm ${
                      on
                        ? "border-[#C99B24] bg-[#C99B24] text-[#2C2C2C]"
                        : "border-white/20 text-white/70"
                    }`}
                  >
                    {d.slice(5)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="rounded border border-white/20 px-4 py-2"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="rounded bg-[#C99B24] px-6 py-2 font-medium text-[#2C2C2C] hover:bg-[#D1AC3E]"
        >
          Next: Review
        </button>
      </div>
    </div>
  );
}
