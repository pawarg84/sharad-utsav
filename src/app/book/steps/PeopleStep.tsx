"use client";
import { State, Slot } from "../reducer";
import { Person, FESTIVAL } from "@/domain/types";
import { bandOnFestival, isBookerOldEnough } from "@/domain/age";

interface Props {
  state: State;
  setBooker: (p: Person) => void;
  setSlotPerson: (slotId: string, p: Person) => void;
  setSlotDates: (slotId: string, dates: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

function PersonFields({
  value,
  onChange,
  isBooker,
}: {
  value: Person;
  onChange: (p: Person) => void;
  isBooker: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <input
        className="rounded border border-white/20 bg-white/5 px-3 py-2 text-white"
        placeholder="First name"
        value={value.firstName}
        onChange={(e) => onChange({ ...value, firstName: e.target.value })}
      />
      <input
        className="rounded border border-white/20 bg-white/5 px-3 py-2 text-white"
        placeholder="Last name"
        value={value.lastName}
        onChange={(e) => onChange({ ...value, lastName: e.target.value })}
      />
      <input
        type="date"
        className="rounded border border-white/20 bg-white/5 px-3 py-2 text-white"
        value={value.dob}
        min="1900-01-01"
        max="2026-12-31"
        onChange={(e) => {
          const val = e.target.value;
          if (val.length > 10) return;
          onChange({ ...value, dob: val.slice(0, 10) });
        }}
      />
      {isBooker && (
        <input
          type="email"
          className="rounded border border-white/20 bg-white/5 px-3 py-2 text-white"
          placeholder="Email"
          value={value.email ?? ""}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
        />
      )}
    </div>
  );
}

function blankPerson(): Person {
  return { id: crypto.randomUUID(), firstName: "", lastName: "", dob: "" };
}

export default function PeopleStep({
  state,
  setBooker,
  setSlotPerson,
  setSlotDates,
  onNext,
  onBack,
}: Props) {
  const booker = state.booker ?? blankPerson();

  const today = new Date().toISOString().slice(0, 10);
  const bookerIsAdult = state.booker?.dob
    ? isBookerOldEnough(state.booker.dob, today)
    : false;

  const attendeesAreValid = state.slots.every((s) => {
    if (!s.person?.firstName || !s.person.lastName || !s.person.dob)
      return false;

    if (
      (s.ticketType === "DAY_ADULT" || s.ticketType === "DAY_CHILD") &&
      s.dates.length === 0
    ) {
      return false;
    }

    const band = bandOnFestival(s.person.dob);
    if (s.ticketType === "DAY_ADULT" || s.ticketType === "ALLDAY_ADULT") {
      if (band !== "adult") return false;
    }
    if (s.ticketType === "DAY_CHILD" || s.ticketType === "ALLDAY_CHILD") {
      if (band !== "child") return false;
    }
    return true;
  });

  const allFilled =
    !!state.booker &&
    !!state.booker.firstName &&
    !!state.booker.lastName &&
    bookerIsAdult &&
    attendeesAreValid;

  const bookerBand = state.booker?.dob
    ? bandOnFestival(state.booker.dob)
    : null;

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl text-[#C99B24]">Who is coming</h2>

      <section className="space-y-3 rounded-lg border border-white/20 bg-white/5 p-4">
        <h3 className="flex items-center gap-2 font-medium">
          You (the booker)
          {bookerBand && (
            <span
              className={`rounded px-2 py-0.5 text-xs ${
                bookerBand === "adult"
                  ? "bg-green-900/40 text-green-300"
                  : bookerBand === "child"
                    ? "bg-yellow-900/40 text-yellow-200"
                    : "bg-blue-900/40 text-blue-200"
              }`}
            >
              {bookerBand}
            </span>
          )}
        </h3>
        <PersonFields value={booker} onChange={setBooker} isBooker />
        {state.booker?.dob && !bookerIsAdult && (
          <p className="text-sm text-[#EF1F1F]">Booker must be 18 or older.</p>
        )}
      </section>

      {state.slots.map((slot, i) => {
        const p = slot.person ?? blankPerson();
        const band = p.dob ? bandOnFestival(p.dob) : null;
        const isDayPass =
          slot.ticketType === "DAY_ADULT" || slot.ticketType === "DAY_CHILD";

        const isAgeMismatch =
          p.dob &&
          (((slot.ticketType === "DAY_ADULT" ||
            slot.ticketType === "ALLDAY_ADULT") &&
            band !== "adult") ||
            ((slot.ticketType === "DAY_CHILD" ||
              slot.ticketType === "ALLDAY_CHILD") &&
              band !== "child"));

        return (
          <section
            key={slot.id}
            className={`space-y-3 rounded-lg border p-4 ${
              isAgeMismatch
                ? "border-[#EF1F1F]/50 bg-[#EF1F1F]/5"
                : "border-white/20 bg-white/5"
            }`}
          >
            <h3 className="flex items-center gap-2 font-medium">
              Attendee {i + 1}
              <span className="rounded bg-[#BC9226]/20 px-2 py-0.5 text-xs text-[#D1AC3E]">
                {slot.familyId
                  ? "family pass"
                  : slot.ticketType.replace(/_/g, " ").toLowerCase()}
              </span>
              {band && (
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    band === "adult"
                      ? "bg-green-900/40 text-green-300"
                      : band === "child"
                        ? "bg-yellow-900/40 text-yellow-200"
                        : "bg-blue-900/40 text-blue-200"
                  }`}
                >
                  {band}
                </span>
              )}
            </h3>

            <PersonFields
              value={p}
              onChange={(np) => setSlotPerson(slot.id, np)}
              isBooker={false}
            />

            {isAgeMismatch && (
              <p className="text-sm text-[#EF1F1F]">
                Age mismatch: This person is a {band}, but the ticket is for an{" "}
                {slot.ticketType.includes("ADULT") ? "adult" : "child"}.
              </p>
            )}

            {isDayPass && (
              <div className="mt-3 border-t border-white/10 pt-3">
                <div className="text-sm text-white/70 mb-2">
                  {slot.familyId
                    ? "Select the day for this Family Pass:"
                    : "Select days for this ticket:"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {FESTIVAL.dates.map((d) => {
                    const isSelected = slot.dates.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          // If it's a family pass, all 4 slots must share the exact same date
                          if (slot.familyId) {
                            // We only need to update the dates for this slot, but we'll update all family slots in the reducer
                            setSlotDates(slot.id, isSelected ? [] : [d]);
                          } else {
                            const newDates = isSelected
                              ? slot.dates.filter((x) => x !== d)
                              : [...slot.dates, d];
                            setSlotDates(slot.id, newDates);
                          }
                        }}
                        className={`px-3 py-1 text-sm rounded border transition-colors ${
                          isSelected
                            ? "bg-[#C99B24] text-[#2C2C2C] border-[#C99B24]"
                            : "border-white/20 text-white/70 hover:border-[#D1AC3E]"
                        }`}
                      >
                        {d.slice(5)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        );
      })}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="rounded border border-white/20 px-4 py-2"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!allFilled}
          className="rounded bg-[#C99B24] px-6 py-2 font-medium text-[#2C2C2C] hover:bg-[#D1AC3E] disabled:opacity-40"
        >
          Next: Extras
        </button>
      </div>
    </div>
  );
}
