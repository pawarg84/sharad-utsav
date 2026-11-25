import { NextResponse } from "next/server";
import { payBooking, BookingError } from "@/server/bookings";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const booking = await payBooking(id);
    return NextResponse.json({ booking });
  } catch (e) {
    if (e instanceof BookingError)
      return NextResponse.json(
        { error: e.code, message: e.message },
        { status: 404 },
      );
    throw e;
  }
}
