import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createBooking, BookingError } from "@/server/bookings";

export async function POST(req: Request) {
  const body = await req.json();
  const key = req.headers.get("idempotency-key") ?? randomUUID();
  try {
    const booking = await createBooking(body, key);
    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    if (e instanceof BookingError)
      return NextResponse.json(
        { error: e.code, message: e.message },
        { status: 400 },
      );
    throw e;
  }
}
