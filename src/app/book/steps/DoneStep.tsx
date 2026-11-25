"use client";
import { State } from "../reducer";

export default function DoneStep({ state }: { state: State }) {
  return (
    <div className="space-y-4 text-center mt-10">
      <h2 className="font-serif text-3xl text-[#28A736]">Booking confirmed</h2>
      <p className="text-white/70">Your confirmation ID</p>
      <p className="font-mono text-lg bg-white/5 p-3 rounded border border-white/10">
        {state.bookingId}
      </p>
      <p className="text-sm text-white/50">
        Save this ID. Show it at the door.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 text-[#C99B24] underline hover:text-[#D1AC3E]"
      >
        Make another booking
      </button>
    </div>
  );
}
