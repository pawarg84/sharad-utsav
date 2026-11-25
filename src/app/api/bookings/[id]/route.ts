import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking)
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ booking });
}
