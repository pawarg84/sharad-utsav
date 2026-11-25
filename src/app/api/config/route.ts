import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { FESTIVAL } from "@/domain/types";
import { PRICES, LABELS } from "@/domain/catalogue";

export async function GET() {
  const stock = await db.stock.findMany();
  return NextResponse.json({
    festival: FESTIVAL,
    prices: PRICES,
    labels: LABELS,
    stock,
  });
}
