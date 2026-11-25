"use client";
import { Slot, State } from "../reducer";

const TICKET_ROWS: {
  type: Slot["ticketType"];
  label: string;
  price: string;
  note?: string;
}[] = [
  {
    type: "DAY_ADULT",
    label: "Day Pass – Adult",
    price: "$15/day",
    note: "Ages 12+",
  },
  {
    type: "DAY_CHILD",
    label: "Day Pass – Child",
    price: "$8/day",
    note: "Ages 5–11",
  },
  {
    type: "ALLDAY_ADULT",
    label: "All-Day Pass – Adult",
    price: "$60",
    note: "Sold out",
  },
  {
    type: "ALLDAY_CHILD",
    label: "All-Day Pass – Child",
    price: "$30",
    note: "All 5 days",
  },
  {
    type: "FAMILY",
    label: "Family Pass",
    price: "$40",
    note: "2 adults + 2 children, one day",
  },
];

interface Props {
  state: State;
  setCount: (type: Slot["ticketType"], count: number) => void;
  onNext: () => void;
}

export default function TicketStep({ state, setCount, onNext }: Props) {
  const countOf = (t: Slot["ticketType"]) => {
    if (t === "FAMILY") {
      // Count how many unique familyIds exist
      const familyIds = new Set(
        state.slots.filter((s) => s.familyId).map((s) => s.familyId),
      );
      return familyIds.size;
    }
    return state.slots.filter((s) => s.ticketType === t).length;
  };

  const totalTickets = state.slots.length;

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl text-[#C99B24]">Choose tickets</h2>
      {TICKET_ROWS.map((row) => {
        const soldOut = row.type === "ALLDAY_ADULT";
        const count = countOf(row.type);
        return (
          <div
            key={row.type}
            className={`flex items-center justify-between rounded-lg border p-4 ${soldOut ? "border-white/10 bg-white/[0.03] opacity-60" : "border-white/20 bg-white/5"}`}
          >
            <div>
              <div className="font-medium">{row.label}</div>
              <div className="text-sm text-white/60">
                {row.price}
                {row.note ? ` · ${row.note}` : ""}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                aria-label={`remove ${row.label}`}
                disabled={soldOut || count === 0}
                onClick={() => setCount(row.type, count - 1)}
                className="h-8 w-8 rounded border border-[#BC9226] text-[#C99B24] disabled:opacity-30"
              >
                −
              </button>
              <span className="w-6 text-center">{count}</span>
              <button
                aria-label={`add ${row.label}`}
                disabled={soldOut}
                onClick={() => setCount(row.type, count + 1)}
                className="h-8 w-8 rounded border border-[#BC9226] text-[#C99B24] disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        );
      })}
      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={totalTickets === 0}
          className="rounded bg-[#C99B24] px-6 py-2 font-medium text-[#2C2C2C] hover:bg-[#D1AC3E] disabled:opacity-40"
        >
          Next: Who is coming
        </button>
      </div>
    </div>
  );
}
